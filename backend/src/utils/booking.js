import { env } from "../config/env.js";

export function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function calcPricing({ pricePerNight, cleaningFee = 0, nights }) {
  const lodging = pricePerNight * nights;
  const serviceFee = Math.round((lodging * env.serviceFeePercent) / 100);
  const taxable = lodging + cleaningFee + serviceFee;
  const tax = Math.round((taxable * env.taxPercent) / 100);
  const totalPrice = lodging + cleaningFee + serviceFee + tax;
  return { lodging, cleaningFee, serviceFee, tax, totalPrice };
}

export function refundForCancel({ totalPrice, checkIn, policy }) {
  const daysUntil = Math.ceil((new Date(checkIn) - Date.now()) / 86400000);
  let percent = 0;

  if (policy === "flexible") {
    percent = daysUntil >= 1 ? 100 : 0;
  } else if (policy === "moderate") {
    if (daysUntil >= 5) percent = 100;
    else if (daysUntil >= 2) percent = 50;
    else percent = 0;
  } else {
    // strict
    if (daysUntil >= 14) percent = 100;
    else if (daysUntil >= 7) percent = 50;
    else percent = 0;
  }

  return {
    refundPercent: percent,
    refundAmount: Math.round((totalPrice * percent) / 100),
  };
}

export { hasBookingOverlap } from "./bookingOverlap.js";
