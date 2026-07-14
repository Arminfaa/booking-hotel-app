import { useNavigate, createSearchParams } from "react-router-dom";
import { useState } from "react";
import { Button, DatePicker, Input, InputNumber } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { toInputDate } from "../../utils/format";
import { tw } from "../../styles/tw";

export default function SearchBar({
  initial = {},
  compact = false,
  onSearch,
}) {
  const navigate = useNavigate();
  const [city, setCity] = useState(initial.city || "");
  const [checkIn, setCheckIn] = useState(initial.checkIn || toInputDate());
  const [checkOut, setCheckOut] = useState(
    initial.checkOut || toInputDate(new Date(Date.now() + 86400000 * 3))
  );
  const [guests, setGuests] = useState(Number(initial.guests) || 2);

  function submit(e) {
    e.preventDefault();
    const params = {
      ...(city ? { city } : {}),
      checkIn,
      checkOut,
      guests: String(guests),
    };
    if (onSearch) onSearch(params);
    else {
      navigate({
        pathname: "/search",
        search: createSearchParams(params).toString(),
      });
    }
  }

  return (
    <form
      className={[
        "grid grid-cols-[1.4fr_1fr_1fr_0.7fr_auto] items-end gap-3.5 rounded-[20px] border border-[rgba(148,183,200,0.18)] p-[1.05rem] backdrop-blur-2xl max-[960px]:grid-cols-2 max-[560px]:grid-cols-1",
        compact
          ? "bg-foam/70 shadow-[0_12px_36px_rgba(0,0,0,0.28)]"
          : "bg-foam/82 shadow-cove",
      ].join(" ")}
      onSubmit={submit}
    >
      <div className={tw.field}>
        <label htmlFor="city" className={tw.fieldLabel}>
          Where
        </label>
        <Input
          id="city"
          size="large"
          placeholder="City or destination"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className={tw.field}>
        <label htmlFor="checkIn" className={tw.fieldLabel}>
          Check-in
        </label>
        <DatePicker
          id="checkIn"
          size="large"
          className="w-full!"
          value={checkIn ? dayjs(checkIn) : null}
          minDate={dayjs()}
          onChange={(date) => setCheckIn(date ? date.format("YYYY-MM-DD") : "")}
        />
      </div>
      <div className={tw.field}>
        <label htmlFor="checkOut" className={tw.fieldLabel}>
          Check-out
        </label>
        <DatePicker
          id="checkOut"
          size="large"
          className="w-full!"
          value={checkOut ? dayjs(checkOut) : null}
          minDate={dayjs(checkIn || undefined)}
          onChange={(date) => setCheckOut(date ? date.format("YYYY-MM-DD") : "")}
        />
      </div>
      <div className={tw.field}>
        <label htmlFor="guests" className={tw.fieldLabel}>
          Guests
        </label>
        <InputNumber
          id="guests"
          size="large"
          className="w-full!"
          min={1}
          max={16}
          value={guests}
          onChange={(value) => setGuests(Number(value) || 1)}
        />
      </div>
      <Button
        type="primary"
        size="large"
        htmlType="submit"
        icon={<SearchOutlined />}
        className="h-12 whitespace-nowrap max-[960px]:col-span-full"
      >
        Search stays
      </Button>
    </form>
  );
}
