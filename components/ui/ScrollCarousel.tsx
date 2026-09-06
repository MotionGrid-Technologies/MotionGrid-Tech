import { cn } from "@/lib/cn";

type ScrollCarouselProps<T> = {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  gridClassName: string;
  itemClassName: string;
  className?: string;
  scrollClassName?: string;
};

export function ScrollCarousel<T>({
  items,
  renderItem,
  gridClassName,
  itemClassName,
  className,
  scrollClassName,
}: ScrollCarouselProps<T>) {
  return (
    <div className={cn("-mx-4 overflow-hidden px-4 md:mx-0 md:overflow-visible md:px-0", className)}>
      <div
        className={cn(
          "flex gap-5 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide md:grid md:overflow-visible",
          gridClassName,
          scrollClassName
        )}
      >
        {items.map((item, index) => (
          <div key={index} className={cn("snap-start shrink-0", itemClassName)}>
            {renderItem(item, index)}
          </div>
        ))}
      </div>
    </div>
  );
}
