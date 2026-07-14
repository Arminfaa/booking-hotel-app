import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { hotelsApi } from "../api";
import SearchBar from "../components/hotels/SearchBar";
import HotelCard from "../components/hotels/HotelCard";
import Loader from "../components/ui/Loader";
import "./Home.css";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d6?w=1800&q=80";

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    hotelsApi
      .list({ limit: 6 })
      .then((res) => {
        if (alive) setHotels(res.data.hotels);
      })
      .catch(() => {
        if (alive) setHotels([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      <section className="hero">
        <div
          className="hero__media animate-fade"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          role="img"
          aria-label="Sunlit stay overlooking water"
        />
        <div className="hero__veil" />
        <div className="container hero__content">
          <p className="hero__brand animate-rise">Cove</p>
          <h1 className="animate-rise" style={{ animationDelay: "0.08s" }}>
            Stay where the light feels right.
          </h1>
          <p className="hero__lead animate-rise" style={{ animationDelay: "0.16s" }}>
            Browse distinctive apartments, villas, and cabins — then reserve dates
            with clear availability and honest pricing.
          </p>
          <div className="hero__search animate-rise" style={{ animationDelay: "0.24s" }}>
            <SearchBar />
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <p className="section__eyebrow">Featured stays</p>
          <div className="home-head">
            <div>
              <h2 className="section__title">Places worth the trip</h2>
              <p className="section__lead">
                Hand-picked listings across coasts, capitals, and quiet interiors.
              </p>
            </div>
            <Link className="btn btn--soft" to="/search">
              View all stays
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading featured stays..." />
          ) : (
            <div className="hotel-grid">
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="section home-story">
        <div className="container home-story__grid">
          <div>
            <p className="section__eyebrow">How Cove works</p>
            <h2 className="section__title">Search. Check dates. Book with confidence.</h2>
            <p className="section__lead">
              Availability is enforced on the server, bookings sync to your trips, and
              saved stays stay with your account — not just your browser.
            </p>
          </div>
          <ol className="home-steps">
            <li>
              <strong>01</strong>
              <span>Filter by city, dates, and guest count.</span>
            </li>
            <li>
              <strong>02</strong>
              <span>Review photos, amenities, and map location.</span>
            </li>
            <li>
              <strong>03</strong>
              <span>Reserve instantly and manage trips anytime.</span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
