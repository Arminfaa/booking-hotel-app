import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Flex, Layout, Space, Typography } from "antd";
import {
  BookOutlined,
  CalendarOutlined,
  CompassOutlined,
  DashboardOutlined,
  HomeOutlined,
  LoginOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { tw } from "../../styles/tw";

const { Header } = Layout;

function isNavItemActive(pathname, to) {
  if (to === "/search") {
    return pathname === "/search" || pathname.startsWith("/hotels/");
  }
  return pathname === to || pathname.startsWith(`${to}/`);
}

function authLinkClass(active) {
  return [
    "inline-flex items-center gap-1.5 text-[0.92rem] font-semibold leading-tight transition-colors duration-250",
    active ? "!text-sea" : "text-ink-soft hover:text-ink",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  const links = useMemo(() => {
    const items = [
      { to: "/search", label: "Explore", icon: <CompassOutlined /> },
      { to: "/bookmarks", label: "Saved", icon: <BookOutlined /> },
      { to: "/bookings", label: "Bookings", icon: <CalendarOutlined /> },
      { to: "/messages", label: "Messages", icon: <MessageOutlined /> },
    ];
    if (user?.role === "host" || user?.role === "admin") {
      items.push({ to: "/host", label: "Host", icon: <HomeOutlined /> });
    }
    if (user?.role === "admin") {
      items.push({ to: "/admin", label: "Admin", icon: <DashboardOutlined /> });
    }
    return items;
  }, [user?.role]);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  const desktopAuthActions = isAuthenticated ? (
    <>
      <Link
        to="/profile"
        className={authLinkClass(
          location.pathname === "/profile" || location.pathname.startsWith("/profile/")
        )}
      >
        <UserOutlined /> {user?.name?.split(" ")[0] || "Profile"}
      </Link>
      <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
        Log out
      </Button>
    </>
  ) : (
    <>
      <Link to="/login" className={authLinkClass(location.pathname === "/login")}>
        <LoginOutlined /> Log in
      </Link>
      <Button
        type="primary"
        className={
          location.pathname === "/register"
            ? "!ring-2 !ring-sea !ring-offset-2 !ring-offset-paper"
            : ""
        }
        onClick={() => navigate("/register")}
      >
        Sign up
      </Button>
    </>
  );

  const drawerAuthActions = isAuthenticated ? (
    <div className="nav-drawer-auth">
      <Link
        to="/profile"
        className={["nav-drawer-auth-link", location.pathname === "/profile" || location.pathname.startsWith("/profile/") ? "is-active" : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen(false)}
      >
        <UserOutlined />
        <span>{user?.name || "Profile"}</span>
      </Link>
      <Button block icon={<LogoutOutlined />} onClick={handleLogout}>
        Log out
      </Button>
    </div>
  ) : (
    <div className="nav-drawer-auth">
      <Link
        to="/login"
        className={["nav-drawer-auth-link", location.pathname === "/login" ? "is-active" : ""]
          .filter(Boolean)
          .join(" ")}
        onClick={() => setOpen(false)}
      >
        <LoginOutlined />
        <span>Log in</span>
      </Link>
      <Button
        type="primary"
        block
        className={
          location.pathname === "/register"
            ? "!ring-2 !ring-sea !ring-offset-2 !ring-offset-paper"
            : ""
        }
        onClick={() => {
          setOpen(false);
          navigate("/register");
        }}
      >
        Sign up
      </Button>
    </div>
  );

  return (
    <Header
      className={[
        "navbar-header !sticky top-0 z-100 !h-14 !p-0 !leading-none backdrop-blur-[18px] backdrop-saturate-120 transition-[background,border-color,box-shadow] duration-250 lg:!h-[4.25rem]",
        scrolled
          ? "!border-b !border-line !bg-paper/88 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          : "!border-b !border-transparent !bg-paper/55",
      ].join(" ")}
    >
      <div className={`${tw.container} flex h-full items-center justify-between gap-2 sm:gap-4`}>
        <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-6 lg:flex-none">
          <Link to="/" className="inline-flex min-w-0 shrink-0 items-center gap-2 sm:gap-2.5">
            <span
              className="size-[0.85rem] shrink-0 animate-[markPulse_4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_30%_30%,#b8f0de,#5ec4a8_50%,#1a3d45)] sm:size-[0.95rem]"
              aria-hidden
            />
            <Typography.Text className="truncate !font-display !text-[1.2rem] !font-bold !tracking-tight !text-ink sm:!text-[1.45rem]">
              Cove
            </Typography.Text>
          </Link>

          <nav className="nav-links hidden! lg:flex!">
            {links.map((item) => {
              const active = isNavItemActive(location.pathname, item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={["nav-link", active ? "is-active" : ""].filter(Boolean).join(" ")}
                >
                  {item.icon} {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <div className="hidden items-center lg:flex">
            <Space size="middle" wrap={false}>
              {desktopAuthActions}
            </Space>
          </div>
          <Button
            className="inline-flex shrink-0 !text-ink lg:!hidden"
            type="text"
            size="large"
            icon={<MenuOutlined />}
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          />
        </div>
      </div>

      <Drawer
        title={
          <span className="font-display text-[1.35rem] font-bold tracking-tight text-ink sm:text-[1.45rem]">
            Cove
          </span>
        }
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width="min(100vw - 1.5rem, 20rem)"
        className="nav-drawer"
        styles={{
          header: { padding: "0.9rem 1rem" },
          body: { padding: "0.75rem 1rem 1.25rem" },
        }}
      >
        <Flex vertical gap={4} className="nav-drawer-links">
          {links.map((item) => {
            const active = isNavItemActive(location.pathname, item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                className={["nav-link-drawer", active ? "is-active" : ""]
                  .filter(Boolean)
                  .join(" ")}
                onClick={() => setOpen(false)}
              >
                <span className="nav-link-drawer__icon">{item.icon}</span>
                <span className="nav-link-drawer__label">{item.label}</span>
              </Link>
            );
          })}
          <div className="nav-drawer-divider" />
          {drawerAuthActions}
        </Flex>
      </Drawer>
    </Header>
  );
}
