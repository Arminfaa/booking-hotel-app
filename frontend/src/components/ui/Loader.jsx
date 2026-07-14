export default function Loader({ label = "Loading..." }) {
  return (
    <div className="loader" role="status" aria-live="polite">
      <div className="loader__spin" />
      <p>{label}</p>
    </div>
  );
}
