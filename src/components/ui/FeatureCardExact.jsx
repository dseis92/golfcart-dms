"use client";
import Link from "next/link";

export default function FeatureCardExact({
  icon: Icon,
  title,
  subtitle,
  openHref,
  primaryHref,
  primaryIcon: PrimaryIcon,
  primaryLabel,
  secondaryHref,
  secondaryLabel
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-100 text-zinc-700">
            {Icon ? <Icon className="h-5 w-5" /> : null}
          </div>
          <div>
            <div className="font-medium">{title}</div>
            {subtitle ? <div className="text-sm text-zinc-500">{subtitle}</div> : null}
          </div>
        </div>
        <Link href={openHref || "#"} className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-3 py-1.5 text-sm text-zinc-900 hover:bg-zinc-100">Open</Link>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link href={primaryHref || "#"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800">
          {PrimaryIcon ? <PrimaryIcon className="h-4 w-4" /> : null}
          {primaryLabel}
        </Link>
        <Link href={secondaryHref || "#"} className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm text-zinc-900 hover:bg-zinc-100">
          {secondaryLabel}
        </Link>
      </div>
    </div>
  );
}
