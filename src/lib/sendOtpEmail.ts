// lib/sendOtpEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOtpEmail(to: string, otp: string, name?: string) {
  try {
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || "onboarding@resend.dev",
      to,
      subject: "Your OTP Code",
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>🔑 Your OTP Code</h2>
          <p>Hello ${name || "User"},</p>
          <p>Your one-time password is:</p>
          <h1 style="background:#f4f4f4;padding:10px;border-radius:8px;
                     text-align:center;letter-spacing:3px;">
            ${otp}
          </h1>
          <p>This code will expire in 5 minutes.</p>
        </div>
      `,
    });

    if (response.error) {
      console.error("❌ Error sending OTP:", response.error);
      return false;
    }

    console.log("✅ OTP email sent to", to);
    return true;
  } catch (err) {
    console.error("❌ Resend API error:", err);
    return false;
  }
}
