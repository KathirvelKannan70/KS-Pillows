// Quick email test — run: node scripts/testEmail.js
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

console.log("GMAIL_USER:", process.env.GMAIL_USER);
console.log("APP_PASSWORD length:", process.env.GMAIL_APP_PASSWORD?.length);

const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

try {
    await transporter.verify();
    console.log("✅ SMTP connection verified!");

    await transporter.sendMail({
        from: process.env.GMAIL_USER,
        to: process.env.GMAIL_USER,
        subject: "KS Pillows OTP Test",
        text: "Test OTP: 123456",
    });

    console.log("✅ Test email sent successfully! Check your inbox.");
} catch (err) {
    console.error("❌ Error:", err.message);
    if (err.message.includes("Username and Password")) {
        console.error("→ Gmail App Password is wrong. Regenerate it at myaccount.google.com/apppasswords");
    }
}
