import { db } from "./lib/client"

/**
 * Group messages into conversations using a single SQL window query.
 * Strategy: partition messages by contact_email, order by created_at, detect gaps > 30min.
 * This is ~100x faster than iterating in JS.
 */

const GAP_MINUTES = 30

export async function seedConversations() {
  console.log("[conversations] Computing conversation groups via SQL...")

  // Use a regular (non-temp) table so it persists across connections in the pool
  await db.$executeRawUnsafe(`
    DROP TABLE IF EXISTS _tmp_msg_groups;
  `)

  await db.$executeRawUnsafe(`
    CREATE TABLE _tmp_msg_groups AS
    WITH gaps AS (
      SELECT
        id,
        contact_email,
        created_at,
        user_text,
        category,
        CASE
          WHEN LAG(created_at) OVER (PARTITION BY contact_email ORDER BY created_at) IS NULL THEN 1
          WHEN EXTRACT(EPOCH FROM (created_at - LAG(created_at) OVER (PARTITION BY contact_email ORDER BY created_at))) > ${GAP_MINUTES * 60} THEN 1
          ELSE 0
        END AS is_new_group
      FROM messages
      WHERE contact_email IS NOT NULL
    ),
    grouped AS (
      SELECT
        id,
        contact_email,
        created_at,
        user_text,
        category,
        SUM(is_new_group) OVER (PARTITION BY contact_email ORDER BY created_at) AS group_num
      FROM gaps
    )
    SELECT * FROM grouped;
  `)

  const msgCount = await db.$queryRaw<Array<{ count: bigint }>>`
    SELECT COUNT(*)::bigint AS count FROM _tmp_msg_groups
  `
  console.log(`[conversations] Grouped ${Number(msgCount[0].count)} messages`)

  // Aggregate groups to create Conversation rows
  console.log("[conversations] Aggregating groups...")
  const groups = await db.$queryRaw<
    Array<{
      contact_email: string
      group_num: number
      message_ids: string[]
      message_count: bigint
      first_message_at: Date
      last_message_at: Date
      last_user_text: string | null
      dominant_category: string | null
    }>
  >`
    SELECT
      contact_email,
      group_num::int,
      array_agg(id ORDER BY created_at) AS message_ids,
      COUNT(*)::bigint AS message_count,
      MIN(created_at) AS first_message_at,
      MAX(created_at) AS last_message_at,
      (
        SELECT user_text
        FROM _tmp_msg_groups g2
        WHERE g2.contact_email = g.contact_email
          AND g2.group_num = g.group_num
          AND g2.user_text IS NOT NULL
        ORDER BY g2.created_at DESC
        LIMIT 1
      ) AS last_user_text,
      (
        SELECT category
        FROM _tmp_msg_groups g3
        WHERE g3.contact_email = g.contact_email
          AND g3.group_num = g.group_num
          AND g3.category IS NOT NULL
        GROUP BY category
        ORDER BY COUNT(*) DESC
        LIMIT 1
      ) AS dominant_category
    FROM _tmp_msg_groups g
    GROUP BY contact_email, group_num
  `

  console.log(`[conversations] Found ${groups.length} conversation groups`)

  // Load contacts to get center info
  const contacts = await db.contact.findMany({
    select: {
      id: true,
      email: true,
      centerId: true,
      center: { select: { isWhatsapp: true } },
    },
  })
  const contactByEmail = new Map(
    contacts.map((c) => [
      c.email,
      {
        id: c.id,
        centerId: c.centerId,
        channel: c.center?.isWhatsapp ? "whatsapp" : "instagram",
      },
    ])
  )

  // Insert conversations in batches
  console.log("[conversations] Inserting conversations...")
  const BATCH_SIZE = 500
  let inserted = 0
  for (let i = 0; i < groups.length; i += BATCH_SIZE) {
    const batch = groups.slice(i, i + BATCH_SIZE)
    const convs = batch.map((g) => {
      const info = contactByEmail.get(g.contact_email)
      return {
        contactEmail: g.contact_email,
        contactId: info?.id ?? null,
        centerId: info?.centerId ?? null,
        channel: info?.channel ?? "unknown",
        messageCount: Number(g.message_count),
        firstMessageAt: g.first_message_at,
        lastMessageAt: g.last_message_at,
        lastUserText: g.last_user_text?.slice(0, 200) ?? null,
        category: g.dominant_category,
        status: "closed" as const,
      }
    })
    await db.conversation.createMany({ data: convs })
    inserted += convs.length

    // Update messages to link to conversation_id
    // Need to match created conv back to messages - re-query by unique (email, firstAt)
    const createdConvs = await db.conversation.findMany({
      where: {
        OR: batch.map((g) => ({
          contactEmail: g.contact_email,
          firstMessageAt: g.first_message_at,
        })),
      },
      select: { id: true, contactEmail: true, firstMessageAt: true },
    })
    const convKeyMap = new Map(
      createdConvs.map((c) => [`${c.contactEmail}|${c.firstMessageAt.toISOString()}`, c.id])
    )

    for (const g of batch) {
      const key = `${g.contact_email}|${g.first_message_at.toISOString()}`
      const convId = convKeyMap.get(key)
      if (!convId) continue
      await db.message.updateMany({
        where: { id: { in: g.message_ids } },
        data: { conversationId: convId },
      })
    }

    console.log(`[conversations] Inserted ${inserted}/${groups.length}...`)
  }

  // Cleanup
  await db.$executeRawUnsafe(`DROP TABLE _tmp_msg_groups`)

  console.log(`[conversations] Done. Created ${inserted} conversations`)
}

if (require.main === module) {
  seedConversations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err)
      process.exit(1)
    })
}
