/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Room } from '../types';
import { Star, Users, ArrowUpRight, BedDouble, Square, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';

interface RoomCardProps {
  room: Room;
  onSelect: () => void;
}

export default function RoomCard({ room, onSelect }: RoomCardProps) {
  const [currentImgIdx, setCurrentImgIdx] = useState(0);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25 }}
      className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200/60 dark:border-stone-850 shadow-xs hover:shadow-lg transition-all overflow-hidden flex flex-col h-full text-stone-900 dark:text-stone-100"
    >
      {/* Thumbnail area with secondary images */}
      <div className="relative h-60 w-full overflow-hidden bg-stone-100 dark:bg-stone-950 group">
        <img
          src={room.images[currentImgIdx]}
          alt={room.name}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />
        
        {/* Floating Category Badge */}
        <div className="absolute top-4 left-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs text-stone-850 dark:text-stone-200 text-[9px] uppercase tracking-widest font-mono font-bold px-2.5 py-1 rounded border border-stone-150 dark:border-stone-800">
          {room.type}
        </div>

        {/* Featured Badge */}
        {room.featured && (
          <div className="absolute top-4 right-4 bg-stone-950 text-[#C5A880] text-[9.5px] uppercase tracking-widest font-semibold px-2.5 py-1 rounded">
            Highly Curated
          </div>
        )}

        {/* Bullet Image paginator dots */}
        {room.images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10 bg-black/25 px-2 py-1 rounded-full backdrop-blur-xs">
            {room.images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImgIdx(i);
                }}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  currentImgIdx === i ? 'bg-white w-3' : 'bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Body specifications */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2.5 mb-2.5">
            <div>
              <span className="block text-[10px] text-[#A88C52] font-mono uppercase tracking-wider mb-0.5 font-bold">
                {room.hotelName}
              </span>
              <h3 className="font-display text-lg md:text-xl font-semibold leading-tight text-stone-950 dark:text-stone-100">
                {room.name}
              </h3>
            </div>
            <span className="shrink-0 flex items-center gap-1 text-[#A88C52] font-mono text-xs font-semibold">
              <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
              {room.rating.toFixed(1)}
            </span>
          </div>

          <p className="text-stone-500 dark:text-stone-400 text-xs md:text-sm line-clamp-3 leading-relaxed mb-5">
            {room.description}
          </p>

          {/* Icon highlights block */}
          <div className="grid grid-cols-3 gap-2 py-3.5 border-y border-stone-150 dark:border-stone-800 mb-5 text-[11px] text-stone-500 font-mono">
            <div className="flex flex-col items-center gap-1 border-r border-stone-150 dark:border-stone-800 text-center">
              <Users className="w-4 h-4 text-stone-400" />
              <span>Up to {room.capacity} Guest{room.capacity > 1 ? 's' : ''}</span>
            </div>
            
            <div className="flex flex-col items-center gap-1 border-r border-stone-150 dark:border-stone-800 text-center">
              <BedDouble className="w-4 h-4 text-stone-400" />
              <span className="truncate max-w-[90%]">{room.bedType.replace(' Bed', '')}</span>
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <Square className="w-3.5 h-3.5 text-stone-400" />
              <span>{room.sizeSqFt} sq ft</span>
            </div>
          </div>
        </div>

        {/* Pricing & CTA trigger */}
        <div className="flex items-center justify-between gap-4 pt-4 mt-auto">
          <div>
            <span className="block text-[10px] uppercase font-mono tracking-wider text-stone-400 leading-none mb-1">Nightly rate Starting</span>
            <span className="text-xl font-bold font-mono text-stone-950 dark:text-[#C5A880]">
              ${room.pricePerNight}
              <span className="text-xs font-normal text-stone-400 dark:text-stone-500"> / night</span>
            </span>
          </div>

          <button
            onClick={onSelect}
            className="group px-4 py-2.5 bg-stone-950 hover:bg-stone-800 dark:bg-stone-800 dark:hover:bg-stone-700 text-white dark:text-[#C5A880] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer border border-[#C5A880]/10"
          >
            Details & Reserve
            <ArrowUpRight className="w-3.5 h-3.5 text-[#C5A880] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
