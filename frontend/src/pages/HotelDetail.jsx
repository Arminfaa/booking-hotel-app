import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button, Card, Col, Flex, Input, Row, Select, Space, Tag, Typography } from "antd";
import { BookOutlined, LinkOutlined, StarFilled } from "@ant-design/icons";
import toast from "react-hot-toast";
import { bookmarksApi, hotelsApi, messagesApi } from "../api";
import BookingPanel from "../components/booking/BookingPanel";
import HotelMap from "../components/hotels/HotelMap";
import OccupancyCalendar from "../components/hotels/OccupancyCalendar";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { useAuth } from "../hooks/useAuth";
import { tw } from "../styles/tw";

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
    <div className={tw.page}>
      <div className={tw.container}>
        <Flex
          className="mb-6 animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both]"
          justify="space-between"
          gap={16}
          wrap
        >
          <div>
            <span className={tw.eyebrow}>
              {hotel.city}, {hotel.country}
            </span>
            <Typography.Title level={1} className="!mb-2">
              {hotel.title}
            </Typography.Title>
            <Typography.Text type="secondary" className="capitalize">
              <StarFilled className="text-sand" />{" "}
              {hotel.ratingAverage?.toFixed?.(1) || "New"} · {hotel.ratingCount || 0}{" "}
              reviews · {hotel.propertyType} · {hotel.maxGuests} guests ·{" "}
              {hotel.cancellationPolicy} cancel
            </Typography.Text>
          </div>
          <Space wrap>
            <Button icon={<LinkOutlined />} onClick={copyShareLink}>
              Share
            </Button>
            <Button
              type={bookmarked ? "primary" : "default"}
              icon={<BookOutlined />}
              onClick={toggleBookmark}
            >
              {bookmarked ? "Saved" : "Save"}
            </Button>
          </Space>
        </Flex>

        <div className="mb-8 grid animate-[fade_0.85s_ease_both] gap-3 min-[900px]:grid-cols-[1.5fr_1fr] min-[900px]:grid-rows-[1fr_1fr] min-[900px]:min-h-[420px]">
          {hotel.images.slice(0, 3).map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${hotel.title} photo ${index + 1}`}
              className={[
                "size-full rounded-cove border border-line object-cover",
                index === 0
                  ? "min-h-[280px] max-h-[460px] min-[900px]:row-span-2 min-[900px]:min-h-full min-[900px]:max-h-none"
                  : "",
              ].join(" ")}
            />
          ))}
        </div>

        <Row gutter={[28, 28]}>
          <Col xs={24} lg={15}>
            <section className="mb-8">
              <Typography.Title level={3}>About this stay</Typography.Title>
              <Typography.Paragraph>{hotel.description}</Typography.Paragraph>
              <Typography.Text type="secondary">
                Hosted by {hotel.host?.name || "Cove host"} · {hotel.bedrooms}{" "}
                bedrooms · {hotel.beds} beds · {hotel.bathrooms} baths
              </Typography.Text>
            </section>

            <section className="mb-8">
              <Typography.Title level={3}>Amenities</Typography.Title>
              <Space size={[8, 8]} wrap>
                {hotel.amenities?.map((item) => (
                  <Tag key={item}>{item}</Tag>
                ))}
              </Space>
            </section>

            <section className="mb-8">
              <Typography.Title level={3}>Availability</Typography.Title>
              <OccupancyCalendar hotelId={hotel._id} />
            </section>
          </Col>
          <Col xs={24} lg={9}>
            <BookingPanel hotel={hotel} initial={initialBooking} />
          </Col>
        </Row>

        <section className="mb-8">
          <Typography.Title level={3}>Where you’ll be</Typography.Title>
          <Typography.Paragraph type="secondary">
            {hotel.address} · {hotel.city}, {hotel.country}
          </Typography.Paragraph>
          <div className={`${tw.surface} overflow-hidden p-2`}>
            <HotelMap hotels={[hotel]} height={420} />
          </div>
        </section>

        <section className="mb-8">
          <Typography.Title level={3}>Message host</Typography.Title>
          <Card size="small" className="max-w-xl">
            <form onSubmit={messageHost}>
              <div className={`${tw.field} mb-3`}>
                <label htmlFor="host-msg" className={tw.fieldLabel}>
                  Your message
                </label>
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
              <Button htmlType="submit">Send message</Button>
            </form>
          </Card>
        </section>

        <section className="mb-8">
          <Typography.Title level={3}>Guest reviews</Typography.Title>
          {reviews.length === 0 ? (
            <Typography.Text type="secondary">No reviews yet.</Typography.Text>
          ) : (
            <Space direction="vertical" size="middle" className="w-full">
              {reviews.map((review) => (
                <Card key={review._id} size="small" className="!bg-paper/45">
                  <Flex justify="space-between" className="mb-1.5">
                    <Typography.Text strong>
                      {review.user?.name || "Guest"}
                    </Typography.Text>
                    <Typography.Text>
                      <StarFilled className="text-sand" /> {review.rating}
                    </Typography.Text>
                  </Flex>
                  <Typography.Paragraph className="!m-0">
                    {review.comment}
                  </Typography.Paragraph>
                </Card>
              ))}
            </Space>
          )}

          {isAuthenticated ? (
            <Card size="small" className="mt-4 max-w-xl">
              <Typography.Title level={5}>Leave a review</Typography.Title>
              <form onSubmit={submitReview}>
                <div className={`${tw.field} mb-3`}>
                  <label htmlFor="rating" className={tw.fieldLabel}>
                    Rating
                  </label>
                  <Select
                    id="rating"
                    size="large"
                    className="w-full"
                    value={reviewForm.rating}
                    onChange={(rating) => setReviewForm((s) => ({ ...s, rating }))}
                    options={[5, 4, 3, 2, 1].map((n) => ({
                      value: n,
                      label: String(n),
                    }))}
                  />
                </div>
                <div className={`${tw.field} mb-3`}>
                  <label htmlFor="comment" className={tw.fieldLabel}>
                    Comment
                  </label>
                  <Input.TextArea
                    id="comment"
                    rows={4}
                    value={reviewForm.comment}
                    onChange={(e) =>
                      setReviewForm((s) => ({ ...s, comment: e.target.value }))
                    }
                    required
                    minLength={5}
                  />
                </div>
                <Button type="primary" htmlType="submit" loading={savingReview}>
                  Publish review
                </Button>
              </form>
            </Card>
          ) : null}
        </section>
      </div>
    </div>
  );
}
