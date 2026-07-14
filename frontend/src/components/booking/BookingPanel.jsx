import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { bookingsApi, hotelsApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { formatMoney, nightsBetween, toInputDate } from "../../utils/format";
import "./BookingPanel.css";

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
  const total = lodging + (hotel.cleaningFee || 0);

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
      toast.success("Stay reserved");
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
      <form onSubmit={handleBook} className="booking-panel__form">
        <div className="booking-panel__dates">
          <div className="field">
            <label htmlFor="bp-checkIn">Check-in</label>
            <input
              id="bp-checkIn"
              type="date"
              value={checkIn}
              min={toInputDate()}
              onChange={(e) => setCheckIn(e.target.value)}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bp-checkOut">Check-out</label>
            <input
              id="bp-checkOut"
              type="date"
              value={checkOut}
              min={checkIn || toInputDate()}
              onChange={(e) => setCheckOut(e.target.value)}
              required
            />
          </div>
        </div>
        <div className="booking-panel__guests">
          <div className="field">
            <label htmlFor="bp-adults">Adults</label>
            <input
              id="bp-adults"
              type="number"
              min={1}
              max={hotel.maxGuests}
              value={adults}
              onChange={(e) => setAdults(Number(e.target.value))}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="bp-children">Children</label>
            <input
              id="bp-children"
              type="number"
              min={0}
              max={Math.max(0, hotel.maxGuests - 1)}
              value={children}
              onChange={(e) => setChildren(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="field">
          <label htmlFor="bp-notes">Special requests</label>
          <textarea
            id="bp-notes"
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
            <strong>{formatMoney(hotel.cleaningFee || 0)}</strong>
          </div>
          <div className="booking-panel__total">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <button className="btn btn--primary" type="submit" disabled={loading}>
          {loading ? "Reserving..." : isAuthenticated ? "Reserve stay" : "Log in to reserve"}
        </button>
      </form>
    </aside>
  );
}
