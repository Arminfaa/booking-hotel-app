import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { hotelsApi } from "../api";
import SearchBar from "../components/hotels/SearchBar";
import HotelCard from "../components/hotels/HotelCard";
import HotelMap from "../components/hotels/HotelMap";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import "./Search.css";

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const filters = useMemo(
    () => ({
      city: searchParams.get("city") || "",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: searchParams.get("guests") || "",
      propertyType: searchParams.get("propertyType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
    }),
    [searchParams]
  );

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError("");
    const params = Object.fromEntries(
      Object.entries(filters).filter(([, v]) => v !== "" && v != null)
    );

    hotelsApi
      .list({ ...params, limit: 24 })
      .then((res) => {
        if (!alive) return;
        setHotels(res.data.hotels);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message);
        setHotels([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [filters]);

  const queryString = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  return (
    <div className="section search-page">
      <div className="container">
        <p className="section__eyebrow">Explore</p>
        <h1 className="section__title">Find your next stay</h1>
        <SearchBar
          compact
          initial={filters}
          onSearch={(params) => setSearchParams(params)}
        />

        <div className="search-filters">
          <label>
            Type
            <select
              value={filters.propertyType}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("propertyType", e.target.value);
                else next.delete("propertyType");
                setSearchParams(next);
              }}
            >
              <option value="">Any</option>
              {["apartment", "house", "villa", "cabin", "loft", "hotel"].map(
                (type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                )
              )}
            </select>
          </label>
          <label>
            Min price
            <input
              type="number"
              min={0}
              value={filters.minPrice}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("minPrice", e.target.value);
                else next.delete("minPrice");
                setSearchParams(next);
              }}
            />
          </label>
          <label>
            Max price
            <input
              type="number"
              min={0}
              value={filters.maxPrice}
              onChange={(e) => {
                const next = new URLSearchParams(searchParams);
                if (e.target.value) next.set("maxPrice", e.target.value);
                else next.delete("maxPrice");
                setSearchParams(next);
              }}
            />
          </label>
        </div>

        {loading ? (
          <Loader label="Searching stays..." />
        ) : error ? (
          <EmptyState title="Could not load stays" message={error} />
        ) : hotels.length === 0 ? (
          <EmptyState
            title="No stays match"
            message="Try another city, wider dates, or fewer filters."
          />
        ) : (
          <div className="search-layout">
            <div>
              <p className="search-count">{hotels.length} stays</p>
              <div className="hotel-grid">
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel._id}
                    hotel={hotel}
                    search={queryString}
                  />
                ))}
              </div>
            </div>
            <HotelMap hotels={hotels} height={620} />
          </div>
        )}
      </div>
    </div>
  );
}
