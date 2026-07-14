import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import Home from "./pages/Home";
import Search from "./pages/Search";
import HotelDetail from "./pages/HotelDetail";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Bookings from "./pages/Bookings";
import BookingDetail from "./pages/BookingDetail";
import Bookmarks from "./pages/Bookmarks";
import Profile from "./pages/Profile";
import HostDashboard from "./pages/HostDashboard";
import Admin from "./pages/Admin";
import Inbox from "./pages/Inbox";
import SharedWishlist from "./pages/SharedWishlist";
import NotFound from "./pages/NotFound";
import { tw } from "./styles/tw";

function Shell() {
  return (
    <div className={tw.shell}>
      <Navbar />
      <main className={tw.main}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
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
  );
}
