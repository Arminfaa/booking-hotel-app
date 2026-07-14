import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button, Drawer, Flex, Layout, Space, Typography } from "antd";
import {
  BookOutlined,
  CompassOutlined,
  LogoutOutlined,
  MenuOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useLocale } from "../../context/LocaleContext";
import { tw } from "../../styles/tw";

const { Header } = Layout;

function navLinkClass(active, drawer = false) {
  return [
    "inline-flex items-center gap-1.5 text-[0.92rem] font-semibold leading-tight text-ink-soft transition-colors hover:text-ink",
    active ? "text-sea!" : "",
    drawer ? "py-2.5 text-[1.05rem]" : "",
  ]
    .filter(Boolean)
    .join(" ");
}

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { t, locale, toggle } = useLocale();
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
      { to: "/search", label: t("explore"), icon: <CompassOutlined /> },
      { to: "/bookmarks", label: t("saved"), icon: <BookOutlined /> },
      { to: "/bookings", label: t("trips") },
      { to: "/messages", label: t("messages"), icon: <MessageOutlined /> },
    ];
    if (user?.role === "host" || user?.role === "admin") {
      items.push({ to: "/host", label: t("host") });
    }
    if (user?.role === "admin") {
      items.push({ to: "/admin", label: t("admin") });
    }
    return items;
  }, [t, user?.role]);

  async function handleLogout() {
    await logout();
    setOpen(false);
    navigate("/");
  }

  const authActions = isAuthenticated ? (
    <>
      <Link
        to="/profile"
        className={navLinkClass(location.pathname === "/profile")}
      >
        <UserOutlined /> {user?.name?.split(" ")[0] || "Profile"}
      </Link>
      <Button type="text" icon={<LogoutOutlined />} onClick={handleLogout}>
        {t("logout")}
      </Button>
    </>
  ) : (
    <>
      <Link to="/login" className={navLinkClass(false)}>
        {t("login")}
      </Link>
      <Button type="primary" onClick={() => navigate("/register")}>
        {t("signup")}
      </Button>
    </>
  );

  return (
    <Header
      className={[
        "!sticky top-0 z-100 !h-[4.25rem] !leading-[4.25rem] !p-0 backdrop-blur-[18px] backdrop-saturate-120 transition-[background,border-color,box-shadow] duration-250",
        scrolled
          ? "!border-b !border-line !bg-paper/88 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
          : "!border-b !border-transparent !bg-paper/55",
      ].join(" ")}
    >
      <div className={`${tw.container} flex h-full items-center justify-between gap-4`}>
        <Link to="/" className="inline-flex items-center gap-2.5">
          <span
            className="size-[0.95rem] animate-[markPulse_4s_ease-in-out_infinite] rounded-full bg-[radial-gradient(circle_at_30%_30%,#b8f0de,#5ec4a8_50%,#1a3d45)]"
            aria-hidden
          />
          <Typography.Text className="!font-display !text-[1.45rem] !font-bold !tracking-tight !text-ink">
            Cove
          </Typography.Text>
        </Link>

        <nav className="hidden items-center min-[921px]:flex">
          <Space size="middle" wrap={false}>
            {links.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={navLinkClass(location.pathname.startsWith(item.to))}
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <Button type="text" onClick={toggle}>
              {locale === "en" ? "FA" : "EN"}
            </Button>
            {authActions}
          </Space>
        </nav>

        <Button
          className="!hidden text-ink max-[920px]:!inline-flex"
          type="text"
          icon={<MenuOutlined />}
          aria-label="Open menu"
          onClick={() => setOpen(true)}
        />
      </div>

      <Drawer
        title={
          <span className="font-display text-[1.45rem] font-bold tracking-tight text-ink">
            Cove
          </span>
        }
        placement="right"
        open={open}
        onClose={() => setOpen(false)}
        width={300}
      >
        <Flex vertical gap="middle">
          {links.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={navLinkClass(location.pathname.startsWith(item.to), true)}
              onClick={() => setOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <Button type="text" onClick={toggle} className="!justify-start">
            {locale === "en" ? "فارسی" : "English"}
          </Button>
          <div className="mt-2 flex flex-col items-stretch gap-2.5 border-t border-line pt-4">
            {authActions}
          </div>
        </Flex>
      </Drawer>
    </Header>
  );
}
