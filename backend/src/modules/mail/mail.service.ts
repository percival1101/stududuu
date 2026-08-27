import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST');
    const user = this.config.get<string>('SMTP_USER');
    const pass = this.config.get<string>('SMTP_PASS');
    const port = Number(this.config.get<number>('SMTP_PORT') ?? 587);

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 5000,
      });

      this.logger.log(`SMTP Mailer initialized successfully (${host}:${port})`);
    } else {
      this.logger.warn(
        'SMTP credentials not set in .env. MailService running in Dev/Console mode (OTP will be printed to console).',
      );
    }
  }

  async sendVerificationEmail(
    toEmail: string,
    otpCode: string,
    displayName?: string,
  ): Promise<boolean> {
    const subject = 'Stududu — Mã xác thực tài khoản Gmail (Email OTP Verification)';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f766e; margin: 0; font-size: 24px;">stududu</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Speak global, connect local.</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Xin chào <strong>${displayName || toEmail}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Cảm ơn bạn đã đăng ký tài khoản tại Stududu. Đây là mã OTP xác thực email của bạn:
        </p>
        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #047857;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 16px;">
          Mã xác thực có hiệu lực trong vòng 15 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai để đảm bảo an toàn tài khoản.
        </p>
      </div>
    `;

    return this.sendMail(toEmail, subject, html, otpCode);
  }

  async sendPasswordResetEmail(
    toEmail: string,
    otpCode: string,
    displayName?: string,
  ): Promise<boolean> {
    const subject = 'Stududu — Khôi phục mật khẩu tài khoản (Password Reset OTP)';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #0f766e; margin: 0; font-size: 24px;">stududu</h2>
          <p style="color: #64748b; font-size: 13px; margin-top: 4px;">Xác minh khôi phục mật khẩu</p>
        </div>
        <p style="color: #334155; font-size: 15px; line-height: 1.6;">Xin chào <strong>${displayName || toEmail}</strong>,</p>
        <p style="color: #334155; font-size: 14px; line-height: 1.6;">
          Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản Stududu liên kết với email này. Sử dụng mã OTP bên dưới để hoàn tất:
        </p>
        <div style="background-color: #fff1f2; border: 1px solid #fecdd3; border-radius: 12px; padding: 16px; text-align: center; margin: 24px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 6px; color: #be123c;">${otpCode}</span>
        </div>
        <p style="color: #64748b; font-size: 12px; line-height: 1.5; margin-top: 16px;">
          Mã OTP khôi phục mật khẩu có hiệu lực trong vòng 30 phút. Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email.
        </p>
      </div>
    `;

    return this.sendMail(toEmail, subject, html, otpCode);
  }

  async sendWelcomeVerificationEmail(
    toEmail: string,
    displayName?: string,
    verificationToken?: string,
  ): Promise<boolean> {
    const subject = 'Chao mung ban den voi cong dong Stududu!';
    const verifyLink = verificationToken
      ? `http://localhost:3000/auth/verify?token=${verificationToken}`
      : `http://localhost:3000/login`;

    const name = displayName || toEmail;

    const html = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Chao mung den voi Stududu</title>
</head>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f8fafc;padding:32px 16px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" role="presentation"
      style="max-width:600px;width:100%;background-color:#ffffff;border-radius:20px;border:1px solid #e2e8f0;overflow:hidden;">

      <!-- HEADER: Logo goc trai -->
      <tr>
        <td style="background:linear-gradient(135deg,#0f766e 0%,#0d9488 100%);padding:24px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td style="vertical-align:middle;">
                <span style="font-size:26px;font-weight:900;color:#ffffff;letter-spacing:-0.5px;font-family:Arial,sans-serif;">stududu</span><br>
                <span style="font-size:12px;color:#99f6e4;font-weight:500;">Speak global, connect local.</span>
              </td>
              <td align="right" style="vertical-align:middle;">
                <span style="font-size:36px;">&#127757;</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- BODY -->
      <tr>
        <td style="padding:36px 32px 24px 32px;">

          <h2 style="margin:0 0 20px 0;font-size:22px;color:#0f766e;font-weight:800;line-height:1.3;">
            Chao mung ban den voi cong dong Stududu! &#127881;
          </h2>

          <p style="color:#334155;font-size:15px;line-height:1.75;margin:0 0 16px 0;">
            Chao <strong>${name}</strong>,
          </p>

          <p style="color:#334155;font-size:15px;line-height:1.75;margin:0 0 16px 0;">
            Chao mung ban da chinh thuc tro thanh mot phan cua dai gia dinh <strong>Stududu</strong>!
            Chung toi vo cung hao hung khi duoc dong hanh cung ban tren hanh trinh hoc tap,
            phat trien ban than va kham pha nhung chan troi tri thuc moi.
          </p>

          <p style="color:#334155;font-size:15px;line-height:1.75;margin:0 0 24px 0;">
            Tai Stududu, ban khong chi tim thay cac nguon tai lieu bo ich, cac khoa hoc chat luong
            ma con co co hoi ket noi, giao luu va hoc hoi cung hang ngan thanh vien co chung dam me.
            Du muc tieu cua ban la nang cao ky nang chuyen mon, chuan bi cho cac ky thi hay don gian
            la tim kiem cam hung hoc tap moi ngay, Stududu luon san sang ho tro ban tung buoc.
          </p>

          <!-- Buoc bat dau -->
          <div style="background-color:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:20px 24px;margin:0 0 28px 0;">
            <p style="color:#065f46;font-size:14px;font-weight:700;margin:0 0 12px 0;">De bat dau, ban co the:</p>
            <ul style="color:#334155;font-size:14px;line-height:1.9;margin:0;padding-left:20px;">
              <li>Hoan thien ho so ca nhan de ket noi de dang hon.</li>
              <li>Kham pha cac chuyen muc va nhom thao luan phu hop voi so thich.</li>
              <li>Chia se cau chuyen hoac dat cau hoi dau tien cua ban tai dien dan.</li>
            </ul>
          </div>

          <!-- NUT XAC THUC TAI KHOAN -->
          <div style="background-color:#fff7ed;border:1px solid #fed7aa;border-radius:14px;padding:22px 24px;margin:0 0 28px 0;text-align:center;">
            <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 8px 0;">&#128274; Xac thuc tai khoan cua ban</p>
            <p style="color:#78350f;font-size:13px;line-height:1.65;margin:0 0 18px 0;">
              Hay nhan vao nut ben duoi de xac thuc dia chi email va kich hoat day du tinh nang
              tai khoan Stududu cua ban.
            </p>
            <a href="${verifyLink}"
              style="display:inline-block;background-color:#0f766e;color:#ffffff;font-weight:700;font-size:15px;text-decoration:none;padding:14px 40px;border-radius:99px;box-shadow:0 4px 16px rgba(15,118,110,0.3);">
              &#10003; Xac thuc tai khoan ngay
            </a>
          </div>

          <p style="color:#475569;font-size:14px;line-height:1.75;margin:0 0 16px 0;">
            Neu can bat ky su ho tro nao, dung ngan ngai phan hoi email nay hoac lien he voi
            doi ngu ho tro cua Stududu bat cu luc nao.
          </p>

          <p style="color:#334155;font-size:15px;line-height:1.75;margin:0 0 24px 0;">
            Chuc ban co nhung trai nghiem that y nghia va hieu qua cung cong dong!
          </p>

        </td>
      </tr>

      <!-- FOOTER -->
      <tr>
        <td style="background-color:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 32px;">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
            <tr>
              <td>
                <p style="margin:0;color:#475569;font-size:14px;font-weight:600;">Than ai,</p>
                <p style="margin:4px 0 0 0;color:#0f766e;font-size:15px;font-weight:800;">Doi ngu Stududu &#127759;</p>
              </td>
              <td align="right" style="vertical-align:bottom;">
                <span style="font-size:11px;color:#94a3b8;">&#169; 2026 Stududu Language Platform</span>
              </td>
            </tr>
          </table>
          <p style="color:#cbd5e1;font-size:11px;margin:12px 0 0 0;text-align:center;">
            Email nay duoc gui tu dong - vui long khong tra loi truc tiep.
          </p>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;

    return this.sendMail(toEmail, subject, html, 'WELCOME_VERIFY');
  }

  private async sendMail(
    to: string,
    subject: string,
    html: string,
    otpCode: string,
  ): Promise<boolean> {
    this.logger.log(`[MAIL OTP PREVIEW] Destination: ${to} | OTP: ${otpCode} | Subject: ${subject}`);

    if (!this.transporter) {
      return true; // Dev mode success
    }

    const from = this.config.get<string>('SMTP_FROM') ?? 'Stududu Security <noreply@stududu.com>';

    // Gửi email bất đồng bộ ngầm (Fire & Forget) để HTTP API phản hồi tức thì trong 0.1 giây
    this.transporter
      .sendMail({
        from,
        to,
        subject,
        html,
      })
      .then(() => {
        this.logger.log(`Email sent successfully to ${to}`);
      })
      .catch((err: any) => {
        this.logger.error(`Failed to send email to ${to}: ${err.message}`);
      });

    return true;
  }
}
