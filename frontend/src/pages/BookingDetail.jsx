import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { bookingsApi } from "../api";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { formatDisplayDate, formatMoney } from "../utils/format";
import "./Trips.css";

export default function BookingDetail() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    bookingsApi
      .get(id)
      .then((res) => {
        if (alive) setBooking(res.data.booking);
      })
      .catch(() => {
        if (alive) setBooking(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  async function cancel() {
    try {
      const res = await bookingsApi.cancel(id);
      setBooking(res.data.booking);
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading booking..." />;
  if (!booking) {
    return (
      <EmptyState
        title="Booking not found"
        message="It may have been removed or you don’t have access."
        actionLabel="Back to trips"
        actionTo="/bookings"
      />
    );
  }

  return (
    <div className="section">
      <div className="container booking-detail animate-rise">
        <Link to="/bookings" className="back-link">
          ← All trips
        </Link>
        <p className="section__eyebrow">Confirmation</p>
        <h1 className="section__title">{booking.hotel?.title}</h1>
        <span className={`badge badge--${booking.status}`}>{booking.status}</span>

        <div className="booking-detail__grid">
          <img
            src={booking.hotel?.images?.[0]}
            alt={booking.hotel?.title || "Stay"}
          />
          <div className="booking-detail__panel">
            <p>
              <strong>Dates</strong>
              <br />
              {formatDisplayDate(booking.checkIn)} →{" "}
              {formatDisplayDate(booking.checkOut)}
            </p>
            <p>
              <strong>Guests</strong>
              <br />
              {booking.guests?.adults} adults
              {booking.guests?.children
                ? `, ${booking.guests.children} children`
                : ""}
            </p>
            <p>
              <strong>Nights</strong>
              <br />
              {booking.nights}
            </p>
            <p>
              <strong>Total paid</strong>
              <br />
              {formatMoney(booking.totalPrice)}
            </p>
            {booking.specialRequests ? (
              <p>
                <strong>Requests</strong>
                <br />
                {booking.specialRequests}
              </p>
            ) : null}
            <div className="trip-card__actions">
              <Link className="btn btn--soft" to={`/hotels/${booking.hotel?._id}`}>
                View stay
              </Link>
              {booking.status === "confirmed" || booking.status === "pending" ? (
                <button className="btn btn--danger" type="button" onClick={cancel}>
                  Cancel booking
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
