"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";

export interface MediaItemType {
  id: number;
  type: "video" | "image";
  title: string;
  desc: string;
  url: string;
  span: string;
  price?: string;
  mrp?: string;
  badge?: string;
}

const MediaItem = ({
  item,
  className,
  onClick,
}: {
  item: MediaItemType;
  className?: string;
  onClick?: () => void;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isInView, setIsInView] = useState(false);
  const [isBuffering, setIsBuffering] = useState(true);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => setIsInView(entry.isIntersecting));
      },
      { root: null, rootMargin: "50px", threshold: 0.1 },
    );

    const el = videoRef.current;
    if (el) observer.observe(el);

    return () => {
      if (el) observer.unobserve(el);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const handleVideoPlay = async () => {
      if (!videoRef.current || !isInView || !mounted) return;

      try {
        if (videoRef.current.readyState >= 3) {
          setIsBuffering(false);
          await videoRef.current.play();
          return;
        }

        setIsBuffering(true);
        await new Promise<void>((resolve) => {
          if (!videoRef.current) return resolve();
          videoRef.current.oncanplay = () => resolve();
        });

        if (!mounted || !videoRef.current) return;
        setIsBuffering(false);
        await videoRef.current.play();
      } catch (error) {
        console.warn("Video playback failed:", error);
      }
    };

    if (isInView) {
      void handleVideoPlay();
    } else if (videoRef.current) {
      videoRef.current.pause();
    }

    return () => {
      mounted = false;
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute("src");
        videoRef.current.load();
      }
    };
  }, [isInView]);

  if (item.type === "video") {
    return (
      <div className={`${className ?? ""} relative overflow-hidden`}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          onClick={onClick}
          playsInline
          muted
          loop
          preload="auto"
          style={{
            opacity: isBuffering ? 0.85 : 1,
            transition: "opacity 0.2s",
            transform: "translateZ(0)",
            willChange: "transform",
          }}
        >
          <source src={item.url} type="video/mp4" />
        </video>
        {isBuffering && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          </div>
        )}
      </div>
    );
  }

  return (
    <img
      src={item.url}
      alt={item.title}
      className={`${className ?? ""} cursor-pointer object-cover`}
      onClick={onClick}
      loading="lazy"
      decoding="async"
      referrerPolicy="no-referrer"
    />
  );
};

interface GalleryModalProps {
  selectedItem: MediaItemType;
  isOpen: boolean;
  onClose: () => void;
  setSelectedItem: (item: MediaItemType | null) => void;
  mediaItems: MediaItemType[];
}

const GalleryModal = ({
  selectedItem,
  isOpen,
  onClose,
  setSelectedItem,
  mediaItems,
}: GalleryModalProps) => {
  const [dockPosition, setDockPosition] = useState({ x: 0, y: 0 });

  if (!isOpen) return null;

  return (
    <>
      <motion.div
        initial={{ scale: 0.98 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="fixed inset-0 z-50 w-full overflow-hidden rounded-none sm:inset-6 sm:h-[calc(100vh-3rem)] sm:rounded-xl"
      >
        <div className="flex h-full flex-col bg-black/45">
          <div className="flex-1 p-2 sm:p-3 md:p-4">
            <div className="flex h-full items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedItem.id}
                  className="relative h-auto max-h-[75vh] w-full max-w-4xl overflow-hidden rounded-2xl shadow-2xl ring-1 ring-white/10"
                  initial={{ y: 20, scale: 0.97, opacity: 0 }}
                  animate={{
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transition: { type: "spring", stiffness: 500, damping: 30, mass: 0.5 },
                  }}
                  exit={{ y: 20, scale: 0.97, opacity: 0, transition: { duration: 0.15 } }}
                  onClick={onClose}
                >
                  <MediaItem
                    item={selectedItem}
                    className="h-full w-full bg-neutral-950/40 object-contain"
                    onClick={onClose}
                  />

                  <motion.button
                    className="absolute right-3 top-3 rounded-full bg-white/90 p-2 text-neutral-900 shadow-sm backdrop-blur-sm hover:bg-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClose();
                    }}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.92 }}
                    aria-label="Close"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                  <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-transparent" />
                    <div className="relative">
                      <h3 className="text-base font-semibold text-white sm:text-lg">{selectedItem.title}</h3>
                      <p className="mt-1 text-xs text-white/80 sm:text-sm">{selectedItem.desc}</p>
                      {(selectedItem.price || selectedItem.mrp) && (
                        <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1 text-white">
                          {selectedItem.price && (
                            <span className="text-sm font-semibold sm:text-base">{selectedItem.price}</span>
                          )}
                          {selectedItem.mrp && (
                            <span className="text-xs text-white/70 line-through sm:text-sm">
                              {selectedItem.mrp}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        
      </motion.div>

      <motion.div
        drag
        dragMomentum={false}
        dragElastic={0.1}
        initial={false}
        animate={{ x: dockPosition.x, y: dockPosition.y }}
        onDragEnd={(_, info) => {
          setDockPosition((prev) => ({ x: prev.x + info.offset.x, y: prev.y + info.offset.y }));
        }}
        className="fixed bottom-4 left-1/2 z-[60] -translate-x-1/2 touch-none"
      >
        <motion.div className="relative cursor-grab rounded-xl border border-white/20 bg-white/10 shadow-lg backdrop-blur-xl active:cursor-grabbing">
          <div className="flex items-center -space-x-2 px-3 py-2">
            {mediaItems.map((item, index) => (
              <motion.div
                key={item.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedItem(item);
                }}
                style={{ zIndex: selectedItem.id === item.id ? 30 : mediaItems.length - index }}
                className={[
                  "relative group h-9 w-9 flex-shrink-0 overflow-hidden rounded-lg",
                  "cursor-pointer hover:z-20",
                  selectedItem.id === item.id ? "ring-2 ring-white/70 shadow-lg" : "hover:ring-2 hover:ring-white/30",
                ].join(" ")}
                initial={{ rotate: index % 2 === 0 ? -14 : 14 }}
                animate={{
                  scale: selectedItem.id === item.id ? 1.18 : 1,
                  rotate: selectedItem.id === item.id ? 0 : index % 2 === 0 ? -14 : 14,
                  y: selectedItem.id === item.id ? -8 : 0,
                }}
                whileHover={{ scale: 1.28, rotate: 0, y: -10, transition: { type: "spring", stiffness: 400, damping: 25 } }}
              >
                <MediaItem item={item} className="h-full w-full" onClick={() => setSelectedItem(item)} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-white/15" />
                {selectedItem.id === item.id && (
                  <motion.div
                    layoutId="activeGlow"
                    className="absolute -inset-2 bg-white/20 blur-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </>
  );
};

export interface InteractiveBentoGalleryProps {
  mediaItems: MediaItemType[];
  title: string;
  description: string;
}

export default function InteractiveBentoGallery({
  mediaItems,
  title,
  description,
}: InteractiveBentoGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItemType | null>(null);
  const [items, setItems] = useState(mediaItems);
  const [isDragging, setIsDragging] = useState(false);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-12">
      <div className="mb-8 text-center">
        <motion.h2
          className="text-2xl font-semibold tracking-tight text-neutral-900 sm:text-3xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="mx-auto mt-2 max-w-2xl text-sm text-neutral-600 sm:text-base"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          {description}
        </motion.p>
      </div>

      <AnimatePresence mode="wait">
        {selectedItem ? (
          <GalleryModal
            selectedItem={selectedItem}
            isOpen={true}
            onClose={() => setSelectedItem(null)}
            setSelectedItem={setSelectedItem}
            mediaItems={items}
          />
        ) : (
          <motion.div
            className="grid auto-rows-[90px] grid-cols-2 gap-3 sm:auto-rows-[64px] sm:grid-cols-3 md:grid-cols-4"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={{
              hidden: { opacity: 0 },
              visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
            }}
          >
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                layoutId={`media-${item.id}`}
                className={`relative cursor-move overflow-hidden rounded-2xl ${item.span}`}
                onClick={() => !isDragging && setSelectedItem(item)}
                variants={{
                  hidden: { y: 26, scale: 0.96, opacity: 0 },
                  visible: {
                    y: 0,
                    scale: 1,
                    opacity: 1,
                    transition: { type: "spring", stiffness: 350, damping: 26, delay: index * 0.04 },
                  },
                }}
                whileHover={{ scale: 1.01 }}
                drag
                dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                dragElastic={1}
                onDragStart={() => setIsDragging(true)}
                onDragEnd={(_, info) => {
                  setIsDragging(false);
                  const moveDistance = info.offset.x + info.offset.y;
                  if (Math.abs(moveDistance) <= 50) return;

                  const newItems = [...items];
                  const draggedItem = newItems[index];
                  const targetIndex =
                    moveDistance > 0 ? Math.min(index + 1, items.length - 1) : Math.max(index - 1, 0);
                  newItems.splice(index, 1);
                  newItems.splice(targetIndex, 0, draggedItem);
                  setItems(newItems);
                }}
              >
                <MediaItem item={item} className="absolute inset-0 h-full w-full" onClick={() => !isDragging && setSelectedItem(item)} />

                {item.badge && (
                  <div className="absolute left-3 top-3 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {item.badge}
                  </div>
                )}
                <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                  <h3 className="relative line-clamp-1 text-sm font-semibold text-white">{item.title}</h3>
                  <p className="relative mt-0.5 line-clamp-2 text-xs text-white/75">{item.desc}</p>
                  {(item.price || item.mrp) && (
                    <div className="relative mt-2 flex items-baseline gap-2">
                      {item.price && <span className="text-xs font-semibold text-white">{item.price}</span>}
                      {item.mrp && (
                        <span className="text-[11px] text-white/70 line-through">{item.mrp}</span>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

