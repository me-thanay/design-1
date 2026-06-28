import { COORD_CATEGORY_MEDIA } from "@/lib/coord-category-media";

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
    featuredImageSrc: "/catogary-slider/saree/Banasari silk.jpeg",
    items: [
      { name: "Silk", href: "/categories/sarees?q=silk", imageSrc: "/catogary-slider/saree/Banasari silk.jpeg" },
      { name: "Georgette", href: "/categories/sarees?q=georgette", imageSrc: "/catogary-slider/saree/georgette.jpeg" },
      { name: "Organza", href: "/categories/sarees?q=organza", imageSrc: "/catogary-slider/saree/organza.jpeg" },
      { name: "Linen", href: "/categories/sarees?q=linen", imageSrc: "/catogary-slider/saree/linen.jpeg" },
    ],
  },
  {
    name: "KURTIS",
    href: "/categories/kurtis",
    featuredImageSrc: "/catogary-slider/kurti/party wear.jpeg",
    items: [
      { name: "Rayon", href: "/categories/kurtis?q=rayon", imageSrc: "/catogary-slider/kurti/rayon.jpeg" },
      { name: "Georgette", href: "/categories/kurtis?q=georgette", imageSrc: "/catogary-slider/kurti/georgette.jpeg" },
      { name: "Party wear", href: "/categories/kurtis?q=party", imageSrc: "/catogary-slider/kurti/party wear.jpeg" },
      { name: "Cotton", href: "/categories/kurtis?q=cotton", imageSrc: "/catogary-slider/kurti/cotton.jpeg" },
    ],
  },
  {
    name: "BLOUSES",
    href: "/categories/blouses",
    featuredImageSrc: "/catogary-slider/blouse/silk.jpeg",
    items: [
      { name: "Party wear", href: "/categories/blouses?q=party", imageSrc: "/catogary-slider/blouse/party wear.jpeg" },
      { name: "Cotton", href: "/categories/blouses?q=cotton", imageSrc: "/catogary-slider/blouse/cotton.jpeg" },
      { name: "Silk", href: "/categories/blouses?q=silk", imageSrc: "/catogary-slider/blouse/silk.jpeg" },
      { name: "Ajrakh", href: "/categories/blouses?q=ajrakh", imageSrc: "/catogary-slider/blouse/ajrakh.jpeg" },
    ],
  },
  {
    name: "GOWNS",
    href: "/categories/gowns",
    featuredImageSrc: "/catogary-slider/gown/party wear.jpeg",
    items: [
      { name: "Casual wear", href: "/categories/gowns?q=casual", imageSrc: "/catogary-slider/gown/casual wear.jpeg" },
      { name: "Party wear", href: "/categories/gowns?q=party", imageSrc: "/catogary-slider/gown/party wear.jpeg" },
    ],
  },
  {
    name: "COORD SET",
    href: "/categories/coord_sets",
    featuredImageSrc: "/catogary-slider/coordset/party wear.jpeg",
    items: [
      { name: "Casual wear", href: "/categories/coord_sets?q=casual", imageSrc: "/catogary-slider/coordset/casual wear.jpeg" },
      { name: "Party wear", href: "/categories/coord_sets?q=party", imageSrc: "/catogary-slider/coordset/party wear.jpeg" },
    ],
  },
  { name: "Shop", href: "/#shop" },
  { name: "Cart", href: "/cart" },
];

