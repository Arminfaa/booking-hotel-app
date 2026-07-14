import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Input, Select } from "antd";
import toast from "react-hot-toast";
import { HiOutlineBookmark, HiOutlineLink, HiStar } from "react-icons/hi";
import { bookmarksApi, hotelsApi, messagesApi } from "../api";
import BookingPanel from "../components/booking/BookingPanel";
import HotelMap from "../components/hotels/HotelMap";
import OccupancyCalendar from "../components/hotels/OccupancyCalendar";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../hooks/useAuth";
import "./HotelDetail.css";

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [savingReview, setSavingReview] = useState(false);
  const [messageBody, setMessageBody] = useState("");

  const initialBooking = useMemo(
    () => ({
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: searchParams.get("guests") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    Promise.all([hotelsApi.get(id), hotelsApi.reviews(id)])
      .then(([hotelRes, reviewRes]) => {
        if (!alive) return;
        setHotel(hotelRes.data.hotel);
        setReviews(reviewRes.data.reviews);
      })
      .catch(() => {
        if (alive) setHotel(null);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated || !id) return;
    bookmarksApi
      .status(id)
      .then((res) => setBookmarked(res.data.bookmarked))
      .catch(() => setBookmarked(false));
  }, [isAuthenticated, id]);

  async function toggleBookmark() {
    if (!isAuthenticated) {
      toast.error("Log in to save stays");
      return;
    }
    try {
      if (bookmarked) {
        await bookmarksApi.remove(id);
        setBookmarked(false);
        toast.success("Removed from saved");
      } else {
        await bookmarksApi.add(id);
        setBookmarked(true);
        toast.success("Saved to bookmarks");
      }
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function copyShareLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy link");
    }
  }

  async function messageHost(e) {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate("/login", { state: { from: `/hotels/${id}` } });
      return;
    }
    try {
      const res = await messagesApi.start({ hotelId: id, body: messageBody });
      toast.success("Message sent");
      navigate(`/messages/${res.data.conversation._id}`);
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function submitReview(e) {
    e.preventDefault();
    setSavingReview(true);
    try {
      const res = await hotelsApi.createReview(id, reviewForm);
      setReviews((prev) => [res.data.review, ...prev]);
      setReviewForm({ rating: 5, comment: "" });
      toast.success("Review published");
      const hotelRes = await hotelsApi.get(id);
      setHotel(hotelRes.data.hotel);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSavingReview(false);
    }
  }

  if (loading) return <Loader label="Loading stay details..." />;
  if (!hotel) {
    return (
      <EmptyState
        title="Stay not found"
        message="This listing may have been removed."
        actionLabel="Browse stays"
        actionTo="/search"
      />
    );
  }

  return (
    <div className="section hotel-detail">
      <div className="container">
        <div className="hotel-detail__intro animate-rise">
          <div>
            <p className="section__eyebrow">
              {hotel.city}, {hotel.country}
            </p>
            <h1 className="section__title">{hotel.title}</h1>
            <p className="hotel-detail__meta">
              <HiStar /> {hotel.ratingAverage?.toFixed?.(1) || "New"} ·{" "}
              {hotel.ratingCount || 0} reviews · {hotel.propertyType} ·{" "}
              {hotel.maxGuests} guests · {hotel.cancellationPolicy} cancel
            </p>
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            <button type="button" className="btn btn--ghost" onClick={copyShareLink}>
              <HiOutlineLink /> Share
            </button>
            <button
              type="button"
              className={`btn ${bookmarked ? "btn--primary" : "btn--ghost"}`}
              onClick={toggleBookmark}
              aria-pressed={bookmarked}
            >
              <HiOutlineBookmark /> {bookmarked ? "Saved" : "Save"}
            </button>
          </div>
        </div>

        <div className="hotel-detail__gallery animate-fade">
          {hotel.images.slice(0, 3).map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${hotel.title} photo ${index + 1}`}
              className={index === 0 ? "hotel-detail__hero-img" : ""}
            />
          ))}
        </div>

        <div className="hotel-detail__layout">
          <div>
            <section className="hotel-detail__block">
              <h2>About this stay</h2>
              <p>{hotel.description}</p>
              <p className="hotel-detail__host">
                Hosted by {hotel.host?.name || "Cove host"} · {hotel.bedrooms}{" "}
                bedrooms · {hotel.beds} beds · {hotel.bathrooms} baths
              </p>
            </section>

            <section className="hotel-detail__block">
              <h2>Amenities</h2>
              <ul className="amenity-list">
                {hotel.amenities?.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="hotel-detail__block">
              <h2>Availability</h2>
              <OccupancyCalendar hotelId={hotel._id} />
            </section>

            <section className="hotel-detail__block">
              <h2>Where you’ll be</h2>
              <p>
                {hotel.address} · {hotel.city}, {hotel.country}
              </p>
              <HotelMap hotels={[hotel]} height={320} />
            </section>

            <section className="hotel-detail__block">
              <h2>Message host</h2>
              <form onSubmit={messageHost} className="review-form">
                <div className="field">
                  <label htmlFor="host-msg">Your message</label>
                  <Input.TextArea
                    id="host-msg"
                    rows={4}
                    value={messageBody}
                    onChange={(e) => setMessageBody(e.target.value)}
                    required
                    minLength={2}
                    placeholder="Ask about check-in, parking, or local tips..."
                  />
                </div>
                <button className="btn btn--soft" type="submit">
                  Send message
                </button>
              </form>
            </section>

            <section className="hotel-detail__block">
              <h2>Guest reviews</h2>
              {reviews.length === 0 ? (
                <p className="muted">No reviews yet.</p>
              ) : (
                <div className="review-list">
                  {reviews.map((review) => (
                    <article key={review._id} className="review">
                      <header>
                        <strong>{review.user?.name || "Guest"}</strong>
                        <span>
                          <HiStar /> {review.rating}
                        </span>
                      </header>
                      <p>{review.comment}</p>
                    </article>
                  ))}
                </div>
              )}

              {isAuthenticated ? (
                <form className="review-form" onSubmit={submitReview}>
                  <h3>Leave a review</h3>
                  <div className="field">
                    <label htmlFor="rating">Rating</label>
                    <Select
                      id="rating"
                      size="large"
                      style={{ width: "100%" }}
                      value={reviewForm.rating}
                      onChange={(rating) =>
                        setReviewForm((s) => ({
                          ...s,
                          rating,
                        }))
                      }
                      options={[5, 4, 3, 2, 1].map((n) => ({
                        value: n,
                        label: String(n),
                      }))}
                    />
                  </div>
                  <div className="field">
                    <label htmlFor="comment">Comment</label>
                    <Input.TextArea
                      id="comment"
                      rows={4}
                      value={reviewForm.comment}
                      onChange={(e) =>
                        setReviewForm((s) => ({
                          ...s,
                          comment: e.target.value,
                        }))
                      }
                      required
                      minLength={5}
                    />
                  </div>
                  <button className="btn btn--soft" disabled={savingReview}>
                    {savingReview ? "Publishing..." : "Publish review"}
                  </button>
                </form>
              ) : null}
            </section>
          </div>

          <BookingPanel hotel={hotel} initial={initialBooking} />
        </div>
      </div>
    </div>
  );
}
