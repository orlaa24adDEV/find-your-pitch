import nodemailer from "nodemailer";

const createTransporter = async () => {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  const testAccount = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });
};

export const sendPasswordResetEmail = async (to: string, resetUrl: string) => {
  const transporter = await createTransporter();

  const info = await transporter.sendMail({
    from: process.env.SMTP_FROM || "noreply@findyourpitch.com",
    to,
    subject: "Recuperación de contraseña - Find Your Pitch",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #3B9E59;">Find Your Pitch</h1>
        <p>Has solicitado restablecer tu contraseña.</p>
        <p>Haz clic en el siguiente enlace para crear una nueva contraseña:</p>
        <a href="${resetUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #3B9E59; color: white; text-decoration: none; border-radius: 8px; margin: 16px 0;">
          Restablecer contraseña
        </a>
        <p>Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este correo.</p>
        <hr style="border: 1px solid #e5e7eb; margin: 24px 0;" />
        <p style="color: #6B6D6B; font-size: 12px;">Find Your Pitch - Alquiler de pistas deportivas</p>
      </div>
    `,
  });

  const previewUrl = nodemailer.getTestMessageUrl(info);
  if (previewUrl) {
    console.log("=== 📧 Email preview URL (Ethereal):", previewUrl);
  }
  console.log(`Password reset email sent to ${to}. Reset URL: ${resetUrl}`);

  return info;
};
