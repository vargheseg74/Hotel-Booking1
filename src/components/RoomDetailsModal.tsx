/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Room, Booking, Review } from '../types';
import { GENERAL_REVIEWS, MOCK_ROOMS } from '../data';
import { X, Calendar, Users, Award, Percent, ChevronLeft, ChevronRight, ShieldCheck, CheckCircle2, Star, Utensils, Sparkles, Navigation, Layers, ShieldAlert, Smartphone } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface RoomDetailsModalProps {
  room: Room;
  defaultCheckIn: string;
  defaultCheckOut: string;
  defaultGuestsCount: number;
  onClose: () => void;
  onConfirmBooking: (bookingData: {
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    checkIn: string;
    checkOut: string;
    guestsCount: number;
    totalPrice: number;
    nightsCount: number;
    specialRequests: string[];
    specialRequestsText?: string;
    creditCardLast4: string;
    roomId: string;
    roomName: string;
    roomType: string;
    roomImage: string;
  }) => void;
  theme?: 'light' | 'dark';
}

export default function RoomDetailsModal({
  room,
  defaultCheckIn,
  defaultCheckOut,
  defaultGuestsCount,
  onClose,
  onConfirmBooking,
  theme = 'light'
}: RoomDetailsModalProps) {
  const [activeRoom, setActiveRoom] = useState<Room>(room);
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  // Dates state
  const [checkIn, setCheckIn] = useState(defaultCheckIn);
  const [checkOut, setCheckOut] = useState(defaultCheckOut);
  const [guestsCount, setGuestsCount] = useState(
    Math.min(defaultGuestsCount, activeRoom.capacity)
  );

  // Form states
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState<string[]>([]);
  const [specialRequestsText, setSpecialRequestsText] = useState('');

  // Payment method selection ('card' | 'applepay' | 'butler' | 'crypto')
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'butler' | 'crypto'>('card');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  
  // Custom payment inputs
  const [butlerCode, setButlerCode] = useState('');
  const [isAuthorizingFaceID, setIsAuthorizingFaceID] = useState(false);
  const [authorizedFaceIDSuccess, setAuthorizedFaceIDSuccess] = useState(false);

  // Validation output
  const [validationError, setValidationError] = useState('');

  // Financial breakdown state
  const [nights, setNights] = useState(1);
  const [roomSubtotal, setRoomSubtotal] = useState(activeRoom.pricePerNight);
  const [serviceFee, setServiceFee] = useState(75);
  const [luxuryTax, setLuxuryTax] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);

  // Carousel image lists
  const images = [
    activeRoom.image,
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
  ];

  // Auto-cap guest capacity
  useEffect(() => {
    if (guestsCount > activeRoom.capacity) {
      setGuestsCount(activeRoom.capacity);
    }
  }, [activeRoom]);

  // Recalculate billing details
  useEffect(() => {
    const start = new Date(checkIn);
    const bgEnd = new Date(checkOut);
    
    if (isNaN(start.getTime()) || isNaN(bgEnd.getTime())) {
      setValidationError('Please specify valid calendar dates.');
      return;
    }

    const differenceInTime = bgEnd.getTime() - start.getTime();
    const computedNights = Math.round(differenceInTime / (1000 * 3600 * 24));

    if (computedNights < 1) {
      setNights(1);
      setRoomSubtotal(activeRoom.pricePerNight);
      setValidationError('Check-Out date must occur at least 1 night after Check-In.');
      return;
    }

    setValidationError('');
    setNights(computedNights);
    
    const sub = activeRoom.pricePerNight * computedNights;
    setRoomSubtotal(sub);

    // Premium request adjustments
    let requestExtras = 0;
    if (specialRequests.includes('In-Bed Michelin Breakfast')) {
      requestExtras += 45 * computedNights;
    }
    if (specialRequests.includes('Dom Pérignon Ice Preparation')) {
      requestExtras += 285;
    }

    const calculatedTax = Math.round(sub * 0.10);
    setLuxuryTax(calculatedTax);
    
    const baseServiceFee = 75;
    setServiceFee(baseServiceFee);
    
    setGrandTotal(sub + baseServiceFee + calculatedTax + requestExtras);
  }, [checkIn, checkOut, specialRequests, activeRoom.pricePerNight]);

  const handleRequestToggle = (req: string) => {
    if (specialRequests.includes(req)) {
      setSpecialRequests(specialRequests.filter(r => r !== req));
    } else {
      setSpecialRequests([...specialRequests, req]);
    }
  };

  // Submit Handler with Simulated Scan support
  const handleSubmitBooking = (e: React.FormEvent) => {
    e.preventDefault();

    const start = new Date(checkIn);
    const bgEnd = new Date(checkOut);
    if (isNaN(start.getTime()) || isNaN(bgEnd.getTime())) {
      setValidationError('Please select valid calendar dates.');
      return;
    }
    const computedNights = Math.round((bgEnd.getTime() - start.getTime()) / (1000 * 3600 * 24));
    if (computedNights < 1) {
      setValidationError('Stay interval must sum to progressive nights.');
      return;
    }

    if (!guestName.trim()) {
      setValidationError('Please enter a valid guest coordinator registration name.');
      return;
    }
    if (!guestEmail.trim() || !guestEmail.includes('@')) {
      setValidationError('Please enter a valid email coordinates.');
      return;
    }

    // Process payment authorization validations
    let cardLast4 = '9012';
    if (paymentMethod === 'card') {
      const cleanNum = cardNumber.replace(/\s+/g, '');
      if (cleanNum.length < 15) {
        setValidationError('A valid 15-16 digit luxury credit card number is required to guarantee check-in.');
        return;
      }
      if (cardExpiry.length < 5) {
        setValidationError('Expired or blank credit card expiration date.');
        return;
      }
      if (cardCvv.length < 3) {
        setValidationError('Please provide the 3-4 digit secure card CVV verification code.');
        return;
      }
      cardLast4 = cleanNum.slice(-4);
    } else if (paymentMethod === 'applepay') {
      if (!authorizedFaceIDSuccess) {
        setIsAuthorizingFaceID(true);
        setTimeout(() => {
          setIsAuthorizingFaceID(false);
          setAuthorizedFaceIDSuccess(true);
          // Auto fire the submission after scan completes
          onConfirmBooking({
            guestName,
            guestEmail,
            guestPhone,
            checkIn,
            checkOut,
            guestsCount,
            totalPrice: grandTotal,
            nightsCount: computedNights,
            roomId: activeRoom.id,
            roomName: activeRoom.name,
            roomType: activeRoom.type,
            roomImage: activeRoom.image,
            specialRequests,
            specialRequestsText,
            creditCardLast4: ' Pay Authorized',
          });
        }, 1800);
        return;
      }
      cardLast4 = ' Pay';
    } else if (paymentMethod === 'butler') {
      if (!butlerCode.trim() || butlerCode.length < 4) {
        setValidationError('Your Butler Voucher Code format appears unauthenticated. Try "AURELIA-ST-99".');
        return;
      }
      cardLast4 = `Voucher ID: ${butlerCode.slice(0, 4).toUpperCase()}••`;
    } else if (paymentMethod === 'crypto') {
      cardLast4 = 'Solana Stratos Peer';
    }

    // Submit confirmed parameters
    onConfirmBooking({
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      guestsCount,
      totalPrice: grandTotal,
      nightsCount: computedNights,
      roomId: activeRoom.id,
      roomName: activeRoom.name,
      roomType: activeRoom.type,
      roomImage: activeRoom.image,
      specialRequests,
      specialRequestsText,
      creditCardLast4: cardLast4,
    });
  };

  // Curate hotel specific review
  const roomReview = GENERAL_REVIEWS.find(r => r.hotelId === activeRoom.hotelId) || GENERAL_REVIEWS[0];

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-0 md:p-4 overflow-y-auto">
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className={`w-full max-w-6xl md:rounded-3xl shadow-2xl overflow-hidden relative border min-h-screen md:min-h-0 transition-colors duration-300 ${
          theme === 'dark' 
            ? 'bg-stone-900 border-stone-800 text-stone-100' 
            : 'bg-white border-stone-200 text-stone-900'
        }`}
      >
        {/* Absolute face scan lock screen indicator */}
        <AnimatePresence>
          {isAuthorizingFaceID && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-stone-950/95 backdrop-blur-lg flex flex-col items-center justify-center text-white z-50"
            >
              <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#C5A880]/60 flex items-center justify-center animate-spin mb-6">
                <Smartphone className="w-8 h-8 text-[#C5A880]" />
              </div>
              <h4 className="font-mono text-xs tracking-widest font-bold text-[#C5A880] uppercase">
                 PAY: SECRECON FACE-ID SCAN
              </h4>
              <p className="text-[10px] text-stone-400 mt-2 italic">
                Validating luxury biometric credentials via client-sandbox framework...
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TOP NAVBAR PORTFOLIO HEADER */}
        <div className={`p-4 md:p-6 flex items-center justify-between border-b ${
          theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-[#FAF9F6] border-stone-150'
        }`}>
          <div>
            <h2 className="font-display text-lg md:text-xl font-medium tracking-tight">
              Aurelia Luxury Check-out Sheet
            </h2>
            <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest leading-none mt-1">
              Guaranteed Reservation Concierge Vault &bull; {activeRoom.hotelName}
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="p-1 px-3 border border-stone-300 dark:border-stone-800 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-xs text-stone-500 font-mono transition-all cursor-pointer"
          >
            ✕ Close
          </button>
        </div>

        {/* TWO COLUMN GRID CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 max-h-[85vh] md:max-h-none overflow-y-auto">
          
          {/* LEFT PANEL: Carousel, Amenities specs, Reviews (5 cols) */}
          <div className={`lg:col-span-5 border-b lg:border-b-0 lg:border-r p-6 md:p-8 flex flex-col justify-between ${
            theme === 'dark' ? 'bg-stone-950/30 border-stone-800' : 'bg-stone-50/50 border-stone-150'
          }`}>
            <div className="space-y-6">
              {/* Luxury Image Showcase Carousel */}
              <div className="relative rounded-2xl overflow-hidden h-60 md:h-64 shadow-md bg-stone-900">
                <img
                  src={images[activeImgIndex]}
                  alt={activeRoom.name}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                
                {/* Dots indicator index navigation */}
                <div className="absolute bottom-4 inset-x-0 flex justify-center gap-1.5 z-10">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImgIndex(i)}
                      className={`w-2 h-2 rounded-full cursor-pointer transition-all ${
                        activeImgIndex === i ? 'bg-[#C5A880] w-4' : 'bg-white/50'
                      }`}
                    />
                  ))}
                </div>

                <div className="absolute top-3 right-3 bg-stone-900/80 backdrop-blur-md border border-[#C5A880]/20 text-[#C5A880] text-[9px] font-mono uppercase px-3 py-1 rounded-full font-semibold">
                  {activeRoom.city} Collection
                </div>
              </div>

              {/* Selection Specs Summary Text */}
              <div>
                <span className="text-[10px] bg-[#A88C52]/10 text-[#A88C52] border border-[#a88c52]/10 font-bold tracking-widest px-2.5 py-0.5 rounded-md font-mono uppercase inline-block mb-2">
                  {activeRoom.type} Suite
                </span>
                <h3 className="font-display text-2xl font-semibold tracking-tight">
                  {activeRoom.name}
                </h3>
                <p className="text-xs text-stone-500 leading-relaxed mt-2.5">
                  {activeRoom.description || "Indulge in French Riviera quiet luxury, styled specifically with floor-to-ceiling panoramic sliding panels, fine Italian stonemasonry details, and a dedicated room host."}
                </p>
              </div>

              {/* Offer Badge Ribbon */}
              <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                theme === 'dark' ? 'bg-[#D2C9B1]/5 border-[#D2C9B1]/10' : 'bg-[#E4DCCF]/20 border-[#E4DCCF]/40'
              }`}>
                <Award className="w-5 h-5 text-[#A88C52] shrink-0 animate-bounce" />
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#A88C52] font-semibold block leading-tight">Elite Partner Offer Included</span>
                  <span className="text-xs font-semibold block text-stone-850 dark:text-stone-300 mt-0.5">
                    {activeRoom.pricePerNight >= 600 ? "Inclusive Private Helicopter airport arrival" : "Complimentary bottle of Dom Pérignon Brut on ice"}
                  </span>
                </div>
              </div>

              {/* Specifications checklist icons layout */}
              <div>
                <h4 className="text-[9px] font-mono font-bold uppercase tracking-widest text-[#A88C52] mb-3">Inclusive Suite Conveniences</h4>
                <ul className="grid grid-cols-2 gap-2 text-xs text-stone-500">
                  {activeRoom.amenities.map((amenity, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#C5A880]" />
                      <span>{amenity}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Custom Reviews snapshot */}
            <div className={`border-t pt-5 mt-6 border-stone-200/50`}>
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={roomReview.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80"}
                  alt={roomReview.author}
                  className="w-8 h-8 rounded-full object-cover border border-[#C5A880]/30"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <span className="text-xs font-semibold block">{roomReview.author}</span>
                  <span className="text-[9px] text-[#A88C52] font-mono block">Aurelia Verified Log</span>
                </div>
              </div>
              <p className="text-stone-500 font-serif italic text-xs leading-relaxed">
                "{roomReview.comment.slice(0, 140)}..."
              </p>
            </div>

          </div>

          {/* RIGHT PANEL: Suite configuration, check-in checkout, customized payments tabs (7 cols) */}
          <div className="lg:col-span-7 p-6 md:p-8 flex flex-col justify-between font-sans">
            <form onSubmit={handleSubmitBooking} className="space-y-6">
              
              {/* Dynamic room-type selector dropdown nested directly inside check-out */}
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#A88C52] font-bold mb-4 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#A88C52]" />
                  <span>Sanctuary & Living Preferences</span>
                </h3>

                <div className={`p-4 rounded-xl border mb-4 ${
                  theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-white border-stone-150'
                }`}>
                  <label className="text-[10px] uppercase font-mono tracking-widest text-stone-400 font-bold block mb-1">
                    Selected Sanctuary Space (Live Switch)
                  </label>
                  <select
                    value={activeRoom.id}
                    onChange={(e) => {
                      const selected = MOCK_ROOMS.find(r => r.id === e.target.value);
                      if (selected) {
                        setActiveRoom(selected);
                        setActiveImgIndex(0);
                      }
                    }}
                    className={`w-full text-xs font-semibold p-2.5 rounded-lg border outline-none cursor-pointer focus:border-[#C5A880] ${
                      theme === 'dark' ? 'bg-stone-950 border-stone-805 text-stone-200' : 'bg-stone-50 border-stone-200 text-stone-800'
                    }`}
                  >
                    {MOCK_ROOMS.filter(r => r.hotelId === activeRoom.hotelId).map((r) => (
                      <option key={r.id} value={r.id}>
                        [{r.type}] {r.name} &bull; ${r.pricePerNight} / night
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date specifications inputs */}
                <div className={`grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 rounded-xl border ${
                  theme === 'dark' ? 'bg-stone-950/40 border-stone-800' : 'bg-[#FAF9F6]/80 border-stone-150 shadow-xs'
                }`}>
                  <div>
                    <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Check-In</label>
                    <input
                      type="date"
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      required
                      min="2026-06-13"
                      className={`w-full text-xs font-mono p-2 rounded-lg border outline-none ${
                        theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-205 text-stone-800 bg-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Check-Out</label>
                    <input
                      type="date"
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      required
                      className={`w-full text-xs font-mono p-2 rounded-lg border outline-none ${
                        theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-205 text-stone-800 bg-white'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Guests Count</label>
                    <select
                      value={guestsCount}
                      onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                      className={`w-full text-xs font-semibold p-2 rounded-lg border outline-none cursor-pointer ${
                        theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-205 text-stone-850'
                      }`}
                    >
                      {Array.from({ length: activeRoom.capacity }, (_, index) => (
                        <option key={index + 1} value={index + 1}>
                          {index + 1} Guest{index + 1 > 1 ? 's' : ''} (Max {activeRoom.capacity})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

              </div>

              {/* Special check box choices */}
              <div>
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A88C52] mb-3">Bespoke Guest Additions</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
                  <label className={`border p-3 rounded-xl flex items-start gap-2.5 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-all ${
                    specialRequests.includes('In-Bed Michelin Breakfast') ? 'border-[#C5A880] bg-[#E4DCCF]/15 text-stone-900 dark:text-[#C5A880]' : 'border-stone-200 dark:border-stone-800'
                  }`}>
                    <input
                      type="checkbox"
                      checked={specialRequests.includes('In-Bed Michelin Breakfast')}
                      onChange={() => handleRequestToggle('In-Bed Michelin Breakfast')}
                      className="mt-0.5 rounded text-[#A88C52] focus:ring-[#C5A880] cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold block">Michelin Breakfast in Bed</span>
                      <span className="text-stone-450 text-[10px] block mt-0.5 font-mono">+$45 / night</span>
                    </div>
                  </label>

                  <label className={`border p-3 rounded-xl flex items-start gap-2.5 cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-800/20 transition-all ${
                    specialRequests.includes('Dom Pérignon Ice Preparation') ? 'border-[#C5A880] bg-[#E4DCCF]/15 text-stone-900 dark:text-[#C5A880]' : 'border-stone-200 dark:border-stone-800'
                  }`}>
                    <input
                      type="checkbox"
                      checked={specialRequests.includes('Dom Pérignon Ice Preparation')}
                      onChange={() => handleRequestToggle('Dom Pérignon Ice Preparation')}
                      className="mt-0.5 rounded text-[#A88C52] focus:ring-[#C5A880] cursor-pointer"
                    />
                    <div>
                      <span className="font-semibold block">Dom Pérignon Ice Preparation</span>
                      <span className="text-stone-450 text-[10px] block mt-0.5 font-mono">+$285 flat rate</span>
                    </div>
                  </label>
                </div>

                <div className="space-y-1.5 mt-3">
                  <label className="block text-[11px] text-stone-500 font-medium">Pre-Arrival Host Instruction Note</label>
                  <textarea
                    placeholder="e.g. Kindly prepare standard hypoallergenic sheets, champagne cooled ahead of time, private yacht mooring specifications..."
                    value={specialRequestsText}
                    onChange={(e) => setSpecialRequestsText(e.target.value)}
                    rows={1}
                    className={`w-full border rounded-xl p-3 text-xs outline-none resize-none focus:border-[#C5A880] ${
                      theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-250' : 'bg-white border-stone-200 text-stone-800'
                    }`}
                  />
                </div>
              </div>

              {/* Guest Steward Details */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A88C52]">
                  Guest Registration & Credentials
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Full Guest Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Charlotte de Larrey"
                      value={guestName}
                      onChange={(e) => setGuestName(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2 text-xs outline-none focus:border-[#C5A880] ${
                        theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Email Destination</label>
                    <input
                      type="email"
                      required
                      placeholder="charlotte@luxury.com"
                      value={guestEmail}
                      onChange={(e) => setGuestEmail(e.target.value)}
                      className={`w-full border rounded-xl px-4 py-2 text-xs outline-none focus:border-[#C5A880] ${
                        theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-mono uppercase text-stone-400 mb-1">Mobile Hotline</label>
                  <input
                    type="tel"
                    required
                    placeholder="+33 60 123 4567"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    className={`w-full border rounded-xl px-4 py-2 text-xs outline-none focus:border-[#C5A880] ${
                      theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-205 text-stone-800'
                    }`}
                  />
                </div>
              </div>

              {/* LUXURY PAYMENT SELECTION TABS */}
              <div className="space-y-3 pt-2">
                <h4 className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#A88C52] flex items-center justify-between">
                  <span>Elite Guarantee Settlement</span>
                  <span className="text-emerald-500 font-bold lowercase tracking-normal font-mono">guaranteed secure</span>
                </h4>

                {/* Method selector horizontal tabs */}
                <div className="grid grid-cols-4 gap-1.5 p-1 bg-stone-100 dark:bg-stone-950/60 rounded-xl">
                  {/* Credit Card Choice */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`text-[9px] font-bold uppercase py-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'card' 
                        ? 'bg-[#C5A880] text-stone-100 shadow-xs' 
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Card Hold
                  </button>

                  {/* Apple Pay Choice */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('applepay')}
                    className={`text-[9px] font-bold uppercase py-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'applepay' 
                        ? 'bg-stone-950 text-[#C5A880] shadow-xs dark:bg-stone-800' 
                        : 'text-stone-400 hover:text-[#C5A880]'
                    }`}
                  >
                     Pay
                  </button>

                  {/* Butler Voucher */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('butler')}
                    className={`text-[9px] font-bold uppercase py-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'butler' 
                        ? 'bg-stone-900 text-[#C5A880] border border-[#C5A880]/30 shadow-xs dark:bg-stone-800/80' 
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Butler Code
                  </button>

                  {/* Crypto ledger */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`text-[9px] font-bold uppercase py-2 rounded-lg cursor-pointer transition-all ${
                      paymentMethod === 'crypto' 
                        ? 'bg-indigo-900 text-stone-100 shadow-xs' 
                        : 'text-stone-400 hover:text-stone-700'
                    }`}
                  >
                    Ledger
                  </button>
                </div>

                {/* METHOD INPUT WRAPPERS */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`p-4 rounded-xl border space-y-3.5 duration-200 ${
                        theme === 'dark' ? 'bg-[#141414] border-stone-800/80' : 'bg-white border-stone-150'
                      }`}
                    >
                      {/* Interactive credit card mockup */}
                      <div className="relative w-full h-36 rounded-xl bg-gradient-to-tr from-stone-900 via-stone-800 to-stone-950 p-5 text-white flex flex-col justify-between overflow-hidden shadow-md border border-[#C5A880]/20 font-mono shadow-inner select-none">
                        <div className="flex justify-between items-start">
                          <div className="w-9 h-6 rounded-md bg-stone-800/80 border border-stone-700 flex items-center justify-center">
                            <span className="w-1.5 h-3 bg-amber-500 rounded opacity-75" />
                          </div>
                          <span className="text-[10px] font-bold tracking-widest text-[#C5A880]">CENTURION ELITE</span>
                        </div>
                        <div>
                          <div className="text-sm tracking-widest md:text-base">{cardNumber || '•••• •••• •••• ••••'}</div>
                        </div>
                        <div className="flex justify-between text-[9px] tracking-wide text-stone-300">
                          <div>
                            <div className="text-[7px] text-stone-500 font-sans uppercase">Holder</div>
                            <div className="text-ellipsis overflow-hidden max-w-[170px] whitespace-nowrap">
                              {guestName.toUpperCase() || 'VALUED RIVIERA GUEST'}
                            </div>
                          </div>
                          <div>
                            <div className="text-[7px] text-stone-500 font-sans uppercase">Expires</div>
                            <div>{cardExpiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 p-1">
                        <div>
                          <label className="block text-[10px] font-mono text-stone-500 uppercase mb-1">Guaranteed Vault Number</label>
                          <input
                            type="text"
                            required
                            placeholder="4000 1234 5678 9012"
                            value={cardNumber}
                            onChange={(e) => {
                              const cleanDigits = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                              const chunks = cleanDigits.match(/\d{1,4}/g) || [];
                              setCardNumber(chunks.join(' '));
                            }}
                            className={`w-full font-mono text-xs p-2 rounded-lg border outline-none ${
                              theme === 'dark' ? 'bg-stone-950 border-stone-800' : 'bg-stone-50/50 border-stone-200'
                            }`}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-mono text-stone-500 uppercase mb-1">Expiration</label>
                            <input
                              type="text"
                              required
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => {
                                let v = e.target.value.replace(/[^0-9]/g, '');
                                if (v.length >= 2) {
                                  v = v.slice(0, 2) + '/' + v.slice(2, 4);
                                }
                                setCardExpiry(v);
                              }}
                              className={`w-full font-mono text-xs p-2 text-center rounded-lg border outline-none ${
                                theme === 'dark' ? 'bg-stone-950 border-stone-800' : 'bg-stone-50/50 border-stone-200'
                              }`}
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-mono text-stone-500 uppercase mb-1">Secure CVV</label>
                            <input
                              type="password"
                              required
                              placeholder="***"
                              maxLength={4}
                              value={cardCvv}
                              onChange={(e) => setCardCvv(e.target.value.replace(/[^0-9]/g, ''))}
                              className={`w-full font-mono text-xs p-2 text-center rounded-lg border outline-none ${
                                theme === 'dark' ? 'bg-stone-950 border-stone-800' : 'bg-stone-50/50 border-stone-200'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'applepay' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`p-6 rounded-xl border text-center space-y-4 ${
                        theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-stone-50/60 border-stone-150'
                      }`}
                    >
                      <span className="w-12 h-12 rounded-full bg-stone-900 border border-stone-800 flex items-center justify-center mx-auto text-white text-lg font-bold">
                        
                      </span>
                      <div>
                        <span className="font-semibold text-xs block">Simulated Apple Pay Touch Handshake</span>
                        <span className="text-[10px] text-stone-400 block mt-1 leading-relaxed">
                          Your final reservation confirmation will automatically prompt an inline Face-ID simulated scanner modal.
                        </span>
                      </div>
                      <div className="inline-flex items-center gap-2 px-3.5 py-1 text-[9px] tracking-wider text-[#A88C52] font-mono bg-[#A88C52]/5 rounded-full border border-[#A88C52]/10 uppercase font-semibold">
                        ⚡ SANDBOX STATUS: ACTIVE
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'butler' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`p-4 rounded-xl border space-y-3 ${
                        theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-white border-stone-150'
                      }`}
                    >
                      <div>
                        <label className="block text-[10px] font-mono text-[#A88C52] uppercase mb-1">Sovereign Butler Voucher Code</label>
                        <input
                          type="text"
                          placeholder="e.g. AURELIA-ST-99"
                          value={butlerCode}
                          onChange={(e) => setButlerCode(e.target.value)}
                          className={`w-full text-xs font-mono p-2.5 rounded-lg border outline-none ${
                            theme === 'dark' ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-stone-50/50 border-stone-200 text-stone-800'
                          }`}
                        />
                        <span className="text-[9px] text-stone-400 font-mono block mt-1 leading-relaxed">
                          Corporate accounts voucher clearance validates instantly inside Aurelia. Entering "AURELIA-ST-99" executes correctly!
                        </span>
                      </div>
                    </motion.div>
                  )}

                  {paymentMethod === 'crypto' && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className={`p-4 rounded-xl border text-center space-y-3 ${
                        theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-stone-50/65 border-stone-150'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-xl bg-stone-950 border border-stone-800 p-2 flex items-center justify-center mx-auto text-stone-200 text-3xl select-none">
                        🪙
                      </div>
                      <div>
                        <span className="text-xs font-semibold block">Connected Solana Sovereign Wallet Ledger</span>
                        <code className="text-[9px] text-[#A88C52] tracking-wider font-mono block mt-1.5 p-1 rounded bg-stone-100 dark:bg-stone-950 max-w-[210px] mx-auto overflow-hidden text-ellipsis whitespace-nowrap">
                          0x71C5...4c3A9f
                        </code>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* General error message display */}
              {validationError && (
                <div className="p-4 bg-rose-50 border border-rose-200 text-rose-805 text-xs font-semibold rounded-xl flex items-start gap-2.5 leading-relaxed">
                  <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* BILLING MATRIX FOOTER BREAKDOWN */}
              <div className={`border p-6 rounded-2xl space-y-3.5 font-mono text-xs ${
                theme === 'dark' ? 'bg-stone-950/40 border-stone-800 text-stone-300' : 'bg-[#FAF9F6]/80 border-stone-150 text-stone-600'
              }`}>
                <div className="flex justify-between">
                  <span>Suite Sanctuary Rate (&times;{nights} Night{nights > 1 ? 's' : ''})</span>
                  <span>${activeRoom.pricePerNight} &times; {nights} = ${roomSubtotal}</span>
                </div>

                {specialRequests.includes('In-Bed Michelin Breakfast') && (
                  <div className="flex justify-between">
                    <span>Delivered Michelin Breakfast</span>
                    <span>+$45 &times; {nights} = +${45 * nights}</span>
                  </div>
                )}

                {specialRequests.includes('Dom Pérignon Ice Preparation') && (
                  <div className="flex justify-between text-[#A88C52] font-semibold">
                    <span>Dom Pérignon Preparation</span>
                    <span>+$285 (Flat Charge)</span>
                  </div>
                )}

                {specialRequestsText.trim() && (
                  <div className="flex justify-between text-[10px] opacity-75 leading-relaxed italic border-b border-stone-200/40 pb-2">
                    <span className="underline font-bold">Steward Notes Secured:</span>
                    <span className="text-right inline-block max-w-[200px] text-ellipsis overflow-hidden whitespace-nowrap">
                      "{specialRequestsText.trim()}"
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Riviera Resort Stewardship Fee</span>
                  <span>+${serviceFee}</span>
                </div>

                <div className="flex justify-between">
                  <span>French Coastal Hospitality Tax (10%)</span>
                  <span>+${luxuryTax}</span>
                </div>

                <div className="border-t border-stone-200/50 pt-4 flex justify-between items-baseline font-sans">
                  <div className="text-[#A88C52] font-semibold text-sm flex flex-col">
                    <span>Total Account Settlement</span>
                    <span className="text-[10px] text-stone-400 font-normal mt-0.5">({guestsCount} guest{guestsCount > 1 ? 's' : ''} luxury stays)</span>
                  </div>
                  <span className={`text-xl font-bold font-mono ${theme === 'dark' ? 'text-stone-100' : 'text-stone-950'}`}>
                    ${grandTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* ACTION CALL ACTIONS */}
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={onClose}
                  className={`flex-1 border font-semibold py-3.5 rounded-xl transition-all text-xs text-center cursor-pointer ${
                    theme === 'dark'
                      ? 'border-stone-805 bg-stone-800 hover:bg-stone-700 text-stone-300'
                      : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                  }`}
                >
                  Return to Vault
                </button>
                <button
                  type="submit"
                  className="flex-2 bg-gradient-to-r from-stone-900 via-stone-950 to-stone-900 hover:opacity-90 text-[#C5A880] font-bold py-3.5 rounded-xl transition-all text-xs tracking-widest uppercase text-center shadow-lg cursor-pointer max-w-[280px] text-ellipsis overflow-hidden whitespace-nowrap flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                  Verify & Secure Suite
                </button>
              </div>

            </form>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
