export default function StatCard({ title, sub }) {
  return (
    <div className="stat">
      <div className="stat-title">{title}</div>
      <div className="stat-line" />
      <div className="stat-sub">{sub}</div>
    </div>
  );
}
