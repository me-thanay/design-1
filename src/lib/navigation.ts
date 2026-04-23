export type NavItem = {
  name: string;
  href: string;
  featuredImageSrc?: string;
  items?: Array<{ name: string; href: string; imageSrc?: string }>;
};

export const PRIMARY_NAV: NavItem[] = [
  {
    name: "SAREE",
    href: "/categories/sarees",
    featuredImageSrc: "/catogary-slider/saree/banarassilk-saree.jpeg",
    items: [
      { name: "Banasari silk", href: "/categories/sarees?q=banarasi%20silk", imageSrc: "/catogary-slider/saree/banarassilk-saree.jpeg" },
      { name: "Georgette", href: "/categories/sarees?q=georgette", imageSrc: "/catogary-slider/saree/Georgette-saree.jpeg" },
      { name: "Organza", href: "/categories/sarees?q=organza", imageSrc: "/catogary-slider/saree/Organza-saree.jpeg" },
      { name: "Modal silk", href: "/categories/sarees?q=modal%20silk", imageSrc: "/catogary-slider/saree/Modalsilk-saree.jpeg" },
      { name: "Linen", href: "/categories/sarees?q=linen", imageSrc: "/catogary-slider/saree/Linen-saree.jpeg" },
    ],
  },
  {
    name: "KURTIS",
    href: "/categories/kurtis",
    featuredImageSrc: "/stock_images/COTTON KURTI.jpeg",
    items: [
      { name: "Rayon", href: "/categories/kurtis?q=rayon", imageSrc: "/stock_images/Rayon Kurtis.jpeg" },
      { name: "Georgette", href: "/categories/kurtis?q=georgette", imageSrc: "/stock_images/GEORGETTE KURTI.jpeg" },
      { name: "Party wear", href: "/categories/kurtis?q=party", imageSrc: "/stock_images/PARTY WEAR KURTI.jpeg" },
      { name: "Cotton", href: "/categories/kurtis?q=cotton", imageSrc: "/stock_images/COTTON KURTI.jpeg" },
    ],
  },
  {
    name: "BLOUSES",
    href: "/categories/blouses",
    featuredImageSrc: "/catogary-slider/blouse/silk blouse.jpeg",
    items: [
      { name: "Party wear", href: "/categories/blouses?q=party", imageSrc: "/catogary-slider/blouse/party wear blouse.jpeg" },
      { name: "Cotton", href: "/categories/blouses?q=cotton", imageSrc: "/catogary-slider/blouse/cotton blouse.jpeg" },
      { name: "Silk", href: "/categories/blouses?q=silk", imageSrc: "/catogary-slider/blouse/silk blouse.jpeg" },
      { name: "Ajrakh", href: "/categories/blouses?q=ajrakh", imageSrc: "/catogary-slider/blouse/Ajrakh blouse.jpeg" },
    ],
  },
  {
    name: "GOWNS",
    href: "/categories/gowns",
    featuredImageSrc: "/catogary-slider/gown/PARTY WEAR GOWN.jpeg",
    items: [
      { name: "Casual wear", href: "/categories/gowns?q=casual", imageSrc: "/catogary-slider/gown/CASUAL WEAR GOWN.jpeg" },
      { name: "Party wear", href: "/categories/gowns?q=party", imageSrc: "/catogary-slider/gown/PARTY WEAR GOWN.jpeg" },
    ],
  },
  { name: "Shop", href: "/#shop" },
  { name: "Cart", href: "/cart" },
];

