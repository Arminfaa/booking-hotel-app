import { tw } from "../../styles/tw";

export default function HotelCardSkeleton() {
  return (
    <article className="grid gap-3.5" aria-hidden="true">
      <div className="aspect-4/3 animate-pulse rounded-cove border border-line bg-elevated" />
      <div className="grid gap-2.5">
        <div className="flex items-center justify-between gap-2">
          <div className="h-3.5 w-28 animate-pulse rounded-cove-sm bg-elevated" />
          <div className="h-3.5 w-10 animate-pulse rounded-cove-sm bg-elevated" />
        </div>
        <div className="h-5 w-4/5 animate-pulse rounded-cove-sm bg-elevated" />
        <div className="h-3.5 w-3/5 animate-pulse rounded-cove-sm bg-elevated" />
        <div className="mt-1 h-5 w-24 animate-pulse rounded-cove-sm bg-elevated" />
      </div>
    </article>
  );
}

export function HotelCardSkeletonGrid({ count = 8, className = "" }) {
  return (
    <div
      className={`${tw.hotelGrid} ${className}`.trim()}
      role="status"
      aria-label="Loading stays"
    >
      {Array.from({ length: count }, (_, i) => (
        <HotelCardSkeleton key={i} />
      ))}
    </div>
  );
}
