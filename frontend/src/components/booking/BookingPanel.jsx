import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DatePicker, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { bookingsApi, hotelsApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { formatMoney, nightsBetween, toInputDate } from "../../utils/format";
import "./BookingPanel.css";

const SERVICE_PCT = 10;
const TAX_PCT = 8;

export default function BookingPanel({ hotel, initial = {} }) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState(initial.checkIn || toInputDate());
  const [checkOut, setCheckOut] = useState(
    initial.checkOut || toInputDate(new Date(Date.now() + 86400000 * 3))
  );
  const [adults, setAdults] = useState(Number(initial.guests) || 2);
  const [children, setChildren] = useState(0);
  const [specialRequests, setSpecialRequests] = useState("");
  const [loading, setLoading] = useState(false);

  const nights = useMemo(
    () => nightsBetween(checkIn, checkOut),
    [checkIn, checkOut]
  );
  const lodging = nights * hotel.pricePerNight;
  const cleaning = hotel.cleaningFee || 0;
  const serviceFee = Math.round((lodging * SERVICE_PCT) / 100);
  const tax = Math.round(((lodging + cleaning + serviceFee) * TAX_PCT) / 100);
  const total = lodging + cleaning + serviceFee + tax;

  async function handleBook(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/hotels/${hotel._id}` } });
      return;
    }
    if (nights < 1) {
      toast.error("Check-out must be after check-in");
      return;
    }

    setLoading(true);
    try {
      const avail = await hotelsApi.availability(hotel._id, { checkIn, checkOut });
      if (!avail.data.available) {
        toast.error("Those dates are already booked");
        return;
      }

      const res = await bookingsApi.create({
        hotelId: hotel._id,
        checkIn,
        checkOut,
        guests: { adults, children },
        specialRequests,
      });
      toast.success("Continue to payment");
      navigate(`/bookings/${res.data.booking._id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <aside className="booking-panel animate-rise">
      <p className="booking-panel__price">
        <strong>{formatMoney(hotel.pricePerNight)}</strong>
        <span> / night</span>
      </p>
      <p className="booking-panel__policy">
        Cancellation: <strong>{hotel.cancellationPolicy || "moderate"}</strong>
      </p>
      <form onSubmit={handleBook} className="booking-panel__form">
        <div className="booking-panel__dates">
          <div className="field">
            <label htmlFor="bp-checkIn">Check-in</label>
            <DatePicker
              id="bp-checkIn"
              size="large"
              style={{ width: "100%" }}
              value={checkIn ? dayjs(checkIn) : null}
              minDate={dayjs()}
              onChange={(date) => setCheckIn(date ? date.format("YYYY-MM-DD") : "")}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bp-checkOut">Check-out</label>
            <DatePicker
              id="bp-checkOut"
              size="large"
              style={{ width: "100%" }}
              value={checkOut ? dayjs(checkOut) : null}
              minDate={dayjs(checkIn || undefined)}
              onChange={(date) => setCheckOut(date ? date.format("YYYY-MM-DD") : "")}
              required
            />
          </div>
        </div>
        <div className="booking-panel__guests">
          <div className="field">
            <label htmlFor="bp-adults">Adults</label>
            <InputNumber
              id="bp-adults"
              size="large"
              style={{ width: "100%" }}
              min={1}
              max={hotel.maxGuests}
              value={adults}
              onChange={(value) => setAdults(Number(value) || 1)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bp-children">Children</label>
            <InputNumber
              id="bp-children"
              size="large"
              style={{ width: "100%" }}
              min={0}
              max={Math.max(0, hotel.maxGuests - 1)}
              value={children}
              onChange={(value) => setChildren(Number(value) || 0)}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="bp-notes">Special requests</label>
          <Input.TextArea
            id="bp-notes"
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Late check-in, extra pillows..."
          />
        </div>

        <div className="booking-panel__summary">
          <div>
            <span>
              {formatMoney(hotel.pricePerNight)} × {nights || 0} nights
            </span>
            <strong>{formatMoney(lodging)}</strong>
          </div>
          <div>
            <span>Cleaning fee</span>
            <strong>{formatMoney(cleaning)}</strong>
          </div>
          <div>
            <span>Service fee ({SERVICE_PCT}%)</span>
            <strong>{formatMoney(serviceFee)}</strong>
          </div>
          <div>
            <span>Taxes ({TAX_PCT}%)</span>
            <strong>{formatMoney(tax)}</strong>
          </div>
          <div className="booking-panel__total">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading
            ? "Creating..."
            : isAuthenticated
              ? "Reserve & pay"
              : "Log in to reserve"}
        </button>
      </form>
    </aside>
  );
}
