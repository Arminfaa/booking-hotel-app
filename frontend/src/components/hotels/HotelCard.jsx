import { Link } from "react-router-dom";
import { HiOutlineStar } from "react-icons/hi";
import { formatMoney } from "../../utils/format";
import "./HotelCard.css";

export default function HotelCard({ hotel, search = "" }) {
  const image = hotel.images?.[0];
  return (
    <article className="hotel-card animate-rise">
      <Link to={`/hotels/${hotel._id}${search}`} className="hotel-card__media">
        <img src={image} alt={hotel.title} loading="lazy" />
        <span className="hotel-card__type">{hotel.propertyType}</span>
      </Link>
      <div className="hotel-card__body">
        <div className="hotel-card__top">
          <p className="hotel-card__place">
            {hotel.city}, {hotel.country}
          </p>
          <p className="hotel-card__rating">
            <HiOutlineStar /> {hotel.ratingAverage?.toFixed?.(1) || "New"}
          </p>
        </div>
        <h3>
          <Link to={`/hotels/${hotel._id}${search}`}>{hotel.title}</Link>
        </h3>
        <p className="hotel-card__meta">
          {hotel.maxGuests} guests · {hotel.bedrooms} bed · {hotel.bathrooms} bath
        </p>
        <p className="hotel-card__price">
          <strong>{formatMoney(hotel.pricePerNight)}</strong> / night
        </p>
      </div>
    </article>
  );
}
