import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { bookingsApi } from "../api";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import { formatDisplayDate, formatMoney } from "../utils/format";
import "./Trips.css";

export default function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const res = await bookingsApi.mine();
      setBookings(res.data.bookings);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function cancel(id) {
    try {
      await bookingsApi.cancel(id);
      toast.success("Booking cancelled");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading your trips..." />;

  return (
    <div className="section">
      <div className="container">
        <p className="section__eyebrow">Trips</p>
        <h1 className="section__title">Your bookings</h1>
        <p className="section__lead" style={{ marginBottom: "1.75rem" }}>
          Confirmed reservations live here with dates, totals, and cancel actions.
        </p>

        {bookings.length === 0 ? (
          <EmptyState
            title="No trips yet"
            message="Search a city and reserve your first stay."
            actionLabel="Explore stays"
            actionTo="/search"
          />
        ) : (
          <div className="trip-list">
            {bookings.map((booking) => (
              <article key={booking._id} className="trip-card animate-rise">
                <img
                  src={booking.hotel?.images?.[0]}
                  alt={booking.hotel?.title || "Stay"}
                />
                <div className="trip-card__body">
                  <div className="trip-card__top">
                    <span className={`badge badge--${booking.status}`}>
                      {booking.status}
                    </span>
                    <strong>{formatMoney(booking.totalPrice)}</strong>
                  </div>
                  <h2>
                    <Link to={`/bookings/${booking._id}`}>
                      {booking.hotel?.title}
                    </Link>
                  </h2>
                  <p>
                    {booking.hotel?.city}, {booking.hotel?.country}
                  </p>
                  <p>
                    {formatDisplayDate(booking.checkIn)} →{" "}
                    {formatDisplayDate(booking.checkOut)} · {booking.nights} nights
                  </p>
                  <div className="trip-card__actions">
                    <Link className="btn btn--soft" to={`/bookings/${booking._id}`}>
                      Details
                    </Link>
                    {booking.status === "confirmed" || booking.status === "pending" ? (
                      <button
                        className="btn btn--danger"
                        type="button"
                        onClick={() => cancel(booking._id)}
                      >
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
