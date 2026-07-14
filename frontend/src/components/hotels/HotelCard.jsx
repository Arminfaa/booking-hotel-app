import { Link } from "react-router-dom";
import { Flex, Tag, Typography } from "antd";
import { StarFilled } from "@ant-design/icons";
import { formatMoney } from "../../utils/format";

export default function HotelCard({ hotel, search = "" }) {
  const image = hotel.images?.[0];
  return (
    <article className="grid animate-[rise_0.65s_cubic-bezier(0.22,1,0.36,1)_both] gap-3.5">
      <Link
        to={`/hotels/${hotel._id}${search}`}
        className="relative block aspect-4/3 overflow-hidden rounded-cove border border-line"
      >
        <img
          src={image}
          alt={hotel.title}
          loading="lazy"
          className="size-full object-cover transition-transform duration-550 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105 hover:scale-105"
        />
        <Tag className="!absolute !bottom-3 !left-3 !m-0 !border-none !bg-paper/78 !text-ink capitalize backdrop-blur-sm">
          {hotel.propertyType}
        </Tag>
      </Link>
      <div>
        <Flex justify="space-between" align="center" gap={8}>
          <Typography.Text type="secondary" className="text-[0.9rem]">
            {hotel.city}, {hotel.country}
          </Typography.Text>
          <Typography.Text className="whitespace-nowrap !font-bold !text-sand">
            <StarFilled className="mr-1" />{" "}
            {hotel.ratingAverage?.toFixed?.(1) || "New"}
          </Typography.Text>
        </Flex>
        <Typography.Title level={4} className="!my-1 !text-[1.15rem]">
          <Link to={`/hotels/${hotel._id}${search}`} className="hover:text-sea">
            {hotel.title}
          </Link>
        </Typography.Title>
        <Typography.Text type="secondary">
          {hotel.maxGuests} guests · {hotel.bedrooms} bed · {hotel.bathrooms} bath
        </Typography.Text>
        <Typography.Paragraph className="!mt-2 !mb-0">
          <strong className="font-display text-[1.15rem]">
            {formatMoney(hotel.pricePerNight)}
          </strong>
          <Typography.Text type="secondary"> / night</Typography.Text>
        </Typography.Paragraph>
      </div>
    </article>
  );
}
