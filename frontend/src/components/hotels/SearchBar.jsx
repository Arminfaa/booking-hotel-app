import { useNavigate, createSearchParams } from "react-router-dom";
import { useState } from "react";
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
        <input
          id="city"
          name="city"
          placeholder="City or destination"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>
      <div className="field">
        <label htmlFor="checkIn">Check-in</label>
        <input
          id="checkIn"
          type="date"
          value={checkIn}
          min={toInputDate()}
          onChange={(e) => setCheckIn(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="checkOut">Check-out</label>
        <input
          id="checkOut"
          type="date"
          value={checkOut}
          min={checkIn || toInputDate()}
          onChange={(e) => setCheckOut(e.target.value)}
          required
        />
      </div>
      <div className="field">
        <label htmlFor="guests">Guests</label>
        <input
          id="guests"
          type="number"
          min={1}
          max={16}
          value={guests}
          onChange={(e) => setGuests(Number(e.target.value))}
          required
        />
      </div>
      <button className="btn btn--primary searchbar__submit" type="submit">
        Search stays
      </button>
    </form>
  );
}
