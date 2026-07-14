import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { bookmarksApi } from "../api";
import HotelCard from "../components/hotels/HotelCard";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";

export default function SharedWishlist() {
  const { token } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bookmarksApi
      .shared(token)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <Loader label="Loading shared wishlist..." />;
  if (!data) {
    return (
      <EmptyState
        title="Wishlist not found"
        message="This share link may be invalid."
        actionLabel="Explore stays"
        actionTo="/search"
      />
    );
  }

  return (
    <div className="section">
      <div className="container">
        <p className="section__eyebrow">Shared wishlist</p>
        <h1 className="section__title">{data.owner?.name}&apos;s saved stays</h1>
        <div className="hotel-grid" style={{ marginTop: "1.5rem" }}>
          {data.hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      </div>
    </div>
  );
}
