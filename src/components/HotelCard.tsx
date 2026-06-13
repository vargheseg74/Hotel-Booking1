/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Hotel } from '../types';
import { Star, MapPin, Phone, Mail, Sparkles, Building, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

interface HotelCardProps {
  key?: string;
  hotel: Hotel;
  isSelected: boolean;
  onSelect: () => void;
  roomsCountOnCatalog: number;
}

export default function HotelCard({ hotel, isSelected, onSelect, roomsCountOnCatalog }: HotelCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      transition={{ duration: 0.25 }}
      className={`bg-white dark:bg-stone-900 rounded-2xl border transition-all overflow-hidden flex flex-col h-full cursor-pointer ${
        isSelected
          ? 'border-[#C5A880] ring-1 ring-[#C5A880] shadow-md bg-[#FAF9F6]/20 dark:bg-stone-950/40 text-[#C1A57B]'
          : 'border-stone-200/60 dark:border-stone-850 shadow-xs hover:shadow-md text-stone-900 dark:text-stone-100'
      }`}
      onClick={onSelect}
    >
      {/* Hotel Image with details overlay */}
      <div className="relative h-48 w-full overflow-hidden bg-stone-100 dark:bg-stone-950">
        <img
          src={hotel.image}
          alt={hotel.name}
          className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
        
        {/* City Badge */}
        <div className="absolute top-4 left-4 bg-stone-900/90 backdrop-blur-xs text-[#C5A880] text-[9px] uppercase tracking-widest font-mono font-bold px-2.5 py-1 rounded">
          {hotel.city}
        </div>

        {/* Rating overlay */}
        <div className="absolute top-4 right-4 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xs text-stone-950 dark:text-[#C5A880] text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 shadow-sm border border-stone-205 dark:border-stone-800">
          <Star className="w-3.5 h-3.5 fill-[#C5A880] text-[#C5A880]" />
          <span>{hotel.rating.toFixed(1)}</span>
        </div>

        {/* Name and Tagline inside banner card */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="font-display text-lg font-bold tracking-tight text-[#FAF9F6] drop-shadow-sm truncate">
            {hotel.name}
          </h3>
          <p className="text-[10px] text-stone-200 font-mono tracking-wide mt-0.5 block truncate opacity-90">
            {hotel.tagline}
          </p>
        </div>
      </div>

      {/* Body specifications */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <p className="text-stone-500 dark:text-stone-400 text-xs leading-relaxed line-clamp-3">
            {hotel.description}
          </p>

          <div className="text-[11px] space-y-1 text-stone-600 dark:text-stone-400 font-mono">
            <div className="flex items-center gap-1.5 break-all">
              <MapPin className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span className="truncate">{hotel.location}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Building className="w-3.5 h-3.5 text-[#C5A880] shrink-0" />
              <span>{roomsCountOnCatalog} Exclusive Suites Built</span>
            </div>
          </div>

          {/* Key tags block */}
          <div className="flex flex-wrap gap-1 pt-1">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="bg-stone-50 dark:bg-stone-950 border border-stone-200/50 dark:border-stone-805 text-stone-500 dark:text-stone-400 font-mono text-[9px] px-2 py-0.5 rounded-md"
              >
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="border-t border-stone-150 dark:border-stone-800 pt-4 mt-4 flex items-center justify-between">
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-stone-400 dark:text-stone-500">
            {isSelected ? '★ Selected Estate' : 'View our collection'}
          </span>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all cursor-pointer ${
              isSelected
                ? 'bg-stone-900 dark:bg-stone-800 text-[#C5A880] hover:bg-stone-800 dark:hover:bg-stone-700'
                : 'bg-stone-50 dark:bg-stone-950 hover:bg-stone-100 dark:hover:bg-stone-850 border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300'
            }`}
          >
            <span>Rooms Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
