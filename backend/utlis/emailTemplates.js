const emailTemplate = ({ role, name, email, password }) => {
  const siteUrl = new URL(process.env.FRONTEND_URL || 'http://localhost:5173').origin;
  return `
    <div style="background-color: #f4f4f4; padding: 30px; font-family: 'Segoe UI', sans-serif;">
      <div style="max-width: 600px; margin: auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <div style="background-color: #004080; color: #ffffff; padding: 20px;">
          <h2 style="margin: 0;">Welcome to CPMS</h2>
          <p style="margin: 5px 0 0;">College Placement Management System</p>
        </div>
        
        <div style="padding: 30px;">
          <p style="font-size: 16px;">Hello <strong>${name}</strong>,</p>

          <p style="font-size: 15px; line-height: 1.6;">
            We're excited to welcome you onboard as a <strong>${role}</strong> in our College Placement Management System (CPMS).
            This platform helps streamline the placement process and enhances coordination between students, TPOs, and management.
          </p>

          <div style="background-color: #f0f4f8; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px;">Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> ${password}</p>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${siteUrl}" target="_blank"
               style="background-color: #004080; color: #ffffff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: bold;">
              Log In to CPMS
            </a>
          </div>

          <p style="font-size: 14px; color: #555;">Please change your password after logging in for the first time and keep your credentials safe.</p>

          <p style="font-size: 14px;">If you did not request this registration, please contact our support team immediately.</p>

          <p style="font-size: 14px; margin-top: 30px;">Best regards,<br>Raj</p>
        </div>

        <div style="background-color: #f0f0f0; text-align: center; padding: 15px; font-size: 12px; color: #777;">
          &copy; ${new Date().getFullYear()} CPMS. All rights reserved.
        </div>
      </div>
    </div>
  `;
};

module.exports = emailTemplate;
