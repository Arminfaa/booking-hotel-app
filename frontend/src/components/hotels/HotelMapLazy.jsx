import { lazy, Suspense } from "react";
import Loader from "../ui/Loader";

const HotelMap = lazy(() => import("./HotelMap"));

export default function HotelMapLazy(props) {
  return (
    <Suspense fallback={<Loader label="Loading map..." fullPage={false} />}>
      <HotelMap {...props} />
    </Suspense>
  );
}
