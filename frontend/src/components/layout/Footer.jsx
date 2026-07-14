import { Link } from "react-router-dom";
import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <p className="footer__brand">Cove</p>
          <p className="footer__tag">Distinctive stays, booked with clarity.</p>
        </div>
        <div className="footer__links">
          <Link to="/search">Explore stays</Link>
          <Link to="/bookings">Your trips</Link>
          <Link to="/register">Host with us</Link>
        </div>
        <p className="footer__copy">© {new Date().getFullYear()} Cove Booking</p>
      </div>
    </footer>
  );
}
