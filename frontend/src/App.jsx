import { lazy, Suspense } from "react";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ScrollToTop from "./components/layout/ScrollToTop";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Loader from "./components/ui/Loader";
import { tw } from "./styles/tw";

const Home = lazy(() => import("./pages/Home"));
const Search = lazy(() => import("./pages/Search"));
const HotelDetail = lazy(() => import("./pages/HotelDetail"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Bookings = lazy(() => import("./pages/Bookings"));
const BookingDetail = lazy(() => import("./pages/BookingDetail"));
const Bookmarks = lazy(() => import("./pages/Bookmarks"));
const Profile = lazy(() => import("./pages/Profile"));
const HostDashboard = lazy(() => import("./pages/HostDashboard"));
const Admin = lazy(() => import("./pages/Admin"));
const Inbox = lazy(() => import("./pages/Inbox"));
const SharedWishlist = lazy(() => import("./pages/SharedWishlist"));
const NotFound = lazy(() => import("./pages/NotFound"));

function Shell() {
  return (
    <div className={tw.shell}>
      <ScrollToTop />
      <Navbar />
      <main className={tw.main}>
        <Suspense fallback={<Loader label="Loading..." />}>
          <Outlet />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: "#13202c",
              color: "#e8eef2",
              border: "1px solid rgba(148, 183, 200, 0.18)",
            },
          }}
        />
        <Routes>
          <Route element={<Shell />}>
            <Route index element={<Home />} />
            <Route path="search" element={<Search />} />
            <Route path="hotels/:id" element={<HotelDetail />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="wishlist/:token" element={<SharedWishlist />} />
            <Route
              path="bookings"
              element={
                <ProtectedRoute>
                  <Bookings />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookings/:id"
              element={
                <ProtectedRoute>
                  <BookingDetail />
                </ProtectedRoute>
              }
            />
            <Route
              path="bookmarks"
              element={
                <ProtectedRoute>
                  <Bookmarks />
                </ProtectedRoute>
              }
            />
            <Route
              path="profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="host"
              element={
                <ProtectedRoute>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="host/:hotelId"
              element={
                <ProtectedRoute>
                  <HostDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin"
              element={
                <ProtectedRoute>
                  <Admin />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route
              path="messages/:id"
              element={
                <ProtectedRoute>
                  <Inbox />
                </ProtectedRoute>
              }
            />
            <Route path="hotels" element={<Navigate to="/search" replace />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
