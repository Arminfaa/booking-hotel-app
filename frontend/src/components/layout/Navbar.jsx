import { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { HiOutlineBookmark, HiOutlineMenuAlt3, HiOutlineX } from "react-icons/hi";
import { useAuth } from "../../hooks/useAuth";
import "./Navbar.css";

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="container nav__inner">
        <Link to="/" className="nav__brand" onClick={() => setOpen(false)}>
          <span className="nav__mark" aria-hidden />
          Cove
        </Link>

        <nav className={`nav__links ${open ? "nav__links--open" : ""}`}>
          <NavLink to="/search" onClick={() => setOpen(false)}>
            Explore
          </NavLink>
          <NavLink to="/bookmarks" onClick={() => setOpen(false)}>
            <HiOutlineBookmark /> Saved
          </NavLink>
          <NavLink to="/bookings" onClick={() => setOpen(false)}>
            Trips
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/profile" onClick={() => setOpen(false)}>
                {user?.name?.split(" ")[0] || "Profile"}
              </NavLink>
              <button className="btn btn--ghost" type="button" onClick={handleLogout}>
                Log out
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" onClick={() => setOpen(false)}>
                Log in
              </NavLink>
              <Link
                className="btn btn--primary"
                to="/register"
                onClick={() => setOpen(false)}
              >
                Sign up
              </Link>
            </>
          )}
        </nav>

        <button
          className="nav__toggle"
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <HiOutlineX size={24} /> : <HiOutlineMenuAlt3 size={24} />}
        </button>
      </div>
    </header>
  );
}
