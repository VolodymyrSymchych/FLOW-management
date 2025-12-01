interface EmailTemplateProps {
    userName: string;
    verificationUrl: string;
}

export function VerificationEmailTemplate({ userName, verificationUrl }: EmailTemplateProps) {
    return `
<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Підтвердження Email - Flow Management</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh;">
  <table width="100%" cellpadding="0" cellspacing="0" style="min-height: 100vh; padding: 40px 20px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border-radius: 24px; overflow: hidden; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);">
          
          <!-- Header with Gradient -->
          <tr>
            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 40px 60px 40px; text-align: center; position: relative;">
              <div style="background: rgba(255, 255, 255, 0.1); width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(10px); border: 2px solid rgba(255, 255, 255, 0.2);">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M22 6l-10 7L2 6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <h1 style="margin: 0; color: white; font-size: 32px; font-weight: 700; text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                Flow Management
              </h1>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 40px;">
              <h2 style="margin: 0 0 20px 0; color: #1a202c; font-size: 24px; font-weight: 600;">
                Вітаємо, ${userName}! 👋
              </h2>
              
              <p style="margin: 0 0 20px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Дякуємо за реєстрацію в <strong>Flow Management</strong>! Ми раді бачити вас у нашій команді.
              </p>

              <p style="margin: 0 0 30px 0; color: #4a5568; font-size: 16px; line-height: 1.6;">
                Для завершення реєстрації та активації вашого акаунту, будь ласка, підтвердіть вашу email адресу, натиснувши на кнопку нижче:
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 20px 0;">
                    <a href="${verificationUrl}" style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 16px 48px; border-radius: 12px; font-size: 16px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); transition: transform 0.2s;">
                      ✓ Підтвердити Email
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Alternative Link -->
              <div style="margin: 30px 0; padding: 20px; background: #f7fafc; border-radius: 12px; border-left: 4px solid #667eea;">
                <p style="margin: 0 0 10px 0; color: #2d3748; font-size: 14px; font-weight: 600;">
                  Не працює кнопка?
                </p>
                <p style="margin: 0; color: #4a5568; font-size: 14px; line-height: 1.5;">
                  Скопіюйте та вставте це посилання у ваш браузер:
                </p>
                <p style="margin: 10px 0 0 0; word-break: break-all;">
                  <a href="${verificationUrl}" style="color: #667eea; text-decoration: none; font-size: 13px;">
                    ${verificationUrl}
                  </a>
                </p>
              </div>

              <!-- Security Notice -->
              <div style="margin: 30px 0 0 0; padding: 16px; background: #fff5f5; border-radius: 12px; border-left: 4px solid #fc8181;">
                <p style="margin: 0; color: #742a2a; font-size: 14px; line-height: 1.5;">
                  <strong>🔒 Безпека:</strong> Якщо ви не реєструвалися на Flow Management, просто ігноруйте цей лист. Посилання для верифікації дійсне протягом 24 годин.
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 30px 40px; background: #f7fafc; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 10px 0; color: #718096; font-size: 14px; text-align: center;">
                З повагою,<br>
                <strong style="color: #2d3748;">Команда Flow Management</strong>
              </p>
              
              <p style="margin: 20px 0 0 0; color: #a0aec0; font-size: 12px; text-align: center; line-height: 1.5;">
                Цей лист було відправлено автоматично. Будь ласка, не відповідайте на нього.<br>
                © ${new Date().getFullYear()} Flow Management. Всі права захищені.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

// Plain text version for email clients that don't support HTML
export function VerificationEmailPlainText({ userName, verificationUrl }: EmailTemplateProps) {
    return `
Вітаємо, ${userName}!

Дякуємо за реєстрацію в Flow Management!

Для завершення реєстрації та активації вашого акаунту, будь ласка, підтвердіть вашу email адресу, перейшовши за посиланням:

${verificationUrl}

Якщо ви не реєструвалися на Flow Management, просто ігноруйте цей лист.

Посилання для верифікації дійсне протягом 24 годин.

З повагою,
Команда Flow Management

© ${new Date().getFullYear()} Flow Management. Всі права захищені.
  `.trim();
}
