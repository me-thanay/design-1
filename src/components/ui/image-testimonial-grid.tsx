import * as React from "react";
import { motion, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MasonryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The number of columns to display.
   * @default 3
   */
  columns?: number;
  /**
   * The gap between items in the grid, corresponding to Tailwind's spacing scale.
   * @default 4
   */
  gap?: number;
}

const MasonryGrid = React.forwardRef<HTMLDivElement, MasonryGridProps>(
  ({ className, columns = 3, gap = 4, children, ...props }, ref) => {
    const style: React.CSSProperties = {
      columnCount: columns,
      columnGap: `${gap * 0.25}rem`,
    };

    const cardVariants: Variants = {
      hidden: { opacity: 0, y: 20 },
      visible: {
        opacity: 1,
        y: 0,
        transition: {
          duration: 0.5,
          ease: [0.16, 1, 0.3, 1],
        },
      },
    };

    return (
      <div ref={ref} style={style} className={cn("w-full", className)} {...props}>
        {React.Children.map(children, (child) => (
          <motion.div
            className="mb-4 break-inside-avoid"
            variants={cardVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
          >
            {child}
          </motion.div>
        ))}
      </div>
    );
  },
);

MasonryGrid.displayName = "MasonryGrid";

export { MasonryGrid };

