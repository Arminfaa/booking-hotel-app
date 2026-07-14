import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Typography } from "antd";
import { bookmarksApi } from "../api";
import HotelCard from "../components/hotels/HotelCard";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { tw } from "../styles/tw";

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
    <div className={tw.page}>
      <div className={tw.container}>
        <span className={tw.eyebrow}>Shared wishlist</span>
        <Typography.Title level={1}>
          {data.owner?.name}&apos;s saved stays
        </Typography.Title>
        <div className={`${tw.hotelGrid} mt-6`}>
          {data.hotels.map((hotel) => (
            <HotelCard key={hotel._id} hotel={hotel} />
          ))}
        </div>
      </div>
    </div>
  );
}
