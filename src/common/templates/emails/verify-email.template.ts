
export const verifyEmailTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #ffffff; margin: 0; padding: 0; -webkit-text-size-adjust: none;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; width: 100%; margin: 0; padding: 0;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 570px; margin: 0; padding: 0;">
          <!-- Email Body -->
          <tr>
            <td style="padding: 60px 20px; text-align: center;">
              <a href="${process.env.FRONTEND_URL}" style="font-size: 28px; font-weight: 800; color: #000; text-decoration: none; letter-spacing: -0.02em;">
                Plynk
              </a>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 40px;">
              <h1 style="font-size: 24px; font-weight: 700; color: #111827; margin-top: 0; text-align: center; letter-spacing: -0.02em;">
                Verify your account
              </h1>
              <p style="font-size: 16px; line-height: 24px; color: #4b5563; margin-bottom: 40px; text-align: center;">
                Hello ${name}, welcome to Plynk. Use the code below to securely verify your email address.
              </p>
              
              <!-- Code Box -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" role="presentation">
                <tr>
                  <td align="center" style="background-color: #f9fafb; padding: 30px; border-radius: 16px; border: 1px solid #f3f4f6;">
                    <span style="font-size: 42px; font-weight: 800; color: #000; letter-spacing: 12px; margin-left: 12px;">
                      ${otp}
                    </span>
                  </td>
                </tr>
              </table>

              <p style="font-size: 14px; line-height: 20px; color: #6b7280; margin-top: 40px; text-align: center;">
                This code is valid for <strong>30 minutes</strong>. 
                If you didn't create an account, you can safely ignore this email.
              </p>
              
              <hr style="border: none; border-top: 1px solid #f3f4f6; margin: 40px 0;">
              
              <p style="font-size: 12px; line-height: 18px; color: #9ca3af; text-align: center;">
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
