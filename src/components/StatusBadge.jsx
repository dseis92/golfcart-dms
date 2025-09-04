export default function StatusBadge({ status = "" }) {
  const s = String(status || "").toLowerCase();
  const tone =
    s === "available" ? "bg-emerald-100 text-emerald-700" :
    s === "in_service" ? "bg-blue-100 text-blue-700" :
    s === "sold" ? "bg-zinc-200 text-zinc-700" :
    s === "reserved" ? "bg-amber-100 text-amber-800" :
    s === "rental" ? "bg-purple-100 text-purple-700" :
    "bg-zinc-100 text-zinc-700";
  return <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${tone}`}>{s || "-"}</span>;
}
