import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button, Col, InputNumber, Row, Select, Typography } from "antd";
import { EnvironmentOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { hotelsApi } from "../api";
import SearchBar from "../components/hotels/SearchBar";
import HotelCard from "../components/hotels/HotelCard";
import HotelMap from "../components/hotels/HotelMap";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { tw } from "../styles/tw";

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

  function patchParam(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value != null && value !== "") next.set(key, String(value));
    else next.delete(key);
    setSearchParams(next);
  }

  const queryString = searchParams.toString()
    ? `?${searchParams.toString()}`
    : "";

  return (
    <div className={tw.page}>
      <div className={tw.container}>
        <span className={tw.eyebrow}>Explore</span>
        <Typography.Title level={1} className="!mb-5">
          Find your next stay
        </Typography.Title>
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

        <div
          className={`${tw.surface} my-5 mb-8 grid grid-cols-[auto_repeat(4,minmax(0,1fr))] items-end gap-3.5 p-4 max-[960px]:grid-cols-2 max-[520px]:grid-cols-1`}
        >
          <Button
            icon={<EnvironmentOutlined />}
            onClick={nearMe}
            loading={geoLoading}
          >
            Near me
          </Button>
          <div className={tw.field}>
            <label className={tw.fieldLabel}>Radius (km)</label>
            <InputNumber
              min={5}
              max={500}
              className="w-full"
              value={filters.radiusKm ? Number(filters.radiusKm) : null}
              onChange={(value) => patchParam("radiusKm", value)}
            />
          </div>
          <div className={tw.field}>
            <label className={tw.fieldLabel}>Type</label>
            <Select
              allowClear
              placeholder="Any"
              className="w-full"
              value={filters.propertyType || undefined}
              onChange={(value) => patchParam("propertyType", value)}
              options={["apartment", "house", "villa", "cabin", "loft", "hotel"].map(
                (type) => ({ value: type, label: type })
              )}
            />
          </div>
          <div className={tw.field}>
            <label className={tw.fieldLabel}>Min price</label>
            <InputNumber
              min={0}
              className="w-full"
              value={filters.minPrice ? Number(filters.minPrice) : null}
              onChange={(value) => patchParam("minPrice", value)}
            />
          </div>
          <div className={tw.field}>
            <label className={tw.fieldLabel}>Max price</label>
            <InputNumber
              min={0}
              className="w-full"
              value={filters.maxPrice ? Number(filters.maxPrice) : null}
              onChange={(value) => patchParam("maxPrice", value)}
            />
          </div>
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
          <Row gutter={[28, 28]}>
            <Col xs={24} lg={14} xl={15}>
              <Typography.Text type="secondary" className="font-semibold">
                {hotels.length} stays
              </Typography.Text>
              <div className={`${tw.hotelGrid} mt-4`}>
                {hotels.map((hotel) => (
                  <HotelCard
                    key={hotel._id}
                    hotel={hotel}
                    search={queryString}
                  />
                ))}
              </div>
            </Col>
            <Col xs={24} lg={10} xl={9}>
              <div
                className={`${tw.surface} sticky top-[calc(4.25rem+1rem)] overflow-hidden p-1.5 max-lg:static [&_.leaflet-container]:rounded-[14px]`}
              >
                <HotelMap hotels={hotels} height={620} />
              </div>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}
