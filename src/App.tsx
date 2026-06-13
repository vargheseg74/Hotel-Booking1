/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BOUTIQUE_HOTELS, MOCK_ROOMS, GENERAL_REVIEWS } from './data';
import { Room, Hotel, Booking, Review } from './types';
import Notification, { ToastMessage } from './components/Notification';
import MyBookings from './components/MyBookings';
import RoomCard from './components/RoomCard';
import HotelCard from './components/HotelCard';
import RoomDetailsModal from './components/RoomDetailsModal';
import { 
  Sparkles, Calendar, Users, Star, Compass, MapPin, Phone, Mail, Award, 
  CheckCircle2, ChevronRight, Sliders, ArrowRight, Sun, Moon, Send, MessageSquare,
  Volume2, ShieldAlert, CloudSun, HelpCircle, User, MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // 1. Core State Managers & Local Persistent State
  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem('riviera_escapes_bookings');
    return saved ? JSON.parse(saved) : [];
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [viewBookings, setViewBookings] = useState(false);
  const [successBooking, setSuccessBooking] = useState<Booking | null>(null);

  // 2. Theme State Manager ('light' | 'dark')
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('riviera_escapes_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // 3. Persistent Search Filters
  const [checkIn, setCheckIn] = useState('2026-06-13'); // Conforms to simulated time
  const [checkOut, setCheckOut] = useState('2026-06-16');
  const [guestsCount, setGuestsCount] = useState(2);
  const [selectedCity, setSelectedCity] = useState<'All' | 'Eze' | 'Saint-Tropez' | 'Cannes'>('All');
  const [selectedHotelId, setSelectedHotelId] = useState<string | 'All'>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [maxPrice, setMaxPrice] = useState<number>(2200);
  const [searchQuery, setSearchQuery] = useState('');

  // 4. Custom Local Review Submission State
  const [localReviews, setLocalReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('riviera_escapes_reviews');
    return saved ? JSON.parse(saved) : GENERAL_REVIEWS;
  });
  const [reviewName, setReviewName] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewHotelId, setReviewHotelId] = useState(BOUTIQUE_HOTELS[0].id);

  // 5. AI Concierge Floating Assistant Chatbot State
  const [showAIAssistant, setShowAIAssistant] = useState(false);
  const [aiChatHistory, setAiChatHistory] = useState<Array<{ role: 'user' | 'model'; content: string }>>([
    {
      role: 'model',
      content: 'Welcome to Aurelia Elite Concierge Services. I am your Riviera Steward, Hugo. How may I coordinate your private helipads, Michelin tables, stellar pillows, or Cannes yacht charters today?'
    }
  ]);
  const [aiInputText, setAiInputText] = useState('');
  const [aiChatLoading, setAiChatLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // 6. AI Smart Recommendation Suite Matchmaker State
  const [aiPreferenceText, setAiPreferenceText] = useState('');
  const [isAIRecommending, setIsAIRecommending] = useState(false);
  const [aiMatches, setAiMatches] = useState<{
    greeting: string;
    matches: Array<{
      roomId: string;
      roomName: string;
      stewardConsensus: string;
      curatedLuxAddon: string;
    }>;
  } | null>(null);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem('riviera_escapes_bookings', JSON.stringify(bookings));
  }, [bookings]);

  useEffect(() => {
    localStorage.setItem('riviera_escapes_theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('riviera_escapes_reviews', JSON.stringify(localReviews));
  }, [localReviews]);

  // Scroll chatbot to end
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [aiChatHistory, aiChatLoading]);

  // Local Toast Trigger
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Dynamic Room Inventory: check against live bookings
  const getDynamicAvailableCount = (room: Room) => {
    const activeHolds = bookings.filter(
      (b) => b.roomId === room.id && b.status === 'confirmed'
    ).length;
    return Math.max(0, room.availableCount - activeHolds);
  };

  // Average Rating Recalculator based on live user review database
  const getRecalculatedRating = (hotelId: string) => {
    const hotelReviews = localReviews.filter((r) => r.hotelId === hotelId);
    if (hotelReviews.length === 0) return 4.9;
    const sum = hotelReviews.reduce((s, r) => s + r.rating, 0);
    return Math.round((sum / hotelReviews.length) * 10) / 10;
  };

  // Modify BOUTIQUE_HOTELS reference with live recalculated reviews
  const liveHotels = useMemo(() => {
    return BOUTIQUE_HOTELS.map(hotel => ({
      ...hotel,
      rating: getRecalculatedRating(hotel.id)
    }));
  }, [localReviews]);

  // Filtered Hotels list based on selectedCity
  const filteredHotels = useMemo(() => {
    if (selectedCity === 'All') return liveHotels;
    return liveHotels.filter(hotel => hotel.city === selectedCity);
  }, [selectedCity, liveHotels]);

  // If city is changed, reset hotel constraint if needed
  useEffect(() => {
    if (selectedHotelId !== 'All') {
      const activeHotel = liveHotels.find(h => h.id === selectedHotelId);
      if (selectedCity !== 'All' && activeHotel?.city !== selectedCity) {
        setSelectedHotelId('All');
      }
    }
  }, [selectedCity, selectedHotelId, liveHotels]);

  const getRoomsCountForHotel = (hotelId: string) => {
    return MOCK_ROOMS.filter(r => r.hotelId === hotelId).length;
  };

  // Core Rooms Filter logic
  const filteredRooms = useMemo(() => {
    return MOCK_ROOMS.map(room => {
      // Inject live ratings based on recalculated hotel reviews too
      const hotel = liveHotels.find(h => h.id === room.hotelId);
      return {
        ...room,
        rating: hotel ? hotel.rating : room.rating
      };
    }).filter((room) => {
      const roomHotel = liveHotels.find(h => h.id === room.hotelId);
      if (selectedCity !== 'All' && roomHotel?.city !== selectedCity) return false;
      if (selectedHotelId !== 'All' && room.hotelId !== selectedHotelId) return false;
      if (selectedCategory !== 'All' && room.type !== selectedCategory) return false;
      if (room.pricePerNight > maxPrice) return false;
      if (room.capacity < guestsCount) return false;

      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const matchesName = room.name.toLowerCase().includes(query);
        const matchesHotelName = room.hotelName.toLowerCase().includes(query);
        const matchesDesc = room.description.toLowerCase().includes(query);
        const matchesAmenity = room.amenities.some(a => a.toLowerCase().includes(query));
        if (!matchesName && !matchesDesc && !matchesAmenity && !matchesHotelName) return false;
      }
      return true;
    });
  }, [selectedCity, selectedHotelId, selectedCategory, maxPrice, searchQuery, guestsCount, liveHotels]);

  // Web Service Handshake: Fetch AI Conversational Steward Response
  const handleSendAIMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInputText.trim() || aiChatLoading) return;

    const userMsg = aiInputText;
    setAiInputText('');
    setAiChatHistory((prev) => [...prev, { role: 'user', content: userMsg }]);
    setAiChatLoading(true);

    try {
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...aiChatHistory, { role: 'user', content: userMsg }].map(c => ({
            role: c.role,
            content: c.content
          })),
          selectedHotelId,
          activeRoomId: selectedRoom?.id || null
        })
      });

      const data = await response.json();
      setAiChatHistory((prev) => [...prev, { role: 'model', content: data.content }]);
    } catch {
      showToast('Bespoke connection timeout. Activating butler default protocols.', 'info');
      setAiChatHistory((prev) => [...prev, {
        role: 'model',
        content: `I have received your message regarding: "${userMsg}". (Add your live GEMINI_API_KEY in the Secrets panel to activate live AI answers.) For now, standard concierge notes suggest reserving suites on our main shelf and securing champagne holdings directly in checkout.`
      }]);
    } finally {
      setAiChatLoading(false);
    }
  };

  // Web Service Handshake: AI Suite Recommendations Matchmaker
  const handleRequestAIRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPreferenceText.trim() || isAIRecommending) return;

    setIsAIRecommending(true);
    setAiMatches(null);

    try {
      const response = await fetch('/api/gemini/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          city: selectedCity,
          maxPrice: maxPrice,
          guestsCount: guestsCount,
          preferencesText: aiPreferenceText
        })
      });

      const data = await response.json();
      setAiMatches(data);
      showToast('AI steward compiled the supreme options for you!', 'success');
    } catch {
      showToast('Failed to reach Riviera recommendation central.', 'error');
    } finally {
      setIsAIRecommending(false);
    }
  };

  // New Booking Confirmation
  const handleConfirmReservation = (formData: {
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
  }) => {
    const bookedRoom = MOCK_ROOMS.find(r => r.id === formData.roomId) || selectedRoom;
    if (!bookedRoom) return;

    const available = getDynamicAvailableCount(bookedRoom);
    if (available < 1) {
      showToast(`Suite ${bookedRoom.name} is occupied during those date constraints.`, 'error');
      return;
    }

    const newBooking: Booking = {
      id: `RIVIERA-${Math.floor(10000 + Math.random() * 90000)}`,
      roomId: bookedRoom.id,
      roomName: bookedRoom.name,
      roomType: bookedRoom.type,
      roomImage: bookedRoom.images[0],
      hotelId: bookedRoom.hotelId,
      hotelName: bookedRoom.hotelName,
      createdAt: new Date().toISOString(),
      status: 'confirmed',
      guestName: formData.guestName,
      guestEmail: formData.guestEmail,
      guestPhone: formData.guestPhone,
      checkIn: formData.checkIn,
      checkOut: formData.checkOut,
      guestsCount: formData.guestsCount,
      totalPrice: formData.totalPrice,
      nightsCount: formData.nightsCount,
      specialRequests: formData.specialRequests,
      specialRequestsText: formData.specialRequestsText,
      creditCardLast4: formData.creditCardLast4,
    };

    setBookings((prev) => [newBooking, ...prev]);
    setSuccessBooking(newBooking);
    setSelectedRoom(null);
    showToast(`Bespoke Suite ${bookedRoom.name} successfully booked!`, 'success');
  };

  const handleCancelBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === bookingId ? { ...b, status: 'cancelled' } : b))
    );
    showToast(`Reservation ${bookingId} has been successfully voided.`, 'info');
  };

  // Review submission
  const handleAddReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName.trim() || !reviewComment.trim()) {
      showToast('Please specify a coordinator author name and testimonial details.', 'error');
      return;
    }

    const targetHotel = BOUTIQUE_HOTELS.find(h => h.id === reviewHotelId);
    const newRev: Review = {
      id: `REV-${Date.now()}`,
      hotelId: reviewHotelId,
      hotelName: targetHotel?.name || "Boutique Resort",
      author: reviewName,
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
      rating: reviewRating,
      comment: reviewComment,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    setLocalReviews((prev) => [newRev, ...prev]);
    setReviewName('');
    setReviewComment('');
    showToast('Bespoke testimonial log registered successfully. Elite statistics recalculated.', 'success');
  };

  // INTERACTIVE MONTH DATEPICKER: Select dates visually for June 2026!
  // June 2026 starts on Monday (1st) and finishes on Tuesday (30th)
  const juneDaysCount = 30;
  const parseDayString = (dayNum: number) => {
    return `2026-06-${dayNum < 10 ? '0' + dayNum : dayNum}`;
  };

  const handleDaySelect = (dayNum: number) => {
    const dateStr = parseDayString(dayNum);
    
    // Clear check-in / check-out if checkOut is already selected, or checkIn state is blank
    const dIn = new Date(checkIn);
    const dOut = new Date(checkOut);
    
    const clickDate = new Date(dateStr);
    
    // If we click a date before Check-in, or if we already have both selected, reset as check-in
    if (clickDate.getTime() < dIn.getTime() || (checkIn && checkOut)) {
      setCheckIn(dateStr);
      // Automatically shift checkOut to next day as friendly support
      const nextDayStr = parseDayString(dayNum + 1 <= 30 ? dayNum + 1 : 30);
      setCheckOut(nextDayStr);
    } else {
      // It is after check-in, set as check-out!
      if (dateStr === checkIn) {
        showToast('Stay length must span 1 or more nights.', 'error');
        return;
      }
      setCheckOut(dateStr);
      showToast(`Date interval set! ${checkIn} to ${dateStr}`, 'info');
    }
  };

  return (
    <div className={`min-h-screen pb-20 selection:bg-[#E4DCCF] transition-all duration-300 ${
      theme === 'dark' ? 'bg-[#0E0D0C] text-stone-100' : 'bg-[#FAF9F6] text-stone-900'
    }`}>
      
      {/* TOAST SYSTEM */}
      <Notification toasts={toasts} onRemove={removeToast} />

      {/* TOP DECORATIVE HEADER BAR */}
      <header className={`border-b sticky top-0 z-40 backdrop-blur-md transition-colors ${
        theme === 'dark' ? 'bg-stone-950/80 border-stone-800' : 'bg-white/80 border-stone-200/50'
      }`}>
        <div className="max-w-7xl mx-auto px-6 md:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 text-[#A88C52]" />
            <div>
              <h1 className="font-display text-lg md:text-xl font-bold tracking-tight">
                Aurelia Riviera Resorts
              </h1>
              <span className="block text-[8px] sm:text-[9.5px] uppercase tracking-widest text-[#A88C52] font-mono leading-none mt-1">
                Luxury & Restorative Collection &bull; Eze &bull; Saint-Tropez &bull; Cannes
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Dark & Light Theme Toggle button */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Midnight'} mode`}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                theme === 'dark' 
                  ? 'bg-stone-900 border-stone-800 hover:bg-stone-800 text-yellow-500' 
                  : 'bg-stone-50 border-stone-200 hover:border-stone-400 text-stone-700'
              }`}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                setViewBookings(false);
                const gridElement = document.getElementById('catalog-anchor');
                if (gridElement) gridElement.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-xs font-semibold px-2 cursor-pointer hidden md:inline"
            >
              Suites
            </button>
            
            <button
              onClick={() => {
                setViewBookings(true);
                setTimeout(() => {
                  const scrollPanel = document.getElementById('my-bookings-panel');
                  if (scrollPanel) scrollPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 50);
              }}
              className={`px-4 py-2 flex items-center gap-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                theme === 'dark'
                  ? 'bg-stone-900 border-[#C5A880]/30 hover:bg-stone-800 text-[#C5A880]'
                  : 'bg-[#E4DCCF]/45 text-stone-800 border-[#C5A880]/40 hover:bg-[#E4DCCF]/75 hover:border-[#C5A880]/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Stays Dashboard</span>
              {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                <span className="w-4 h-4 rounded-full bg-stone-900 text-[#C1A57B] text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION WITH EMBEDDED DATED PICKER */}
      <section className="relative h-[650px] lg:h-[580px] bg-stone-950 overflow-hidden text-stone-100 flex items-center">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1600&q=80"
            alt="Riviera Coastline"
            className="w-full h-full object-cover opacity-35 filter brightness-95"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF9F6] dark:from-[#0E0D0C] via-stone-950/70 to-black/30" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 md:px-8 w-full z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Promo Text */}
            <div className="lg:col-span-5 space-y-4">
              <span className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 text-[10px] uppercase font-mono tracking-widest text-[#C5A880] font-bold">
                <Sparkles className="w-3.5 h-3.5" /> First-Class Sovereign Collection
              </span>
              <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight leading-none text-white">
                Indulge the <span className="font-serif italic text-[#C5A880]">Riviera</span> Classic
              </h2>
              <p className="text-stone-300 text-xs sm:text-sm leading-relaxed max-w-sm">
                Private custom living spaces carved between Saint-Tropez shores, cliffside Eze peak, and elite Cannes terraces. Inclusive of dedicated stewards, helicopter shuttles, and wellness thermal access.
              </p>
              <div className="flex gap-4 text-[10px] font-mono text-stone-450 uppercase font-semibold">
                <span>&bull; Helicopter Transports</span>
                <span>&bull; Private Sands</span>
              </div>
            </div>

            {/* INTERACTIVE BENTO GRID SEARCH WITH MONTHLY June 2026 CALENDAR */}
            <div className="lg:col-span-7">
              <div className="bg-stone-900/95 border border-stone-800/80 p-5 rounded-2xl md:p-6 shadow-2xl space-y-4 select-none">
                
                <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                  <span className="text-[10px] uppercase font-mono tracking-widest text-[#C5A880] font-semibold">
                    Set Stay dates visually below
                  </span>
                  <div className="text-[9px] font-mono text-stone-500">
                    Active selection: {checkIn} to {checkOut || '••'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  {/* Calendar columns (8 cols) */}
                  <div className="grid md:col-span-8 space-y-1.5">
                    <div className="flex justify-between items-center text-[10px] uppercase font-mono text-stone-400">
                      <span>June 2026 Grid Selection</span>
                      <span className="text-[9px] text-[#C5A880] lowercase italic">click to book range</span>
                    </div>

                    {/* Weekday indicators */}
                    <div className="grid grid-cols-7 gap-1 text-center font-mono text-[9px] text-stone-500 uppercase font-bold">
                      <span>Mo</span><span>Tu</span><span>We</span><span>Th</span><span>Fr</span><span>Sa</span><span>Su</span>
                    </div>

                    {/* Numeric Days Map */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: juneDaysCount }, (_, i) => {
                        const dayNum = i + 1;
                        const dateStr = parseDayString(dayNum);
                        
                        const isStart = checkIn === dateStr;
                        const isEnd = checkOut === dateStr;
                        
                        // Range checks
                        const dIn = new Date(checkIn);
                        const dOut = new Date(checkOut);
                        const currentD = new Date(dateStr);
                        const inRange = checkIn && checkOut && currentD > dIn && currentD < dOut;

                        let bgClass = "bg-stone-850 hover:bg-stone-800 text-stone-300";
                        if (isStart || isEnd) {
                          bgClass = "bg-[#C5A880] text-stone-950 font-bold border border-[#FAF9F6]/20";
                        } else if (inRange) {
                          bgClass = "bg-[#A88C52]/30 text-[#C1A57B] border border-[#A88C52]/10";
                        }

                        // Mark certain days booked for high fidelity
                        const isHotBooked = dayNum === 14 || dayNum === 25;

                        return (
                          <button
                            key={dayNum}
                            type="button"
                            onClick={() => handleDaySelect(dayNum)}
                            className={`h-7 rounded text-[10px] font-semibold font-mono transition-all cursor-pointer relative ${bgClass} ${
                              isHotBooked ? 'border-b border-rose-500/50' : ''
                            }`}
                          >
                            <span>{dayNum}</span>
                            {isHotBooked && (
                              <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-rose-500" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Standard guest selector in remaining cols (4 cols) */}
                  <div className="md:col-span-4 flex flex-col justify-between gap-3">
                    <div>
                      <label className="block text-[9px] uppercase font-mono tracking-widest text-stone-400 mb-1">
                        Select Location
                      </label>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value as any)}
                        className="w-full bg-stone-850 border border-stone-800 text-stone-200 py-1.5 px-2.5 rounded-lg text-xs outline-none focus:border-[#C5A880]"
                      >
                        <option value="All">All Cities (3)</option>
                        <option value="Eze">Eze Peak</option>
                        <option value="Saint-Tropez">Saint-Tropez</option>
                        <option value="Cannes">Cannes Marina</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-mono tracking-widest text-stone-400 mb-1">
                        Guests capacity
                      </label>
                      <select
                        value={guestsCount}
                        onChange={(e) => setGuestsCount(parseInt(e.target.value))}
                        className="w-full bg-stone-850 border border-stone-800 text-stone-200 py-1.5 px-2.5 rounded-lg text-xs outline-none focus:border-[#C5A880]"
                      >
                        {[1, 2, 3, 4, 5].map((g) => (
                          <option key={g} value={g} className="bg-stone-900">
                            {g} Guest{g > 1 ? 's' : ''} Stay
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          const catalog = document.getElementById('catalog-anchor');
                          if (catalog) catalog.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full py-2.5 bg-[#FAF9F6] border border-stone-300 hover:bg-stone-100 text-stone-950 text-xs font-bold tracking-widest uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                      >
                        <span>Confirm Range</span>
                        <ArrowRight className="w-4 h-4 text-[#A88C52]" />
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* CORE DISPLAY WORKSPACE CONTAINER */}
      <main className="max-w-7xl mx-auto px-6 md:px-8 mt-12 space-y-12">
        
        {/* VIEW: ACTIVE RESERVATION / INVOICES DASHBOARD OVERLAY */}
        <AnimatePresence>
          {viewBookings && (
            <motion.div
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
            >
              <MyBookings
                bookings={bookings}
                onCancelBooking={handleCancelBooking}
                onClose={() => setViewBookings(false)}
                theme={theme}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* BROWSE MODE SECTIONS */}
        {!viewBookings && (
          <div id="catalog-anchor" className="space-y-12">
            
            {/* A. INTEGRATED REAL-TIME HOTELS SHELF */}
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-stone-150 dark:border-stone-800 pb-3">
                <div>
                  <h3 className="font-display text-2xl font-bold tracking-tight">
                    Our Riviera Properties
                  </h3>
                  <p className="text-stone-500 font-serif italic text-xs mt-1">
                    Select a resort estate to focus your selection of local suites:
                  </p>
                </div>
                {selectedHotelId !== 'All' && (
                  <button
                    onClick={() => setSelectedHotelId('All')}
                    className="text-xs font-bold font-mono text-[#A88C52] hover:underline cursor-pointer uppercase mt-2 md:mt-0"
                  >
                    Reset Property Focus &bull; View Global Inventory
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    isSelected={selectedHotelId === hotel.id}
                    roomsCountOnCatalog={getRoomsCountForHotel(hotel.id)}
                    onSelect={() => {
                      if (selectedHotelId === hotel.id) {
                        setSelectedHotelId('All');
                        showToast('Showing suites across all locations.', 'info');
                      } else {
                        setSelectedHotelId(hotel.id);
                        showToast(`Focusing accommodations at ${hotel.name}.`, 'info');
                      }
                    }}
                  />
                ))}
              </div>
            </div>

            {/* B. AI RECOMMENDATION CENTRAL ("Smart AI Recommendations Butler") */}
            <div className={`p-6 md:p-8 rounded-2xl border border-[#C5A880]/20 bg-gradient-to-tr ${
              theme === 'dark' 
                ? 'from-stone-900/60 to-stone-950/40 backdrop-blur-md' 
                : 'from-stone-50 to-[#E4DCCF]/20 shadow-xs'
            }`}>
              <div className="flex flex-col md:flex-row items-start justify-between gap-6">
                {/* Promo side */}
                <div className="max-w-md space-y-2">
                  <div className="inline-flex items-center gap-1.5 text-[#A88C52] font-mono text-[10px] uppercase tracking-widest font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Aurelia Intelligent Match Office</span>
                  </div>
                  <h4 className="font-display text-xl font-bold tracking-tight">
                    Smart AI Suite Matchmaker
                  </h4>
                  <p className="text-xs text-stone-505 dark:text-stone-400 leading-relaxed">
                    Tell Hugo your personal request (e.g. "honeymoon terrace under $1000 with a saltwater tub" or "private seaside chef deck") and we'll instantly align customized recommendations from our vault files.
                  </p>

                  <form onSubmit={handleRequestAIRecommendation} className="pt-3 flex gap-2">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Quiet honeymoon terrace pool near Eze..."
                      value={aiPreferenceText}
                      onChange={(e) => setAiPreferenceText(e.target.value)}
                      className={`text-xs p-2.5 rounded-lg border outline-none w-full ${
                        theme === 'dark' ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-800'
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isAIRecommending}
                      className="px-4 py-2.5 bg-stone-900 border border-[#C5A880]/40 text-[#C5A880] text-xs font-bold uppercase tracking-widest rounded-lg transition-all hover:bg-stone-800 shrink-0 cursor-pointer shadow-md"
                    >
                      {isAIRecommending ? 'Configuring...' : 'Seek Match'}
                    </button>
                  </form>
                </div>

                {/* Recommendations Results list */}
                <div className="flex-1 w-full">
                  {isAIRecommending && (
                    <div className="py-8 text-center space-y-3">
                      <span className="w-8 h-8 border-3 border-stone-400 border-t-transparent rounded-full animate-spin block mx-auto" />
                      <p className="text-[10px] font-mono text-stone-400 italic">
                        Authorizing match database algorithms...
                      </p>
                    </div>
                  )}

                  {!isAIRecommending && aiMatches && (
                    <div className="space-y-4 animate-fade-in text-xs">
                      <p className="font-serif italic text-stone-500 text-[11px]">
                        "{aiMatches.greeting}"
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aiMatches.matches.map((match, i) => {
                          const originalRoom = MOCK_ROOMS.find(r => r.id === match.roomId);
                          return (
                            <div
                              key={i}
                              className={`p-4 rounded-xl border flex flex-col justify-between shadow-xs ${
                                theme === 'dark' ? 'bg-stone-900/80 border-stone-800' : 'bg-white border-stone-150'
                              }`}
                            >
                              <div>
                                <h5 className="font-semibold text-stone-905 dark:text-stone-100 text-[13px] flex items-center justify-between">
                                  <span>{match.roomName}</span>
                                  {originalRoom && (
                                    <span className="text-[#A88C52] font-mono font-bold font-mono">${originalRoom.pricePerNight} / N</span>
                                  )}
                                </h5>
                                <p className="text-stone-500 mt-2 leading-relaxed">
                                  {match.stewardConsensus}
                                </p>
                                <span className="text-stone-400 text-[10px] mt-1.5 block font-mono">
                                  🎁 Dynamic Perk: {match.curatedLuxAddon}
                                </span>
                              </div>

                              {originalRoom && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedRoom(originalRoom)}
                                  className="w-full mt-4 text-center text-[10px] font-bold uppercase tracking-wider py-2 bg-[#E4DCCF]/45 hover:bg-[#E4DCCF]/85 text-stone-800 border border-[#C5A880]/15 rounded-lg transition-all cursor-pointer"
                                >
                                  Reserve AI Elite Choice Immediately
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {!isAIRecommending && !aiMatches && (
                    <div className="h-full min-h-[140px] flex items-center justify-center border border-dashed border-stone-200 dark:border-stone-800 rounded-xl bg-stone-50/50 dark:bg-stone-950/20 text-center text-stone-400 p-6">
                      <div>
                        <Sliders className="w-5 h-5 text-stone-300 mx-auto mb-2" />
                        <span className="block text-[10px] uppercase font-mono tracking-widest text-[#A88C52]">Ready for instruction ledger</span>
                        <p className="text-[11px] mt-1">Submit your specific stay variables to view matches.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* C. SUITE GRID BROWSER CONTROLS ROW */}
            <div className={`p-6 md:p-8 rounded-2xl border transition-colors duration-300 ${
              theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-white border-stone-200/80'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-150 dark:border-stone-800 pb-5">
                <div>
                  <h3 className="font-display text-lg md:text-xl font-medium flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#A88C52]" />
                    <span>Search Our Inventory</span>
                  </h3>
                  <span className="block text-[10px] uppercase text-[#A88C52] font-mono mt-0.5">
                    {selectedHotelId === 'All' ? 'Searching French Riviera Portfolio' : `Filteringfocused ${BOUTIQUE_HOTELS.find(h => h.id === selectedHotelId)?.name}`}
                  </span>
                </div>
                
                <span className="bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-605 text-xs font-mono font-bold p-1.5 px-3 rounded-lg leading-none">
                  {filteredRooms.length} luxury space{filteredRooms.length === 1 ? '' : 's'} available
                </span>
              </div>

              {/* Advanced Filter options row */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-6">
                
                {/* Categories */}
                <div className="md:col-span-6 space-y-2">
                  <span className="block text-[9px] uppercase font-mono tracking-wider font-semibold text-stone-405">Category Class Selection</span>
                  <div className="flex flex-wrap gap-1.5">
                    {['All', 'Standard', 'Deluxe', 'Executive Suite', 'Presidential Suite', 'Royal Villa'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                          selectedCategory === cat
                            ? 'bg-stone-950 dark:bg-stone-800 text-[#C5A880] border border-stone-900 dark:border-stone-700'
                            : 'bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-900'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price limit */}
                <div className="md:col-span-3 space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="block text-[9px] uppercase font-mono tracking-wider font-semibold text-stone-400">Nightly Budget Ceiling</span>
                    <span className="font-mono text-xs font-bold text-stone-700 dark:text-[#C5A880] font-bold">${maxPrice} / stay</span>
                  </div>
                  <input
                    type="range"
                    min="280"
                    max="2200"
                    step="50"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                    className="w-full accent-stone-705 bg-stone-200 dark:bg-stone-800 rounded-lg appearance-none h-1 cursor-pointer"
                  />
                  <div className="flex justify-between text-[9px] text-stone-400 font-mono">
                    <span>$280/night</span>
                    <span>$2,200/night</span>
                  </div>
                </div>

                {/* keyword search */}
                <div className="md:col-span-3 space-y-2">
                  <span className="block text-[9px] uppercase font-mono tracking-wider text-stone-405 font-bold">Local Feature keyword</span>
                  <input
                    type="text"
                    placeholder="e.g. plunge, view, tub..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={`w-full text-xs rounded-xl p-2.5 outline-none ${
                      theme === 'dark' ? 'bg-stone-950 border border-stone-800 text-stone-200' : 'bg-stone-50 border border-stone-200'
                    }`}
                  />
                </div>

              </div>
            </div>

            {/* D. LIVING SUITES LIST GRAPHICAL AREA */}
            <div>
              {filteredRooms.length === 0 ? (
                <div className={`py-16 text-center border-2 border-dashed max-w-lg mx-auto rounded-2xl p-6 ${
                  theme === 'dark' ? 'border-stone-800 bg-stone-900/10' : 'border-stone-200 bg-white/50'
                }`}>
                  <div className="text-lg font-serif italic text-[#A88C52]">No Vacancy Matches</div>
                  <p className="text-xs text-stone-500 leading-relaxed max-w-sm mx-auto mt-2 mb-4">
                    All premium rooms with those specific metrics are currently selected. Try expanding the price ceiling slider or clearing search keywords.
                  </p>
                  <button
                    onClick={() => {
                      setSelectedCategory('All');
                      setSelectedCity('All');
                      setSelectedHotelId('All');
                      setMaxPrice(2200);
                      setSearchQuery('');
                      setGuestsCount(2);
                    }}
                    className="text-xs font-bold px-4 py-2 bg-stone-900 border border-stone-800 text-white rounded-xl hover:bg-stone-800 cursor-pointer"
                  >
                    Reset Grid filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredRooms.map((room) => {
                    const available = getDynamicAvailableCount(room);
                    return (
                      <div key={room.id} className="relative flex flex-col h-full">
                        <RoomCard
                          room={room}
                          onSelect={() => {
                            const d1 = new Date(checkIn);
                            const d2 = new Date(checkOut);
                            if (d2.getTime() <= d1.getTime()) {
                              showToast('Please visually select check-out at least 1 night after check-in in visual calendar.', 'error');
                              return;
                            }
                            setSelectedRoom(room);
                          }}
                        />
                        {available === 0 && (
                          <div className="absolute inset-x-0 inset-y-0 rounded-2xl bg-stone-950/20 backdrop-blur-3xs flex items-center justify-center pointer-events-none">
                            <span className="bg-rose-950/90 text-white border border-rose-900 text-[10px] font-mono font-semibold uppercase px-3.5 py-1.5 rounded-lg tracking-widest">
                              Occupied Stays
                            </span>
                          </div>
                        )}
                        {available > 0 && available <= 2 && (
                          <span className="absolute top-3 left-3 bg-rose-50 border border-rose-250 text-rose-700 text-[8.5px] font-mono uppercase px-2 py-0.5 rounded font-bold tracking-wider">
                            Only {available} suite available
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* E. INTERACTIVE CUSTOMER TESTIMONIAL BOARD LOG */}
            <div className={`p-6 md:p-8 rounded-2xl border transition-colors ${
              theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-white border-stone-200/80 shadow-xs'
            }`}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Form to leave a log */}
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#A88C52]">Guest Statement Log</span>
                    <h4 className="font-display text-xl shrink-0 font-medium">Record a Riviera Testimonial</h4>
                    <p className="text-xs text-stone-500 mt-1">
                      Our elite platform welcomes genuine guest chronicles. Provide your stay rating and comment to assist other travellers.
                    </p>
                  </div>

                  <form onSubmit={handleAddReview} className="space-y-3.5">
                    <div>
                      <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Your Title coordinates</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Lord Charles Sterling"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className={`w-full text-xs rounded-lg p-2.5 outline-none border focus:border-[#C5A880] ${
                          theme === 'dark' ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-[#FAF9F6] border-stone-200 text-stone-800'
                        }`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Estate Reference</label>
                        <select
                          value={reviewHotelId}
                          onChange={(e) => setReviewHotelId(e.target.value)}
                          className={`w-full text-xs rounded-lg p-2.5 outline-none border cursor-pointer ${
                            theme === 'dark' ? 'bg-stone-950 border-stone-850 text-stone-200' : 'bg-[#FAF9F6] border-stone-200 text-stone-800'
                          }`}
                        >
                          {BOUTIQUE_HOTELS.map(h => (
                            <option key={h.id} value={h.id}>{h.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Interactive Stars selector */}
                      <div>
                        <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Steward level</label>
                        <div className="flex gap-1 h-10 items-center">
                          {[1,2,3,4,5].map((s) => (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setReviewRating(s)}
                              className="text-amber-400 hover:scale-110 cursor-pointer"
                            >
                              <Star className={`w-4 h-4 ${reviewRating >= s ? 'fill-amber-400' : ''}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-mono tracking-wider text-stone-400 mb-1">Your Riviera Testimonial Details</label>
                      <textarea
                        required
                        placeholder="We were highly impressed by SOMA massage lagoons, concierge attention Hugo, & helicopter shuttle service..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={2}
                        className={`w-full text-xs rounded-xl p-3 outline-none border resize-none focus:border-[#C5A880] ${
                          theme === 'dark' ? 'bg-stone-950 border-stone-800 text-stone-100' : 'bg-[#FAF9F6] border-stone-205 text-stone-800'
                        }`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 bg-stone-900 border border-[#C5A880]/30 hover:bg-stone-800 text-[#C5A880] text-xs font-bold uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer"
                    >
                      Publish Testimonial Log
                    </button>
                  </form>
                </div>

                {/* Display Feed */}
                <div className="lg:col-span-7 space-y-4 max-h-[440px] overflow-y-auto pr-2">
                  <span className="text-[10px] uppercase font-mono text-[#A88C52] font-semibold block border-b pb-1">
                    Most Recent Chronicles
                  </span>
                  
                  {localReviews.slice(0, 4).map((rev) => (
                    <div
                      key={rev.id}
                      className={`p-4 rounded-xl border space-y-2 text-xs ${
                        theme === 'dark' ? 'bg-stone-950/40 border-stone-805/75' : 'bg-[#FAF9F6]/60 border-stone-150'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2.5">
                          <span className="w-5.5 h-5.5 rounded-full bg-gradient-to-tr from-stone-850 to-stone-950 flex items-center justify-center text-[10px] text-stone-300 font-bold">
                            {rev.author[0]}
                          </span>
                          <div>
                            <span className="font-semibold block">{rev.author}</span>
                            <span className="text-[10px] text-stone-400 block font-mono">{rev.hotelName}</span>
                          </div>
                        </div>

                        <div className="flex gap-0.5 text-amber-500">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3.5 h-3.5 ${rev.rating > i ? 'fill-amber-500' : 'opacity-25'}`} />
                          ))}
                        </div>
                      </div>

                      <p className="text-stone-500 dark:text-stone-350 italic font-serif leading-relaxed text-xs">
                        "{rev.comment}"
                      </p>
                      <span className="block text-[9px] text-stone-400 font-mono text-right">{rev.date} &bull; Verified Aurelia Stay</span>
                    </div>
                  ))}
                </div>

              </div>
            </div>

          </div>
        )}

      </main>

      {/* FLOAT CONCIERGE AI FLOATING SIDEBAR DRAWER AND BUTTON */}
      {/* Floating Spark button */}
      <button
        type="button"
        onClick={() => setShowAIAssistant(!showAIAssistant)}
        title="Open Riviera AI travel Butler assistance"
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border border-[#C5A880]/40 text-[#C5A880] rounded-full shadow-2xl flex items-center justify-center hover:scale-106 active:scale-95 transition-all cursor-pointer animate-bounce"
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
      </button>

      {/* Slide drawer container */}
      <AnimatePresence>
        {showAIAssistant && (
          <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex justify-end">
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              className={`w-full max-w-md h-full shadow-2xl flex flex-col justify-between border-l select-text ${
                theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              {/* Drawer meta */}
              <div className={`p-4 md:p-5 flex items-center justify-between border-b ${
                theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-[#FAF9F6] border-stone-150'
              }`}>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-5 h-5 text-[#A88C52] animate-pulse shrink-0" />
                  <div>
                    <h4 className="font-display font-semibold text-xs py-0.5 leading-none">Aurelia AI Travel Steward</h4>
                    <span className="text-[9px] text-[#A88C52] font-mono leading-none tracking-widest uppercase block mt-1">
                      Direct Hotline Desk
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowAIAssistant(false)}
                  className="p-1 px-3 border rounded border-stone-200 dark:border-stone-800 text-[10px] font-mono cursor-pointer"
                >
                  ✕ Hide Dialog
                </button>
              </div>

              {/* Message transcript */}
              <div
                ref={scrollRef}
                className="flex-1 p-5 overflow-y-auto space-y-4 max-h-[80vh] scroll-smooth"
              >
                {aiChatHistory.map((chat, i) => {
                  const isUser = chat.role === 'user';
                  return (
                    <div
                      key={i}
                      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`p-3.5 max-w-[85%] rounded-2xl text-[12px] leading-relaxed relative ${
                        isUser 
                          ? 'bg-stone-950 text-[#C5A880] border border-stone-800 rounded-br-2xs' 
                          : 'bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-805 text-stone-705 dark:text-stone-300 rounded-bl-2xs'
                      }`}>
                        <div className="whitespace-pre-line font-sans leading-normal">
                          {chat.content}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {aiChatLoading && (
                  <div className="flex justify-start">
                    <div className="p-3 bg-stone-50 dark:bg-stone-950 border border-stone-150 dark:border-stone-805 rounded-xl text-stone-400 font-mono text-[10px] italic">
                      Steward Hugo is consulting schedules...
                    </div>
                  </div>
                )}
              </div>

              {/* Fast Pills recommendations */}
              <div className={`p-3.5 border-t space-y-2 ${
                theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-stone-50/60 border-stone-150'
              }`}>
                <p className="text-[9px] font-mono text-stone-400 uppercase tracking-widest leading-none">Suggested travel inquiries</p>
                <div className="flex flex-wrap gap-1.5 pt-0.5">
                  {[
                    "Plan a 1-day Eze agenda",
                    "Which suite has the best hot pool?",
                    "What are yachts charter rates?"
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setAiInputText(p);
                        // trigger send automatically as helper
                        setTimeout(() => {
                          const sendBtn = document.getElementById('ai-submit-btn');
                          if (sendBtn) sendBtn.click();
                        }, 50);
                      }}
                      className={`text-[9.5px] font-semibold py-1 px-2.5 rounded-md border text-left cursor-pointer transition-all ${
                        theme === 'dark' 
                          ? 'bg-stone-950 border-stone-800 hover:bg-stone-800 text-stone-300' 
                          : 'bg-white border-stone-200 hover:border-stone-400 text-stone-605'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chat action text box */}
              <form
                onSubmit={handleSendAIMessage}
                className={`p-4 border-t flex gap-2 items-center ${
                  theme === 'dark' ? 'bg-[#141414] border-stone-800' : 'bg-white border-stone-150'
                }`}
              >
                <input
                  type="text"
                  placeholder="Ask Hugo about yacht charters, pillow selections, menus..."
                  value={aiInputText}
                  onChange={(e) => setAiInputText(e.target.value)}
                  className={`w-full text-xs p-3 rounded-xl border outline-none ${
                    theme === 'dark' ? 'bg-stone-955 border-stone-800 text-stone-100' : 'bg-[#FAF9F6] border-stone-200 text-stone-850'
                  }`}
                />
                <button
                  id="ai-submit-btn"
                  type="submit"
                  title="Send message"
                  className="p-3 bg-stone-950 hover:bg-stone-800 text-[#C5A880] rounded-xl cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL CHECKOUT */}
      <AnimatePresence>
        {selectedRoom && (
          <RoomDetailsModal
            room={selectedRoom}
            defaultCheckIn={checkIn}
            defaultCheckOut={checkOut}
            defaultGuestsCount={guestsCount}
            onClose={() => setSelectedRoom(null)}
            onConfirmBooking={handleConfirmReservation}
            theme={theme}
          />
        )}
      </AnimatePresence>

      {/* CELEBRATION MODAL INCLUDES DIGITAL STATEMENT DESTRUCTS */}
      <AnimatePresence>
        {successBooking && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className={`border rounded-3xl w-full max-w-lg p-6 md:p-8 text-center shadow-2xl relative ${
                theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-105' : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto mb-5 border border-emerald-500/20 shadow-md">
                <CheckCircle2 className="w-8 h-8 font-bold" />
              </div>

              <span className="text-[10px] font-mono tracking-widest text-[#A88C52] font-semibold uppercase block mb-1">
                Stay Voucher Registered Securely
              </span>

              <h3 className="font-display text-2xl md:text-3xl font-bold mb-3">
                Reservation Confirmed
              </h3>

              <p className="text-stone-550 dark:text-stone-400 text-xs md:text-sm leading-relaxed max-w-sm mx-auto mb-4">
                Your luxury stays resolved successfully. A printable receipt has been logged. Ref Code: <strong className="text-stone-800 dark:text-stone-200 font-mono font-bold">{successBooking.id}</strong>.
              </p>

              {/* Internal Mini-Ticket card */}
              <div className={`p-4 rounded-xl mb-6 text-left space-y-2.5 text-xs font-mono border ${
                theme === 'dark' ? 'bg-stone-950/40 border-stone-800 text-stone-300' : 'bg-[#FAF9F6] border-stone-200 text-stone-600'
              }`}>
                <div className="flex justify-between border-b border-stone-200/40 pb-2">
                  <span className="font-semibold text-stone-800 dark:text-stone-300">Location resort</span>
                  <span className="font-bold text-[#A88C52]">{successBooking.hotelName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Selected Space</span>
                  <span className="font-bold text-stone-800 dark:text-stone-100">{successBooking.roomName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Registered Guest</span>
                  <span className="font-semibold">{successBooking.guestName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-In date</span>
                  <span>{successBooking.checkIn}</span>
                </div>
                <div className="flex justify-between">
                  <span>Check-Out date</span>
                  <span>{successBooking.checkOut}</span>
                </div>
                <div className={`flex justify-between border-t pt-2 font-sans font-bold bg-white dark:bg-stone-950 p-2 rounded-lg border ${
                  theme === 'dark' ? 'border-stone-800 text-stone-100' : 'border-stone-150 text-stone-900'
                }`}>
                  <span>Paid grand total</span>
                  <span className="font-mono text-sm">${successBooking.totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    setSuccessBooking(null);
                    setViewBookings(true);
                    setTimeout(() => {
                      const bookingsPanel = document.getElementById('my-bookings-panel');
                      if (bookingsPanel) bookingsPanel.scrollIntoView({ behavior: 'smooth' });
                    }, 50);
                  }}
                  className="w-full bg-stone-900 hover:bg-stone-800 text-[#C5A880] py-3.5 rounded-xl font-semibold text-xs uppercase tracking-widest transition-all shadow-md cursor-pointer border border-[#C5A880]/15"
                >
                  Examine Receipt Invoice Details
                </button>
                
                <button
                  onClick={() => setSuccessBooking(null)}
                  className={`w-full border font-semibold py-3 rounded-xl transition-all text-xs cursor-pointer ${
                    theme === 'dark' ? 'bg-stone-800 border-stone-705 text-stone-300 hover:bg-stone-700' : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  Return to Portfolio catalog
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER POLICIES */}
      <footer className="mt-24 border-t border-stone-250 bg-stone-950 text-stone-450 py-12 text-xs">
        <div className="max-w-7xl mx-auto px-6 md:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-[#FAF9F6]">
              <Compass className="w-5 h-5 text-[#C5A880]" />
              <span className="font-display font-bold text-sm tracking-widest uppercase">AURELIA RESORT GROUP</span>
            </div>
            <p className="text-stone-500 leading-relaxed max-w-sm">
              An independent European collection. Experience authentic quiet luxury, Michelin-starred gastronomy, private yachts, and high-fidelity mental & physical restoration.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-stone-200 uppercase tracking-wider font-semibold font-mono text-[10px]">Stewardship Standards</h4>
            <ul className="space-y-1.5 text-stone-500">
              <li>Check-In: 15:00 PM Local Riviera time</li>
              <li>Check-Out: 11:00 AM Local Riviera time</li>
              <li>Bespoke Pillow Menu selections served pre-arrival</li>
              <li>Flexible reservations. Retain zero cancellation fees up to 48 hours</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-stone-200 uppercase tracking-wider font-semibold font-mono text-[10px]">Contact Booking Offices</h4>
            <p className="text-stone-500 leading-relaxed">
              Our support offices remain consistently secure. Room capacity and fire limits apply according to French and local municipal codes.
            </p>
            <p className="text-[10px] text-stone-600 font-mono">
              App Version 2.0.0 &bull; Aurelia Resorts, Eze SPA LLC.
            </p>
          </div>
        </div>
      </footer>

    </div>
  );
}
