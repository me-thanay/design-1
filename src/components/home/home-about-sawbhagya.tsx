import { Feature1 } from "@/components/ui/feature-1";

/**
 * About Sawbhagya — uses {@link Feature1} with brand copy and a local hero image.
 * Placed after New arrivals on the home page.
 */
export function HomeAboutSawbhagya() {
  return (
    <Feature1
      id="about"
      eyebrow="About Sawbhagya"
      title="Everyday elegance, rooted in who you are."
      titleEmphasis="Clothing that fits real life—and real occasions."
      paragraphs={[
        "Sawbhagya is a women’s fashion brand built around everyday elegance and cultural identity. The focus is on delivering sarees, ready-made blouses, kurtis, and gowns that balance tradition with modern design. Each collection is selected to suit daily wear, office needs, and special occasions without compromising on comfort or quality.",
        "The brand operates with a clear intent: make stylish ethnic wear accessible, reliable, and relevant to evolving preferences. Fabrics, fits, and finishes are prioritized to ensure consistency across products. Sawbhagya is not driven by fast fashion turnover but by curated choices that retain value over time.",
        "Rooted in Indian aesthetics, Sawbhagya serves women who want versatility in their wardrobe without complexity in decision-making. The goal is straightforward—provide clothing that fits real use, real occasions, and real expectations.",
      ]}
      imageSrc="/hero_imagesss/hero-1.jpeg"
      imageAlt="Sawbhagya — elegant ethnic wear draped in soft natural light"
      buttonPrimary={{ label: "Shop collections", href: "/#shop" }}
      buttonSecondary={{ label: "Browse categories", href: "/#categories" }}
    />
  );
}
