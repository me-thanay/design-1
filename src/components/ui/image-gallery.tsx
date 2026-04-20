"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";

export default function Example() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900&display=swap');
    
        * {
          font-family: 'Poppins', sans-serif;
        }
      `}</style>

      <section className="flex w-full flex-col items-center justify-start py-12">
        <div className="max-w-3xl px-4 text-center">
          <h1 className="text-3xl font-semibold">Our Latest Creations</h1>
          <p className="mt-2 text-sm text-slate-500">
            A visual collection of our most recent works – each piece crafted
            with intention, emotion, and style.
          </p>
        </div>

        <div className="mt-10 flex h-[400px] w-full max-w-5xl items-center gap-2 px-4">
          {[
            "https://images.unsplash.com/photo-1719368472026-dc26f70a9b76?q=80&h=800&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1649265825072-f7dd6942baed?q=80&h=800&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1555212697-194d092e3b8f?q=80&h=800&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1729086046027-09979ade13fd?q=80&h=800&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1601568494843-772eb04aca5d?q=80&h=800&w=800&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1585687501004-615dfdfde7f1?q=80&h=800&w=800&auto=format&fit=crop",
          ].map((src, idx) => (
            <div
              key={idx}
              className="group relative h-[400px] w-56 flex-grow overflow-hidden rounded-lg transition-all duration-500 hover:w-full"
            >
              <img
                className="h-full w-full object-cover object-center"
                src={src}
                alt={`image-${idx}`}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
