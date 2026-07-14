import { Link } from "react-router-dom";
import { Col, Row, Typography } from "antd";
import { tw } from "../../styles/tw";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-line bg-gradient-to-b from-transparent to-black/28 py-11 pb-8">
      <div className={tw.container}>
        <Row gutter={[32, 24]} align="middle" justify="space-between">
          <Col xs={24} md={10}>
            <Typography.Title level={3} className="!mb-1.5 !text-sea">
              Cove
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="!m-0 max-w-sm">
              Distinctive stays, booked with clarity.
            </Typography.Paragraph>
          </Col>
          <Col xs={24} md={8}>
            <div className="flex flex-wrap gap-x-6 gap-y-4">
              {[
                ["/search", "Explore stays"],
                ["/bookings", "Your trips"],
                ["/register", "Host with us"],
              ].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="font-semibold text-ink-soft transition-colors hover:text-sea"
                >
                  {label}
                </Link>
              ))}
            </div>
          </Col>
          <Col xs={24} md={6}>
            <Typography.Text type="secondary" className="block text-[0.88rem]">
              © {new Date().getFullYear()} Cove Booking
            </Typography.Text>
          </Col>
        </Row>
      </div>
    </footer>
  );
}
