import * as React from "react";

const images = [
  // Local uploads — keep raw paths and encode at runtime (spaces + parentheses).
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM.jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM (1).jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM (2).jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM (3).jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM (4).jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM (5).jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.48 PM (6).jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.49 PM.jpeg",
  "/stock images/WhatsApp Image 2026-04-21 at 12.22.49 PM (1).jpeg",
].map((p) => encodeURI(p));

type ImageAutoSliderProps = {
  className?: string;
  durationSeconds?: number;
  title?: string;
  description?: string;
};

export const ImageAutoSlider = ({ className, durationSeconds = 20 }: ImageAutoSliderProps) => {
  const duplicatedImages = React.useMemo(() => [...images, ...images], []);

  return (
    <div className={className}>
      <div className="image-auto-slider__pause relative w-full overflow-hidden">
        <div className="image-auto-slider__mask">
          <div
            className="image-auto-slider__track motion-reduce:animate-none flex w-max gap-4 sm:gap-6"
            style={
              {
                ["--image-auto-slider-duration" as any]: `${durationSeconds}s`,
              } as React.CSSProperties
            }
          >
            {duplicatedImages.map((src, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                className="group relative h-44 w-44 flex-shrink-0 overflow-hidden rounded-2xl shadow-2xl sm:h-56 sm:w-56 lg:h-72 lg:w-72"
              >
                <img
                  src={src}
                  alt={`Showcase image ${(index % images.length) + 1}`}
                  className="h-full w-full bg-neutral-900 object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                  loading="lazy"
                />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-80" />
                <div className="pointer-events-none absolute inset-0 ring-1 ring-black/10" />
              </div>
            ))}
          </div>
        </div>

        <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-gradient-to-r from-[rgb(252_250_247)] to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[rgb(252_250_247)] to-transparent" />
      </div>
    </div>
  );
};

// Backwards-compatible export name for demos/snippets
export const Component = ImageAutoSlider;

