import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, DatePicker, Divider, Input, InputNumber, Typography } from "antd";
import dayjs from "dayjs";
import toast from "react-hot-toast";
import { bookingsApi, hotelsApi } from "../../api";
import { useAuth } from "../../hooks/useAuth";
import { formatMoney, nightsBetween, toInputDate } from "../../utils/format";
import { tw } from "../../styles/tw";

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
    <Card
      className="sticky top-[calc(4.25rem+1rem)] animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] shadow-cove max-lg:static [&_.ant-card-body]:p-[1.35rem]"
      bordered
    >
      <Typography.Title level={3} className="!mb-1.5 !text-[1.75rem]">
        {formatMoney(hotel.pricePerNight)}
        <Typography.Text
          type="secondary"
          className="!font-body !text-base"
        >
          {" "}
          / night
        </Typography.Text>
      </Typography.Title>
      <Typography.Text type="secondary" className="mb-4 block capitalize">
        Cancellation: <strong>{hotel.cancellationPolicy || "moderate"}</strong>
      </Typography.Text>

      <form onSubmit={handleBook} className="grid gap-3.5">
        <div className="grid grid-cols-2 gap-2.5">
          <div className={tw.field}>
            <label htmlFor="bp-checkIn" className={tw.fieldLabel}>
              Check-in
            </label>
            <DatePicker
              id="bp-checkIn"
              size="large"
              className="w-full"
              value={checkIn ? dayjs(checkIn) : null}
              minDate={dayjs()}
              onChange={(date) => setCheckIn(date ? date.format("YYYY-MM-DD") : "")}
            />
          </div>
          <div className={tw.field}>
            <label htmlFor="bp-checkOut" className={tw.fieldLabel}>
              Check-out
            </label>
            <DatePicker
              id="bp-checkOut"
              size="large"
              className="w-full"
              value={checkOut ? dayjs(checkOut) : null}
              minDate={dayjs(checkIn || undefined)}
              onChange={(date) => setCheckOut(date ? date.format("YYYY-MM-DD") : "")}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2.5">
          <div className={tw.field}>
            <label htmlFor="bp-adults" className={tw.fieldLabel}>
              Adults
            </label>
            <InputNumber
              id="bp-adults"
              size="large"
              className="w-full"
              min={1}
              max={hotel.maxGuests}
              value={adults}
              onChange={(value) => setAdults(Number(value) || 1)}
            />
          </div>
          <div className={tw.field}>
            <label htmlFor="bp-children" className={tw.fieldLabel}>
              Children
            </label>
            <InputNumber
              id="bp-children"
              size="large"
              className="w-full"
              min={0}
              max={Math.max(0, hotel.maxGuests - 1)}
              value={children}
              onChange={(value) => setChildren(Number(value) || 0)}
            />
          </div>
        </div>
        <div className={tw.field}>
          <label htmlFor="bp-notes" className={tw.fieldLabel}>
            Special requests
          </label>
          <Input.TextArea
            id="bp-notes"
            rows={3}
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            placeholder="Late check-in, extra pillows..."
          />
        </div>

        <Divider className="!my-1" />

        <div className="grid gap-2 text-[0.92rem] text-ink-soft">
          <div className="flex justify-between gap-4">
            <span>
              {formatMoney(hotel.pricePerNight)} × {nights || 0} nights
            </span>
            <strong>{formatMoney(lodging)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Cleaning fee</span>
            <strong>{formatMoney(cleaning)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Service fee ({SERVICE_PCT}%)</span>
            <strong>{formatMoney(serviceFee)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Taxes ({TAX_PCT}%)</span>
            <strong>{formatMoney(tax)}</strong>
          </div>
          <div className="flex justify-between gap-4 pt-1.5 text-[1.08rem] text-ink">
            <span>Total</span>
            <strong>{formatMoney(total)}</strong>
          </div>
        </div>

        <Button type="primary" size="large" htmlType="submit" loading={loading} block>
          {isAuthenticated ? "Reserve & pay" : "Log in to reserve"}
        </Button>
      </form>
    </Card>
  );
}
