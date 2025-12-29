"""
Email Service - Modular SMTP-based email sending
Works with any SMTP provider (Gmail, AWS SES, SendGrid, etc.)
"""
import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

from app.config import settings

logger = logging.getLogger(__name__)


class EmailService:
    """Modular email service with HTML templates"""

    def __init__(self):
        self.smtp_host = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_user = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL or settings.SMTP_USER
        self.from_name = settings.SMTP_FROM_NAME
        self.use_tls = settings.SMTP_USE_TLS
        self.frontend_url = settings.FRONTEND_URL

    @property
    def is_configured(self) -> bool:
        """Check if email is properly configured"""
        return settings.email_enabled

    async def _send_email(self, to_email: str, subject: str, html_content: str) -> bool:
        """Send an email using SMTP"""
        if not self.is_configured:
            logger.warning(f"Email not configured. Would have sent to {to_email}: {subject}")
            return False

        try:
            message = MIMEMultipart("alternative")
            message["Subject"] = subject
            message["From"] = f"{self.from_name} <{self.from_email}>"
            message["To"] = to_email

            # Create plain text version
            plain_text = self._html_to_plain(html_content)
            message.attach(MIMEText(plain_text, "plain"))
            message.attach(MIMEText(html_content, "html"))

            await aiosmtplib.send(
                message,
                hostname=self.smtp_host,
                port=self.smtp_port,
                username=self.smtp_user,
                password=self.smtp_password,
                start_tls=self.use_tls,
            )

            logger.info(f"Email sent successfully to {to_email}: {subject}")
            return True

        except Exception as e:
            logger.error(f"Failed to send email to {to_email}: {str(e)}")
            return False

    def _html_to_plain(self, html: str) -> str:
        """Simple HTML to plain text conversion"""
        import re
        text = re.sub(r'<br\s*/?>', '\n', html)
        text = re.sub(r'<[^>]+>', '', text)
        text = re.sub(r'\n\s*\n', '\n\n', text)
        return text.strip()

    def _base_template(self, content: str) -> str:
        """Base HTML email template"""
        return f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            margin: 0;
            padding: 0;
            background-color: #f5f5f5;
        }}
        .container {{
            max-width: 600px;
            margin: 0 auto;
            padding: 40px 20px;
        }}
        .card {{
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            padding: 40px;
        }}
        .header {{
            text-align: center;
            margin-bottom: 30px;
        }}
        .logo {{
            font-size: 24px;
            font-weight: bold;
            color: #6366f1;
        }}
        .content {{
            margin-bottom: 30px;
        }}
        .button {{
            display: inline-block;
            background-color: #6366f1;
            color: #ffffff !important;
            text-decoration: none;
            padding: 14px 32px;
            border-radius: 6px;
            font-weight: 600;
            margin: 20px 0;
        }}
        .button:hover {{
            background-color: #4f46e5;
        }}
        .footer {{
            text-align: center;
            color: #666;
            font-size: 14px;
            margin-top: 30px;
            padding-top: 20px;
            border-top: 1px solid #eee;
        }}
        .warning {{
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            border-radius: 6px;
            padding: 12px 16px;
            margin: 20px 0;
            font-size: 14px;
            color: #92400e;
        }}
        .code {{
            background-color: #f3f4f6;
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
        }}
    </style>
</head>
<body>
    <div class="container">
        <div class="card">
            <div class="header">
                <div class="logo">Eigensparse</div>
            </div>
            {content}
            <div class="footer">
                <p>&copy; 2025 Eigensparse. All rights reserved.</p>
                <p>This email was sent because of an action on your account.</p>
            </div>
        </div>
    </div>
</body>
</html>
"""

    async def send_verification_email(self, email: str, name: str, token: str, account_type: str = "user") -> bool:
        """Send email verification link"""
        verify_url = f"{self.frontend_url}/verify-email?token={token}&type={account_type}"

        content = f"""
            <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hi {name},</p>
                <p>Thank you for registering with Eigensparse. Please verify your email address to activate your account.</p>
                <p style="text-align: center;">
                    <a href="{verify_url}" class="button">Verify Email</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{verify_url}</p>
                <div class="warning">
                    This link will expire in {settings.VERIFICATION_EXPIRE_HOURS} hours.
                </div>
            </div>
        """

        html = self._base_template(content)
        return await self._send_email(email, "Verify Your Email - Eigensparse", html)

    async def send_password_reset_email(self, email: str, name: str, token: str, account_type: str = "user") -> bool:
        """Send password reset link"""
        reset_url = f"{self.frontend_url}/reset-password?token={token}&type={account_type}"

        content = f"""
            <div class="content">
                <h2>Reset Your Password</h2>
                <p>Hi {name},</p>
                <p>We received a request to reset your password. Click the button below to create a new password.</p>
                <p style="text-align: center;">
                    <a href="{reset_url}" class="button">Reset Password</a>
                </p>
                <p>Or copy and paste this link into your browser:</p>
                <p style="word-break: break-all; color: #666; font-size: 14px;">{reset_url}</p>
                <div class="warning">
                    This link will expire in {settings.RESET_EXPIRE_MINUTES} minutes. If you didn't request this, you can safely ignore this email.
                </div>
            </div>
        """

        html = self._base_template(content)
        return await self._send_email(email, "Reset Your Password - Eigensparse", html)

    async def send_welcome_email(self, email: str, name: str, account_type: str = "user") -> bool:
        """Send welcome email after verification"""
        dashboard_url = f"{self.frontend_url}/{'fiduciary-dashboard' if account_type == 'fiduciary' else 'dashboard'}"

        account_label = "organization" if account_type == "fiduciary" else "user"

        content = f"""
            <div class="content">
                <h2>Welcome to Eigensparse!</h2>
                <p>Hi {name},</p>
                <p>Your email has been verified and your {account_label} account is now active.</p>
                <p>Eigensparse helps you manage consent transparently and stay compliant with privacy regulations like DPDP Act 2023 and GDPR.</p>
                <p style="text-align: center;">
                    <a href="{dashboard_url}" class="button">Go to Dashboard</a>
                </p>
                <p>If you have any questions, feel free to reach out to our support team.</p>
            </div>
        """

        html = self._base_template(content)
        return await self._send_email(email, "Welcome to Eigensparse!", html)

    async def send_password_changed_email(self, email: str, name: str) -> bool:
        """Send notification that password was changed"""
        content = f"""
            <div class="content">
                <h2>Password Changed</h2>
                <p>Hi {name},</p>
                <p>Your password has been successfully changed.</p>
                <div class="warning">
                    If you didn't make this change, please contact our support team immediately and consider resetting your password.
                </div>
            </div>
        """

        html = self._base_template(content)
        return await self._send_email(email, "Password Changed - Eigensparse", html)


# Singleton instance
email_service = EmailService()
