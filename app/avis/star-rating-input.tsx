"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function StarRatingInput() {
  const [rating, setRating] = useState(5);
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;

  return (
    <div className="flex flex-col gap-[10px] mb-[14px]">
      <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-[rgba(140,120,255,0.65)]">
        Note
      </span>
      <div className="flex gap-[6px]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHovered(star)}
            onMouseLeave={() => setHovered(0)}
            className={`text-[28px] leading-none cursor-pointer bg-transparent border-none p-0 h-auto transition-[transform,color] duration-100 select-none hover:scale-110 hover:bg-transparent ${
              active >= star
                ? "text-[#f5c542] drop-shadow-[0_0_6px_rgba(245,197,66,0.6)]"
                : "text-[rgba(255,255,255,0.15)]"
            }`}
          >
            ★
          </Button>
        ))}
      </div>
      <input type="hidden" name="note" value={rating} />
    </div>
  );
}
