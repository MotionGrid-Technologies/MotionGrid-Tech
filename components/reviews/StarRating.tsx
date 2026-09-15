import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

export function StarRating({ rating, size = 16 }: { rating: number; size?: number }) {
  return (
    <div
      className="flex items-center gap-1"
      role="img"
      aria-label={`${rating} out of 5 stars`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={cn(
            i < rating ? "fill-signal text-signal" : "text-chrome-700"
          )}
        />
      ))}
    </div>
  );
}
