export default function RolePill({ role }) {
  const map = {
    admin: "bg-purple-100 text-purple-700",
    sales: "bg-emerald-100 text-emerald-700",
    tech: "bg-blue-100 text-blue-700",
    unknown: "bg-zinc-100 text-zinc-700"
  };
  const tone = map[role] || map.unknown;
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${tone}`}>{role}</span>;
}
