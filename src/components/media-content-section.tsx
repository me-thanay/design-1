"use client";

import * as React from "react";
import { MasonryGrid } from "@/components/ui/image-testimonial-grid";

type MediaCard = {
  profileImage: string;
  name: string;
  feedback: string;
  imageUrl: string;
};

const MediaTestimonialCard = ({ profileImage, name, feedback, imageUrl }: MediaCard) => (
  <div className="group relative overflow-hidden rounded-2xl ring-1 ring-black/10 transition-transform duration-300 ease-in-out hover:scale-[1.01]">
    <div className="relative w-full overflow-hidden bg-neutral-950 aspect-[16/10] sm:aspect-[16/9]">
      <img
        src={imageUrl}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
      />
    </div>
    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/15 to-transparent" />
    <div className="absolute left-0 top-0 p-3 sm:p-4 text-white">
      <div className="mb-2 flex items-center gap-3">
        <img
          src={profileImage}
          className="h-7 w-7 sm:h-8 sm:w-8 rounded-full border-2 border-white/80"
          alt={name}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={(e) => {
            e.currentTarget.src = "https://placehold.co/40x40/EFEFEF/333333?text=U";
          }}
        />
        <span className="text-[13px] sm:text-sm font-semibold drop-shadow-md">{name}</span>
      </div>
      <p className="max-w-[18rem] text-[13px] sm:text-sm font-medium leading-tight drop-shadow-md">
        {feedback}
      </p>
    </div>
  </div>
);

const mediaCards: MediaCard[] = [
  {
    profileImage: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Aanya",
    feedback: "Festive edit — got compliments all night.",
    imageUrl:
      "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "Studio",
    feedback: "Detail shot: embroidery + finish.",
    imageUrl:
      "https://images.unsplash.com/photo-1767125715251-c257c8f8cefe?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/11.jpg",
    name: "Ishita",
    feedback: "Soft drape. Premium feel.",
    imageUrl:
      "https://images.unsplash.com/photo-1507691754536-1d2b755da326?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/men/56.jpg",
    name: "Lookbook",
    feedback: "Jewelry + saree — perfect pairing.",
    imageUrl:
      "https://images.unsplash.com/photo-1771507056578-f9675a2a8f8a?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Niharika",
    feedback: "Work-ready essentials with a luxe touch.",
    imageUrl:
      "https://images.unsplash.com/photo-1692992193981-d3d92fabd9cb?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/men/78.jpg",
    name: "Creator",
    feedback: "Quick styling reel — drape in seconds.",
    imageUrl:
      "https://images.unsplash.com/photo-1742677143629-b9784beab2e1?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/women/88.jpg",
    name: "Zoya",
    feedback: "The blouse fit is so flattering.",
    imageUrl:
      "https://images.unsplash.com/photo-1769275061356-a038b498c4a7?auto=format&fit=crop&w=1600&q=80",
  },
  {
    profileImage: "https://randomuser.me/api/portraits/men/21.jpg",
    name: "Sawbhagya Picks",
    feedback: "Customer favorite: color + texture.",
    imageUrl:
      "https://images.unsplash.com/photo-1641699862936-be9f49b1c38d?auto=format&fit=crop&w=1600&q=80",
  },
];

export default function MediaContentSection() {
  const [columns, setColumns] = React.useState(4);

  React.useEffect(() => {
    const getColumns = (width: number) => {
      if (width < 640) return 1;
      if (width < 1024) return 2;
      if (width < 1280) return 3;
      return 4;
    };

    const handleResize = () => setColumns(getColumns(window.innerWidth));
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <section id="media-content" className="surface-texture">
      <div className="mx-auto w-full max-w-6xl px-4 pb-14 pt-6">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">Media Content</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">Seen on you</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base">
            Customer photos, detail shots, and lookbook moments — curated to match your vibe.
          </p>
        </div>

        <MasonryGrid columns={columns} gap={4}>
          {mediaCards.map((card, index) => (
            <MediaTestimonialCard key={index} {...card} />
          ))}
        </MasonryGrid>
      </div>
    </section>
  );
}

