
export const resetPasswordTemplate = (name: string, resetUrl: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f4f4f7; margin: 0; padding: 0; -webkit-text-size-adjust: none;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #f4f4f7; width: 100%; margin: 0; padding: 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 570px; margin: 0; padding: 0;">
          <!-- Email Body -->
          <tr>
            <td style="padding: 45px 0; text-align: center;">
              <a href="${process.env.FRONTEND_URL}" style="font-size: 24px; font-weight: bold; color: #000; text-decoration: none;">
                Plynk
              </a>
            </td>
          </tr>
          <tr>
            <td style="background-color: #ffffff; padding: 45px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
              <h1 style="font-size: 22px; font-weight: bold; color: #1f2937; margin-top: 0; text-align: left;">
                Reset your password
              </h1>
              <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 30px;">
                Hello ${name},<br><br>
                We received a request to reset the password for your Plynk account. No changes have been made to your account yet.
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center">
                    <a href="${resetUrl}" target="_blank" style="display: inline-block; background-color: #d04500ff; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 28px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      Reset Password
                    </a>
                  </td>
                </tr>
              </table>
              <p style="font-size: 14px; line-height: 20px; color: #6b7280; margin-top: 30px;">
                This password reset link <strong>will expire in 30 minutes</strong>.
              </p>
              <p style="font-size: 14px; line-height: 20px; color: #6b7280;">
                If you did not request a password reset, please ignore this email or contact support if you have questions.
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
              <p style="font-size: 12px; line-height: 18px; color: #9ca3af;">
                If you're having trouble clicking the "Reset Password" button, copy and paste the URL below into your web browser:
                <br>
                <a href="${resetUrl}" style="color: #3b82f6; text-decoration: underline;">${resetUrl}</a>
              </p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="padding: 30px; text-align: center;">
              <p style="font-size: 12px; color: #9ca3af;">
                &copy; ${new Date().getFullYear()} Plynk. All rights reserved.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;
