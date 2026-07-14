import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { hotelsApi, uploadsApi } from "../api";
import { useAuth } from "../hooks/useAuth";
import Loader from "../components/ui/Loader";
import "./Host.css";

const emptyForm = {
  title: "",
  description: "",
  city: "",
  country: "",
  address: "",
  latitude: "",
  longitude: "",
  pricePerNight: 120,
  cleaningFee: 30,
  maxGuests: 2,
  bedrooms: 1,
  beds: 1,
  bathrooms: 1,
  propertyType: "apartment",
  cancellationPolicy: "moderate",
  amenities: "Wifi, Kitchen",
  images: "",
  isPublished: true,
};

export default function HostDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hotelId } = useParams();
  const [hotels, setHotels] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const res = await hotelsApi.mine();
      setHotels(res.data.hotels);
      if (hotelId) {
        const existing = res.data.hotels.find((h) => h._id === hotelId);
        if (existing) fillForm(existing);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (user?.role !== "host" && user?.role !== "admin") {
      navigate("/");
      return;
    }
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const res = await hotelsApi.mine();
        if (!alive) return;
        setHotels(res.data.hotels);
        if (hotelId) {
          const existing = res.data.hotels.find((h) => h._id === hotelId);
          if (existing) fillForm(existing);
        }
      } catch (err) {
        toast.error(err.message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user, hotelId, navigate]);

  function fillForm(hotel) {
    setForm({
      title: hotel.title,
      description: hotel.description,
      city: hotel.city,
      country: hotel.country,
      address: hotel.address,
      latitude: hotel.location?.coordinates?.[1] ?? "",
      longitude: hotel.location?.coordinates?.[0] ?? "",
      pricePerNight: hotel.pricePerNight,
      cleaningFee: hotel.cleaningFee,
      maxGuests: hotel.maxGuests,
      bedrooms: hotel.bedrooms,
      beds: hotel.beds,
      bathrooms: hotel.bathrooms,
      propertyType: hotel.propertyType,
      cancellationPolicy: hotel.cancellationPolicy || "moderate",
      amenities: (hotel.amenities || []).join(", "),
      images: (hotel.images || []).join("\n"),
      isPublished: hotel.isPublished,
    });
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const res = await uploadsApi.image(file);
      setForm((s) => ({
        ...s,
        images: s.images ? `${s.images}\n${res.data.url}` : res.data.url,
      }));
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(err.message);
    }
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        latitude: Number(form.latitude),
        longitude: Number(form.longitude),
        pricePerNight: Number(form.pricePerNight),
        cleaningFee: Number(form.cleaningFee),
        maxGuests: Number(form.maxGuests),
        bedrooms: Number(form.bedrooms),
        beds: Number(form.beds),
        bathrooms: Number(form.bathrooms),
        amenities: form.amenities
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        images: form.images
          .split("\n")
          .map((a) => a.trim())
          .filter(Boolean),
      };
      delete payload.isPublished;
      if (hotelId) {
        await hotelsApi.update(hotelId, { ...payload, isPublished: form.isPublished });
        toast.success("Listing updated");
      } else {
        await hotelsApi.create(payload);
        toast.success("Listing created");
        setForm(emptyForm);
      }
      await load();
      navigate("/host");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function removeHotel(id) {
    if (!confirm("Delete this listing?")) return;
    try {
      await hotelsApi.remove(id);
      toast.success("Deleted");
      load();
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading host dashboard..." />;

  return (
    <div className="section">
      <div className="container host-page">
        <p className="section__eyebrow">Host</p>
        <h1 className="section__title">Your listings</h1>

        <div className="host-layout">
          <div>
            <div className="host-list">
              {hotels.map((hotel) => (
                <article key={hotel._id} className="host-card">
                  <img src={hotel.images?.[0]} alt={hotel.title} />
                  <div>
                    <h3>{hotel.title}</h3>
                    <p>
                      {hotel.city} · {hotel.isPublished ? "Published" : "Draft"}
                    </p>
                    <div className="trip-card__actions">
                      <Link className="btn btn--soft" to={`/host/${hotel._id}`}>
                        Edit
                      </Link>
                      <Link className="btn btn--ghost" to={`/hotels/${hotel._id}`}>
                        View
                      </Link>
                      <button
                        className="btn btn--danger"
                        type="button"
                        onClick={() => removeHotel(hotel._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!hotels.length ? <p className="muted">No listings yet.</p> : null}
            </div>
          </div>

          <form className="host-form" onSubmit={onSubmit}>
            <h2>{hotelId ? "Edit listing" : "Add listing"}</h2>
            {[
              ["title", "Title"],
              ["city", "City"],
              ["country", "Country"],
              ["address", "Address"],
              ["latitude", "Latitude"],
              ["longitude", "Longitude"],
            ].map(([key, label]) => (
              <div className="field" key={key}>
                <label htmlFor={key}>{label}</label>
                <input
                  id={key}
                  value={form[key]}
                  onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                  required
                />
              </div>
            ))}
            <div className="field">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((s) => ({ ...s, description: e.target.value }))}
                required
              />
            </div>
            <div className="host-form__row">
              {[
                ["pricePerNight", "Price / night"],
                ["cleaningFee", "Cleaning fee"],
                ["maxGuests", "Max guests"],
              ].map(([key, label]) => (
                <div className="field" key={key}>
                  <label htmlFor={key}>{label}</label>
                  <input
                    id={key}
                    type="number"
                    value={form[key]}
                    onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                    required
                  />
                </div>
              ))}
            </div>
            <div className="host-form__row">
              <div className="field">
                <label htmlFor="propertyType">Type</label>
                <select
                  id="propertyType"
                  value={form.propertyType}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, propertyType: e.target.value }))
                  }
                >
                  {["apartment", "house", "villa", "cabin", "loft", "hotel"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="cancellationPolicy">Cancellation</label>
                <select
                  id="cancellationPolicy"
                  value={form.cancellationPolicy}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, cancellationPolicy: e.target.value }))
                  }
                >
                  {["flexible", "moderate", "strict"].map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="field">
              <label htmlFor="amenities">Amenities (comma-separated)</label>
              <input
                id="amenities"
                value={form.amenities}
                onChange={(e) => setForm((s) => ({ ...s, amenities: e.target.value }))}
              />
            </div>
            <div className="field">
              <label htmlFor="images">Image URLs (one per line)</label>
              <textarea
                id="images"
                value={form.images}
                onChange={(e) => setForm((s) => ({ ...s, images: e.target.value }))}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="upload">Or upload image</label>
              <input id="upload" type="file" accept="image/*" onChange={onUpload} />
            </div>
            {hotelId ? (
              <label className="host-check">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, isPublished: e.target.checked }))
                  }
                />
                Published
              </label>
            ) : null}
            <button className="btn btn--primary" disabled={saving}>
              {saving ? "Saving..." : hotelId ? "Update listing" : "Create listing"}
            </button>
            {hotelId ? (
              <Link className="btn btn--ghost" to="/host">
                New listing
              </Link>
            ) : null}
          </form>
        </div>
      </div>
    </div>
  );
}
