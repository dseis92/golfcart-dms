"use client";
import Image from "next/image";

export default function PhotoGrid({ photos = [] }) {
  if (!photos.length) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-zinc-500">
        No photos yet. Use the uploader to add images.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {photos.map((p) => (
        <div key={p.id} className="relative aspect-video overflow-hidden rounded-lg border bg-zinc-50">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Cart photo"
            src={p.url}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
}
