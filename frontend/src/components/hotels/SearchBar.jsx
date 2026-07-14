import { useNavigate, createSearchParams } from "react-router-dom";
import { useState } from "react";
import { DatePicker, Input, InputNumber } from "antd";
import dayjs from "dayjs";
import { toInputDate } from "../../utils/format";
import "./SearchBar.css";

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
  const [guests, setGuests] = useState(initial.guests || 2);

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
      className={`searchbar ${compact ? "searchbar--compact" : ""}`}
      onSubmit={submit}
    >
      <div className="field">
        <label htmlFor="city">Where</label>
        <Input
          id="city"
          name="city"
          size="large"
          placeholder="City or destination"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="checkIn">Check-in</label>
        <DatePicker
          id="checkIn"
          size="large"
          style={{ width: "100%" }}
          value={checkIn ? dayjs(checkIn) : null}
          minDate={dayjs()}
          onChange={(date) => setCheckIn(date ? date.format("YYYY-MM-DD") : "")}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="checkOut">Check-out</label>
        <DatePicker
          id="checkOut"
          size="large"
          style={{ width: "100%" }}
          value={checkOut ? dayjs(checkOut) : null}
          minDate={dayjs(checkIn || undefined)}
          onChange={(date) => setCheckOut(date ? date.format("YYYY-MM-DD") : "")}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="guests">Guests</label>
        <InputNumber
          id="guests"
          size="large"
          style={{ width: "100%" }}
          min={1}
          max={16}
          value={guests}
          onChange={(value) => setGuests(Number(value) || 1)}
          required
        />
      </div>
      <button className="btn btn--primary searchbar__submit" type="submit">
        Search stays
      </button>
    </form>
  );
}
