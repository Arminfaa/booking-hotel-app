import { Link } from "react-router-dom";

export default function EmptyState({
  title,
  message,
  actionLabel,
  actionTo,
}) {
  return (
    <div className="empty animate-rise">
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionTo ? (
        <Link className="btn btn--primary" to={actionTo} style={{ marginTop: "1.25rem" }}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
