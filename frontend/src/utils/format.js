import { differenceInCalendarDays, format, parseISO } from "date-fns";

export function toInputDate(date = new Date()) {
  return format(date, "yyyy-MM-dd");
}

export function formatDisplayDate(value) {
  if (!value) return "";
  const date = typeof value === "string" ? parseISO(value) : value;
  return format(date, "MMM d, yyyy");
}

export function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  return Math.max(
    0,
    differenceInCalendarDays(parseISO(checkOut), parseISO(checkIn))
  );
}

export function formatMoney(amount, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function totalGuests(guests = {}) {
  return Number(guests.adults || 0) + Number(guests.children || 0);
}
