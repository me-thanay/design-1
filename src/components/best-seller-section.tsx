"use client";

import React from "react";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card-effect";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Sparkles } from "lucide-react";

type BestSellerItem = {
  title: string;
  subtitle: string;
  imageUrl: string;
  price: string;
  mrp?: string;
  badge?: string;
};

const items: BestSellerItem[] = [
  {
    title: "Bollywood Style Blouse",
    subtitle: "Statement sleeves · festive ready",
    imageUrl:
      "https://images.unsplash.com/photo-1520975958225-35f2804a30c7?auto=format&fit=crop&w=1600&q=80",
    price: "Rs. 849.00",
    mrp: "Rs. 1,899.00",
    badge: "Best Seller",
  },
  {
    title: "Mirror Muse Saree Set",
    subtitle: "Shimmer details · premium drape",
    imageUrl:
      "https://images.unsplash.com/photo-1520975682031-a3a74d4d6b56?auto=format&fit=crop&w=1600&q=80",
    price: "Rs. 1,799.00",
    mrp: "Rs. 7,999.00",
    badge: "Trending",
  },
  {
    title: "Pure Cotton Classic Blouse",
    subtitle: "Everyday comfort · breathable",
    imageUrl:
      "https://images.unsplash.com/photo-1520975661595-6453be3f7070?auto=format&fit=crop&w=1600&q=80",
    price: "Rs. 749.00",
    mrp: "Rs. 1,299.00",
    badge: "Under 999",
  },
];

export default function BestSellerSection() {
  return (
    <section className="bg-white">
      <div className="mx-auto max-w-6xl px-4 pb-14 pt-10">
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-neutral-500">
              Featured picks
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl">
              Best Seller
            </h2>
          </div>
          <Button variant="ghost" className="hidden sm:inline-flex">
            View More
          </Button>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {items.map((it) => (
            <CardContainer
              key={it.title}
              containerClassName="w-full"
              className="w-full"
            >
              <CardBody className="group/card relative h-auto w-full rounded-2xl border border-black/[0.08] bg-neutral-50 p-5 shadow-sm">
                {it.badge ? (
                  <CardItem
                    translateZ="40"
                    className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-neutral-900 shadow-sm"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    {it.badge}
                  </CardItem>
                ) : null}

                <CardItem
                  translateZ="35"
                  className="text-lg font-semibold text-neutral-900"
                >
                  {it.title}
                </CardItem>
                <CardItem
                  as="p"
                  translateZ="45"
                  className="mt-1 text-sm text-neutral-600"
                >
                  {it.subtitle}
                </CardItem>

                <CardItem translateZ="90" className="mt-4 w-full">
                  <img
                    src={it.imageUrl}
                    alt={it.title}
                    className="h-56 w-full rounded-xl object-cover shadow-md group-hover/card:shadow-xl"
                    loading="lazy"
                    referrerPolicy="no-referrer"
                  />
                </CardItem>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <CardItem
                      translateZ={30}
                      className="text-base font-semibold text-neutral-900"
                    >
                      {it.price}
                    </CardItem>
                    {it.mrp ? (
                      <CardItem
                        translateZ={25}
                        className="text-xs text-neutral-500 line-through"
                      >
                        {it.mrp}
                      </CardItem>
                    ) : null}
                  </div>

                  <CardItem translateZ={40} as="div">
                    <Button className="gap-2 rounded-xl">
                      <ShoppingBag className="h-4 w-4" />
                      Shop
                    </Button>
                  </CardItem>
                </div>
              </CardBody>
            </CardContainer>
          ))}
        </div>
      </div>
    </section>
  );
}

