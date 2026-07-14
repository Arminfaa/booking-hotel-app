import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { InputNumber, Select } from "antd";
import toast from "react-hot-toast";
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
  const [geoLoading, setGeoLoading] = useState(false);

  const filters = useMemo(
    () => ({
      city: searchParams.get("city") || "",
      checkIn: searchParams.get("checkIn") || "",
      checkOut: searchParams.get("checkOut") || "",
      guests: searchParams.get("guests") || "",
      propertyType: searchParams.get("propertyType") || "",
      minPrice: searchParams.get("minPrice") || "",
      maxPrice: searchParams.get("maxPrice") || "",
      lat: searchParams.get("lat") || "",
      lng: searchParams.get("lng") || "",
      radiusKm: searchParams.get("radiusKm") || "",
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

  function nearMe() {
    if (!navigator.geolocation) {
      toast.error("Geolocation not supported");
      return;
    }
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next = new URLSearchParams(searchParams);
        next.set("lat", String(pos.coords.latitude));
        next.set("lng", String(pos.coords.longitude));
        next.set("radiusKm", filters.radiusKm || "80");
        setSearchParams(next);
        setGeoLoading(false);
      },
      () => {
        toast.error("Could not get your location");
        setGeoLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

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
          onSearch={(params) => {
            const next = { ...params };
            if (filters.lat) next.lat = filters.lat;
            if (filters.lng) next.lng = filters.lng;
            if (filters.radiusKm) next.radiusKm = filters.radiusKm;
            setSearchParams(next);
          }}
        />

        <div className="search-filters">
          <button className="btn btn--soft" type="button" onClick={nearMe} disabled={geoLoading}>
            {geoLoading ? "Locating..." : "Near me"}
          </button>
          <label>
            Radius (km)
            <InputNumber
              min={5}
              max={500}
              style={{ width: "100%" }}
              value={filters.radiusKm ? Number(filters.radiusKm) : null}
              onChange={(value) => {
                const next = new URLSearchParams(searchParams);
                if (value != null) next.set("radiusKm", String(value));
                else next.delete("radiusKm");
                setSearchParams(next);
              }}
            />
          </label>
          <label>
            Type
            <Select
              style={{ width: "100%" }}
              allowClear
              placeholder="Any"
              value={filters.propertyType || undefined}
              onChange={(value) => {
                const next = new URLSearchParams(searchParams);
                if (value) next.set("propertyType", value);
                else next.delete("propertyType");
                setSearchParams(next);
              }}
              options={["apartment", "house", "villa", "cabin", "loft", "hotel"].map(
                (type) => ({ value: type, label: type })
              )}
            />
          </label>
          <label>
            Min price
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              value={filters.minPrice ? Number(filters.minPrice) : null}
              onChange={(value) => {
                const next = new URLSearchParams(searchParams);
                if (value != null) next.set("minPrice", String(value));
                else next.delete("minPrice");
                setSearchParams(next);
              }}
            />
          </label>
          <label>
            Max price
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              value={filters.maxPrice ? Number(filters.maxPrice) : null}
              onChange={(value) => {
                const next = new URLSearchParams(searchParams);
                if (value != null) next.set("maxPrice", String(value));
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
