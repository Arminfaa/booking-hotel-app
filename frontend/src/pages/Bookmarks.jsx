import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { bookmarksApi } from "../api";
import HotelCard from "../components/hotels/HotelCard";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";

export default function Bookmarks() {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    bookmarksApi
      .list()
      .then((res) => {
        if (alive) setBookmarks(res.data.bookmarks);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <Loader label="Loading saved stays..." />;

  const hotels = bookmarks.map((b) => b.hotel).filter(Boolean);

  return (
    <div className="section">
      <div className="container">
        <p className="section__eyebrow">Saved</p>
        <h1 className="section__title">Bookmarks</h1>
        <p className="section__lead" style={{ marginBottom: "1.75rem" }}>
          Places you’re considering — synced to your account.
        </p>

        {hotels.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            message="Tap Save on a stay page to keep it here."
            actionLabel="Explore stays"
            actionTo="/search"
          />
        ) : (
          <div className="hotel-grid">
            {hotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
