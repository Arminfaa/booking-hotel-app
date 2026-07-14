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
  const [cardNumber, setCardNumber] = useState("4242424242424242");
  const [paying, setPaying] = useState(false);

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
      const refund = res.data?.refund;
      toast.success(
        refund
          ? `Cancelled · refund ${formatMoney(refund.refundAmount)} (${refund.refundPercent}%)`
          : "Booking cancelled"
      );
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function pay(e) {
    e.preventDefault();
    setPaying(true);
    try {
      const res = await bookingsApi.pay(id, { cardNumber });
      setBooking(res.data.booking);
      toast.success(
        res.data.email?.preview
          ? "Paid · confirmation email queued (see API logs)"
          : "Payment successful"
      );
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPaying(false);
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

  const unpaid = booking.paymentStatus === "unpaid" && booking.status !== "cancelled";

  return (
    <div className="section">
      <div className="container booking-detail animate-rise">
        <Link to="/bookings" className="back-link">
          ← All trips
        </Link>
        <p className="section__eyebrow">Confirmation</p>
        <h1 className="section__title">{booking.hotel?.title}</h1>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <span className={`badge badge--${booking.status}`}>{booking.status}</span>
          <span className="badge">{booking.paymentStatus}</span>
          <span className="badge">{booking.cancellationPolicy} policy</span>
        </div>

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
              <strong>Price breakdown</strong>
              <br />
              Lodging {formatMoney(booking.pricePerNight * booking.nights)} · Cleaning{" "}
              {formatMoney(booking.cleaningFee)} · Service{" "}
              {formatMoney(booking.serviceFee || 0)} · Tax{" "}
              {formatMoney(booking.tax || 0)}
            </p>
            <p>
              <strong>Total</strong>
              <br />
              {formatMoney(booking.totalPrice)}
              {booking.paymentRef ? ` · ref ${booking.paymentRef}` : ""}
            </p>
            {booking.refundAmount ? (
              <p>
                <strong>Refund</strong>
                <br />
                {formatMoney(booking.refundAmount)}
              </p>
            ) : null}

            {unpaid ? (
              <form onSubmit={pay} className="pay-form">
                <h3>Mock payment</h3>
                <div className="field">
                  <label htmlFor="card">Card number</label>
                  <input
                    id="card"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 4242 4242 4242"
                    required
                  />
                </div>
                <button className="btn btn--primary" disabled={paying}>
                  {paying ? "Processing..." : `Pay ${formatMoney(booking.totalPrice)}`}
                </button>
              </form>
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
