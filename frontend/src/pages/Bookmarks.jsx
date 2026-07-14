import { useEffect, useState } from "react";
import { Button, Typography } from "antd";
import { ShareAltOutlined } from "@ant-design/icons";
import toast from "react-hot-toast";
import { bookmarksApi } from "../api";
import HotelCard from "../components/hotels/HotelCard";
import EmptyState from "../components/ui/EmptyState";
import Loader from "../components/ui/Loader";
import { tw } from "../styles/tw";

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

  async function shareWishlist() {
    try {
      const res = await bookmarksApi.share();
      await navigator.clipboard.writeText(res.data.url);
      toast.success("Share link copied");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading saved stays..." />;

  const hotels = bookmarks.map((b) => b.hotel).filter(Boolean);

  return (
    <div className={tw.page}>
      <div className={tw.container}>
        <div className={tw.pageHead}>
          <div>
            <span className={tw.eyebrow}>Saved</span>
            <Typography.Title level={1} className="!mb-1">
              Bookmarks
            </Typography.Title>
            <Typography.Paragraph type="secondary" className={tw.pageLead}>
              Places you’re considering — synced to your account.
            </Typography.Paragraph>
          </div>
          {hotels.length ? (
            <Button icon={<ShareAltOutlined />} onClick={shareWishlist} size="large">
              Share wishlist
            </Button>
          ) : null}
        </div>

        {hotels.length === 0 ? (
          <EmptyState
            title="Nothing saved yet"
            message="Tap Save on a stay page to keep it here."
            actionLabel="Explore stays"
            actionTo="/search"
          />
        ) : (
          <div className={tw.hotelGrid}>
            {hotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
