import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Col, Row, Space, Typography } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { hotelsApi } from "../api";
import SearchBar from "../components/hotels/SearchBar";
import HotelCard from "../components/hotels/HotelCard";
import Loader from "../components/ui/Loader";
import { tw } from "../styles/tw";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1501117716987-c8e1ecb210d6?w=1800&q=80";

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    hotelsApi
      .list({ limit: 8 })
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
    <div className={tw.pageFlush}>
      <section className="relative grid min-h-[calc(100svh-4.25rem)] items-center overflow-hidden text-white">
        <div
          className="absolute inset-0 animate-[fade_0.85s_ease_both] bg-cover bg-center [animation:heroZoom_18s_ease-in-out_alternate_infinite]"
          style={{ backgroundImage: `url(${HERO_IMAGE})` }}
          role="img"
          aria-label="Sunlit stay overlooking water"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,10,16,0.35)_0%,rgba(5,10,16,0.55)_42%,rgba(5,10,16,0.88)_100%),linear-gradient(90deg,rgba(5,10,16,0.55)_0%,transparent_55%)]" />
        <div className={`${tw.container} relative z-1 max-w-[960px] py-14 pb-12`}>
          <p className="mb-3 animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] bg-[linear-gradient(120deg,#f2f7f5_20%,#5ec4a8_95%)] bg-clip-text font-display text-[clamp(3rem,8vw,5.4rem)] font-bold leading-[0.92] tracking-[-0.04em] text-transparent">
            Cove
          </p>
          <Typography.Title
            level={1}
            className="animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] !mb-3 !max-w-[18ch] !text-[clamp(1.35rem,2.8vw,2rem)] !font-medium !text-[#f4f8f6]"
          >
            Stay where the light feels right.
          </Typography.Title>
          <Typography.Paragraph className="mb-6 max-w-lg animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] !text-[1.05rem] !text-[rgba(232,238,242,0.86)]">
            Browse distinctive apartments, villas, and cabins — then reserve dates
            with clear availability and honest pricing.
          </Typography.Paragraph>
          <div className="max-w-[980px] animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] [animation-delay:0.18s]">
            <SearchBar />
          </div>
        </div>
      </section>

      <section className={tw.page}>
        <div className={tw.container}>
          <div className={tw.pageHead}>
            <div>
              <span className={tw.eyebrow}>Featured stays</span>
              <Typography.Title level={2} className="!m-0">
                Places worth the trip
              </Typography.Title>
              <Typography.Paragraph type="secondary" className={tw.pageLead}>
                Hand-picked listings across coasts, capitals, and quiet interiors.
              </Typography.Paragraph>
            </div>
            <Link to="/search">
              <Button type="default" size="large">
                View all stays <ArrowRightOutlined />
              </Button>
            </Link>
          </div>

          {loading ? (
            <Loader label="Loading featured stays..." />
          ) : (
            <div className={tw.hotelGrid}>
              {hotels.map((hotel) => (
                <HotelCard key={hotel._id} hotel={hotel} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className={`${tw.page} !pt-0`}>
        <div className={tw.container}>
          <div
            className={`${tw.surface} animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] p-[clamp(1.5rem,4vw,2.5rem)]`}
          >
            <Row gutter={[40, 28]} align="middle">
              <Col xs={24} lg={13}>
                <span className={tw.eyebrow}>How Cove works</span>
                <Typography.Title level={2}>
                  Search. Check dates. Book with confidence.
                </Typography.Title>
                <Typography.Paragraph type="secondary" className="max-w-xl">
                  Availability is enforced on the server, bookings sync to your trips, and
                  saved stays stay with your account — not just your browser.
                </Typography.Paragraph>
              </Col>
              <Col xs={24} lg={11}>
                <Space direction="vertical" size="large" className="w-full">
                  {[
                    ["01", "Filter by city, dates, and guest count."],
                    ["02", "Review photos, amenities, and map location."],
                    ["03", "Reserve instantly and manage trips anytime."],
                  ].map(([n, text]) => (
                    <div key={n} className="grid grid-cols-[auto_1fr] items-start gap-4">
                      <span className="font-display text-[1.35rem] font-bold leading-none text-sea">
                        {n}
                      </span>
                      <Typography.Text>{text}</Typography.Text>
                    </div>
                  ))}
                </Space>
              </Col>
            </Row>
          </div>
        </div>
      </section>
    </div>
  );
}
