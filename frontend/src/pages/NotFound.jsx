import EmptyState from "../components/ui/EmptyState";
import { tw } from "../styles/tw";

export default function NotFound() {
  return (
    <div className={tw.page}>
      <EmptyState
        title="Page not found"
        message="That route doesn’t exist in Cove."
        actionLabel="Go home"
        actionTo="/"
      />
    </div>
  );
}
