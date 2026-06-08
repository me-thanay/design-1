import { cn } from "@/lib/utils";

type CategoryPageHeroShellProps = {
  imageSrc: string;
  imagePosition?: string;
  imageFit?: "cover" | "contain";
  minHeightClassName?: string;
  className?: string;
  children: React.ReactNode;
};

/**
 * Server-rendered hero backdrop for category pages.
 * CSS background layers paint correctly on first HTML paint (no img/object-fit flash).
 */
export function CategoryPageHeroShell({
  imageSrc,
  imagePosition = "50% 20%",
  imageFit = "cover",
  minHeightClassName = "min-h-[56svh] sm:min-h-[52svh]",
  className,
  children,
}: CategoryPageHeroShellProps) {
  if (!imageSrc) {
    return (
      <div className={cn("relative isolate w-full overflow-hidden bg-[#E7DFD6]", minHeightClassName, className)}>
        {children}
      </div>
    );
  }

  return (
    <div className={cn("relative isolate w-full overflow-hidden bg-[#E7DFD6]", minHeightClassName, className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
        {imageFit === "contain" ? (
          <div
            className="absolute inset-0 scale-[1.06] bg-cover bg-center bg-no-repeat opacity-60 blur-2xl"
            style={{
              backgroundImage: `url("${imageSrc}")`,
              backgroundPosition: imagePosition,
              filter: "saturate(1.05) contrast(1.05)",
            }}
          />
        ) : null}
        <div
          className={cn(
            "absolute inset-0 bg-center bg-no-repeat",
            imageFit === "contain" ? "bg-contain" : "bg-cover",
          )}
          style={{
            backgroundImage: `url("${imageSrc}")`,
            backgroundPosition: imagePosition,
            filter: "saturate(1.08) contrast(1.08)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/35" />
      </div>
      <div className="relative z-10 min-h-[inherit]">{children}</div>
    </div>
  );
}
