import EmptyState from "../components/ui/EmptyState";

export default function NotFound() {
  return (
    <EmptyState
      title="Page not found"
      message="That route doesn’t exist in Cove."
      actionLabel="Go home"
      actionTo="/"
    />
  );
}
