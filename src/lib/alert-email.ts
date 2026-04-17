import { Resend } from "resend";

const ALERT_TO = process.env.ALERT_TO_EMAIL || "pablo.loyudice@gmail.com";
const ALERT_FROM = process.env.ALERT_FROM_EMAIL || "AreaFit Alertas <onboarding@resend.dev>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export interface ErrorAlertDetails {
  message: string;
  path?: string;
  method?: string;
  statusCode?: number;
  userEmail?: string;
  referer?: string;
  requestBody?: string;
  query?: string;
  stack?: string;
  context?: Record<string, unknown>;
  timestamp?: string;
}

export async function sendErrorAlert(
  subject: string,
  details: ErrorAlertDetails
): Promise<void> {
  const resend = getResend();
  if (!resend) {
    console.warn("[ALERT] No RESEND_API_KEY — alert email not sent:", subject);
    return;
  }

  const ts = details.timestamp || new Date().toISOString();

  try {
    await resend.emails.send({
      from: ALERT_FROM,
      to: ALERT_TO,
      subject: `[PSI Backoffice] ${subject}`,
      html: buildAlertHtml(subject, { ...details, timestamp: ts }),
    });
  } catch (err) {
    // Don't throw — alerting failure shouldn't crash the app
    console.error("[ALERT] Failed to send alert email:", err);
  }
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildAlertHtml(subject: string, d: ErrorAlertDetails): string {
  const rows: string[] = [];

  const addRow = (label: string, value: string | undefined | null, color?: string) => {
    if (!value) return;
    rows.push(`
      <tr>
        <td style="padding:6px 12px;font-size:12px;color:#71717a;font-weight:600;white-space:nowrap;vertical-align:top;">${label}</td>
        <td style="padding:6px 12px;font-size:13px;color:${color || '#18181b'};word-break:break-all;">${value}</td>
      </tr>
    `);
  };

  addRow("Timestamp", d.timestamp);
  addRow("Path", d.path);
  addRow("Method", d.method);
  addRow("Status", d.statusCode?.toString(), d.statusCode && d.statusCode >= 500 ? "#dc2626" : undefined);
  addRow("Usuario", d.userEmail);
  addRow("Pagina", d.referer);
  addRow("Query", d.query);
  addRow("Message", d.message, "#dc2626");

  if (d.requestBody) {
    addRow("Request Body", `<pre style="margin:0;font-size:11px;white-space:pre-wrap;max-height:200px;overflow:auto;">${escapeHtml(d.requestBody)}</pre>`);
  }

  if (d.context) {
    addRow("Context", `<pre style="margin:0;font-size:11px;white-space:pre-wrap;">${JSON.stringify(d.context, null, 2)}</pre>`);
  }

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background-color:#fafafa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fafafa;padding:32px 20px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;">
        <tr><td>
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.08);">
            <tr><td style="height:4px;background:#dc2626;font-size:0;">&nbsp;</td></tr>
            <tr><td style="padding:24px 24px 16px;">
              <h2 style="margin:0;font-size:16px;color:#18181b;">${subject}</h2>
            </td></tr>
            <tr><td style="padding:0 24px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e5e5e5;border-radius:8px;overflow:hidden;">
                ${rows.join("")}
              </table>
            </td></tr>
            ${d.stack ? `
            <tr><td style="padding:0 24px 24px;">
              <details>
                <summary style="font-size:12px;color:#71717a;cursor:pointer;margin-bottom:8px;">Stack trace</summary>
                <pre style="margin:0;padding:12px;background:#f5f5f5;border-radius:8px;font-size:11px;overflow-x:auto;color:#525252;white-space:pre-wrap;">${d.stack}</pre>
              </details>
            </td></tr>` : ""}
            <tr><td style="padding:12px 24px;border-top:1px solid #f0f0f0;">
              <p style="margin:0;font-size:11px;color:#a1a1aa;text-align:center;">
                Psi Mammoliti Backoffice — Alerta automatica
              </p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
