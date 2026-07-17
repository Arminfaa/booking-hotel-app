import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Button, Card, Flex, Space, Tag, Typography } from "antd";
import toast from "react-hot-toast";
import { bookingsApi } from "../api";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import { useAuth } from "../hooks/useAuth";
import { formatDisplayDate, formatMoney } from "../utils/format";
import { tw } from "../styles/tw";

const statusColor = {
  confirmed: "success",
  pending: "warning",
  cancelled: "error",
  completed: "default",
};

export default function Bookings() {
  const { booting, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["bookings", "mine"],
    queryFn: () => bookingsApi.mine(),
    // Parallel with session boot — cookies already authenticate the request.
    enabled: booting || isAuthenticated,
    retry: (count, err) => (err?.status === 401 ? false : count < 1),
  });

  const bookings = data?.data?.bookings ?? [];
  const loading = (booting && !data) || (isLoading && !data);

  async function cancel(id) {
    try {
      await bookingsApi.cancel(id);
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["bookings", "mine"] });
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading your bookings..." />;

  return (
    <div className={tw.page}>
      <div className={tw.container}>
        <span className={tw.eyebrow}>Bookings</span>
        <Typography.Title level={1}>Your bookings</Typography.Title>
        <Typography.Paragraph type="secondary" className={`${tw.pageLead} !mb-7`}>
          Confirmed reservations live here with dates, totals, and cancel actions.
        </Typography.Paragraph>

        {bookings.length === 0 ? (
          <EmptyState
            title="No bookings yet"
            message="Search a city and reserve your first stay."
            actionLabel="Explore stays"
            actionTo="/search"
          />
        ) : (
          <Space direction="vertical" size="large" className="w-full">
            {bookings.map((booking) => (
              <Card
                key={booking._id}
                className="animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] overflow-hidden shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
              >
                <Flex gap={20} wrap="wrap">
                  <img
                    className="h-40 w-[min(220px,100%)] rounded-cove-sm border border-line object-cover"
                    src={booking.hotel?.images?.[0]}
                    alt={booking.hotel?.title || "Stay"}
                    loading="lazy"
                    decoding="async"
                  />
                  <div className="min-w-[220px] flex-1">
                    <Flex justify="space-between" gap={12} wrap>
                      <Tag color={statusColor[booking.status] || "default"}>
                        {booking.status}
                      </Tag>
                      <Typography.Text strong>
                        {formatMoney(booking.totalPrice)}
                      </Typography.Text>
                    </Flex>
                    <Typography.Title level={3} className="!mt-2 !mb-1">
                      <Link to={`/bookings/${booking._id}`}>{booking.hotel?.title}</Link>
                    </Typography.Title>
                    <Typography.Text type="secondary">
                      {booking.hotel?.city}, {booking.hotel?.country}
                    </Typography.Text>
                    <Typography.Paragraph type="secondary" className="!mt-1.5">
                      {formatDisplayDate(booking.checkIn)} →{" "}
                      {formatDisplayDate(booking.checkOut)} · {booking.nights} nights
                    </Typography.Paragraph>
                    <Space wrap>
                      <Link to={`/bookings/${booking._id}`}>
                        <Button>Details</Button>
                      </Link>
                      {booking.status === "confirmed" || booking.status === "pending" ? (
                        <Button danger onClick={() => cancel(booking._id)}>
                          Cancel
                        </Button>
                      ) : null}
                    </Space>
                  </div>
                </Flex>
              </Card>
            ))}
          </Space>
        )}
      </div>
    </div>
  );
}
