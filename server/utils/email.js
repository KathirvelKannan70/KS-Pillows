import { Resend } from "resend";

// Lazy singleton — env vars are loaded before any route handler runs
let _resend = null;
const resend = () => {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
};

const FROM = "KS Pillows <info@kspillows.in>";
const REPLY_TO = "info@kspillows.in";
const baseUrl = () => process.env.CLIENT_URL || "https://www.kspillows.in";

/* ─── Verification Email ─── */
export const sendVerificationEmail = (email, firstName, token) => {
  const url = `${baseUrl()}/verify-email?token=${token}`;
  return resend().emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to: [email],
    subject: "Verify Your Email — KS Pillows",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#dc2626">Welcome to KS Pillows, ${firstName}!</h2>
        <p>Thanks for signing up. Please verify your email to activate your account.</p>
        <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Verify My Email
        </a>
        <p style="color:#888;font-size:12px">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
      </div>`,
  });
};

/* ─── Welcome Email (sent after verification) ─── */
export const sendWelcomeEmail = (email, firstName) => {
  return resend().emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to: [email],
    subject: `Welcome to KS Pillows, ${firstName}! 🎉`,
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#dc2626">You're all set, ${firstName}!</h2>
        <p>Your email has been verified and your KS Pillows account is now active.</p>
        <p>Browse our collection of premium pillows and place your first order today.</p>
        <a href="${baseUrl()}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Start Shopping
        </a>
        <p style="color:#888;font-size:12px">Thank you for choosing KS Pillows — your comfort is our priority.</p>
      </div>`,
  });
};

/* ─── Password Reset Email ─── */
export const sendPasswordResetEmail = (email, token) => {
  const url = `${baseUrl()}/reset-password?token=${token}`;
  return resend().emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to: [email],
    subject: "Reset Your Password — KS Pillows",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
        <h2 style="color:#dc2626">Password Reset</h2>
        <p>We received a request to reset your password. Click below to set a new one:</p>
        <a href="${url}" style="display:inline-block;background:#dc2626;color:#fff;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">
          Reset My Password
        </a>
        <p style="color:#888;font-size:12px">This link expires in <strong>1 hour</strong>. If you didn't request this, ignore this email.</p>
      </div>`,
  });
};

/* ─── Admin OTP Email ─── */
export const sendAdminOTP = (email, otp) => {
  return resend().emails.send({
    from: "KS Pillows Admin <info@kspillows.in>",
    to: [email],
    subject: "Your Admin Login OTP — KS Pillows",
    html: `
      <div style="font-family:sans-serif;max-width:400px;margin:0 auto">
        <h2 style="color:#dc2626">KS Pillows Admin Login</h2>
        <p>Your one-time password (OTP) is:</p>
        <h1 style="letter-spacing:8px;color:#111;font-size:36px">${otp}</h1>
        <p style="color:#666">This OTP expires in <strong>5 minutes</strong>.</p>
        <p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p>
      </div>`,
  });
};

/* ─── Order Confirmation Email ─── */
export const sendOrderConfirmationEmail = (email, firstName, order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0">${item.name}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:center">${item.quantity}</td>
        <td style="padding:8px;border-bottom:1px solid #f0f0f0;text-align:right">₹${item.price * item.quantity}</td>
      </tr>`
    )
    .join("");

  return resend().emails.send({
    from: FROM,
    reply_to: REPLY_TO,
    to: [email],
    subject: `Order Confirmed #${String(order._id).slice(-8).toUpperCase()} — KS Pillows`,
    html: `
      <div style="font-family:sans-serif;max-width:520px;margin:0 auto;color:#333">
        <h2 style="color:#dc2626">Order Placed Successfully! 🎉</h2>
        <p>Hi ${firstName}, thank you for your order. We'll process it shortly.</p>
        <p style="color:#888;font-size:13px">Order ID: <strong>#${String(order._id).slice(-10).toUpperCase()}</strong></p>

        <h3 style="border-bottom:2px solid #dc2626;padding-bottom:6px">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse;font-size:14px">
          <thead>
            <tr style="background:#f9f9f9">
              <th style="padding:8px;text-align:left">Product</th>
              <th style="padding:8px;text-align:center">Qty</th>
              <th style="padding:8px;text-align:right">Price</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <div style="text-align:right;margin-top:12px;font-size:16px;font-weight:bold">
          Total: <span style="color:#dc2626">₹${order.totalPrice}</span>
        </div>

        <h3 style="border-bottom:2px solid #dc2626;padding-bottom:6px;margin-top:24px">Delivery Address</h3>
        <p style="font-size:14px;line-height:1.8">
          ${order.address.fullName}<br/>
          ${order.address.street}<br/>
          ${order.address.city} — ${order.address.pincode}<br/>
          📞 ${order.address.phone}
        </p>
        <p style="margin-top:24px;color:#888;font-size:12px">
          Track your order at <a href="${baseUrl()}/orders" style="color:#dc2626">My Orders</a>.
        </p>
      </div>`,
  });
};
