import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporterPromise;

async function getTransporter() {
  if (transporterPromise) return transporterPromise;

  transporterPromise = (async () => {
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });
    }

    // Dev fallback: Ethereal test account
    const testAccount = await nodemailer.createTestAccount();
    console.log("Ethereal email user:", testAccount.user);
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  })();

  return transporterPromise;
}

export async function sendBookingConfirmation({ to, booking, hotel }) {
  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: `"Cove Stays" <noreply@cove.dev>`,
      to,
      subject: `Booking confirmed — ${hotel.title}`,
      text: [
        `Hi! Your stay at ${hotel.title} is confirmed.`,
        `Check-in: ${new Date(booking.checkIn).toDateString()}`,
        `Check-out: ${new Date(booking.checkOut).toDateString()}`,
        `Total: $${booking.totalPrice}`,
        `Payment ref: ${booking.paymentRef || "n/a"}`,
        `Manage trip: ${env.clientUrl}/bookings/${booking._id}`,
      ].join("\n"),
      html: `<p>Your stay at <strong>${hotel.title}</strong> is confirmed.</p>
        <p>${new Date(booking.checkIn).toDateString()} → ${new Date(booking.checkOut).toDateString()}</p>
        <p>Total: <strong>$${booking.totalPrice}</strong></p>
        <p><a href="${env.clientUrl}/bookings/${booking._id}">View trip</a></p>`,
    });

    const preview = nodemailer.getTestMessageUrl(info);
    if (preview) console.log("Email preview URL:", preview);
    return { success: true, preview };
  } catch (err) {
    console.error("Email send failed:", err.message);
    return { success: false, error: err.message };
  }
}
