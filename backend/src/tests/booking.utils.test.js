import assert from "assert";
import { calcPricing, nightsBetween, refundForCancel } from "../utils/booking.js";

assert.equal(nightsBetween("2026-08-01", "2026-08-04"), 3);

const pricing = calcPricing({ pricePerNight: 100, cleaningFee: 20, nights: 2 });
assert.equal(pricing.lodging, 200);
assert.equal(pricing.serviceFee, 20); // 10%
assert.equal(pricing.tax, 19); // 8% of 240 rounded
assert.equal(pricing.totalPrice, 259);

const flexible = refundForCancel({
  totalPrice: 100,
  checkIn: new Date(Date.now() + 3 * 86400000),
  policy: "flexible",
});
assert.equal(flexible.refundPercent, 100);

const strict = refundForCancel({
  totalPrice: 100,
  checkIn: new Date(Date.now() + 3 * 86400000),
  policy: "strict",
});
assert.equal(strict.refundPercent, 0);

console.log("booking utils tests passed");
