import { Resend } from "resend"
import { createMagicLinkToken } from "./magic-link"

function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

export async function sendMagicLinkEmail(email: string, firstName: string | null) {
  const token = await createMagicLinkToken(email)
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  const magicLinkUrl = `${appUrl}/api/auth/magic-link/verify?token=${token}`
  const name = firstName || email.split("@")[0]

  // Default to Resend's verified sender until areafit.xyz DNS is configured
  const fromAddress = process.env.RESEND_FROM || "AreaFit <onboarding@resend.dev>"

  const { error } = await getResend().emails.send({
    from: fromAddress,
    to: email,
    subject: "Tu acceso al Dashboard AreaFit",
    html: buildEmailHtml(name, magicLinkUrl),
  })

  if (error) {
    console.error("Resend error:", error)
    throw new Error("Failed to send magic link email")
  }
}

function buildEmailHtml(name: string, url: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f5f7fa;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f7fa;padding:48px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:32px;">
              <div style="display:inline-flex;align-items:center;gap:4px;">
                <span style="font-size:28px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">area</span>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="#00AEEF" style="vertical-align:middle;">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
                <span style="font-size:28px;font-weight:800;color:#18181b;letter-spacing:-0.02em;">fit</span>
              </div>
            </td>
          </tr>
          <!-- Card -->
          <tr>
            <td>
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.04),0 0 0 1px rgba(0,0,0,0.04);">
                <!-- Blue accent bar -->
                <tr>
                  <td style="height:4px;background:linear-gradient(90deg,#00AEEF,#2DD4BF);font-size:0;line-height:0;">&nbsp;</td>
                </tr>
                <tr>
                  <td style="padding:40px 40px 36px;">
                    <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#18181b;text-align:center;letter-spacing:-0.01em;">
                      Hola, ${name} 👋
                    </h1>
                    <p style="margin:0 0 32px;font-size:15px;color:#71717a;text-align:center;line-height:1.6;">
                      Solicitaste acceso al Dashboard de AreaFit.<br>Usa el boton para ingresar de forma segura.
                    </p>
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td align="center">
                          <a href="${url}" style="display:inline-block;padding:14px 40px;background-color:#00AEEF;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;border-radius:12px;letter-spacing:0.01em;box-shadow:0 2px 4px rgba(0,174,239,0.3);">
                            Acceder al Dashboard
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="margin:28px 0 0;font-size:13px;color:#a1a1aa;text-align:center;line-height:1.5;">
                      Este link expira en <strong style="color:#71717a;">10 minutos</strong>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:0 40px;">
                    <div style="border-top:1px solid #f0f0f0;"></div>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px 40px 28px;">
                    <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;line-height:1.6;">
                      Si el boton no funciona, copia y pega este link en tu navegador:
                    </p>
                    <p style="margin:8px 0 0;font-size:11px;text-align:center;word-break:break-all;">
                      <a href="${url}" style="color:#00AEEF;">${url}</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:24px 0 0;">
              <p style="margin:0;font-size:12px;color:#a1a1aa;text-align:center;">
                AreaFit Dashboard
              </p>
              <p style="margin:4px 0 0;font-size:11px;color:#d4d4d8;text-align:center;">
                Email automatico. No respondas a este mensaje.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}
