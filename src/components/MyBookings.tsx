/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Booking } from '../types';
import { Calendar, Users, MapPin, Phone, Mail, FileText, ChevronRight, Ban, Printer, Sparkles, Award, CloudSun, User, DollarSign, Cloud, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface MyBookingsProps {
  bookings: Booking[];
  onCancelBooking: (id: string) => void;
  onClose: () => void;
  theme?: 'light' | 'dark';
}

export default function MyBookings({ bookings, onCancelBooking, onClose, theme = 'light' }: MyBookingsProps) {
  const activeBookings = bookings.filter((b) => b.status === 'confirmed');
  const pastBookings = bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled');

  // AI custom itinerary modal state
  const [activeItineraryBooking, setActiveItineraryBooking] = useState<Booking | null>(null);
  const [itineraryLoading, setItineraryLoading] = useState(false);
  const [itineraryResult, setItineraryResult] = useState<string | null>(null);

  // VIP Analytics Calculations
  const totalSpend = bookings
    .filter((b) => b.status === 'confirmed' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const totalPoints = totalSpend * 10; // 10 points per dollar spent

  // Detect VIP tier based on total spending
  let vipTier = 'Silver Sovereign';
  let tierColor = 'from-stone-400 to-stone-500';
  let tierTextColor = 'text-stone-700';
  let cardBg = 'bg-stone-50/50';

  if (totalSpend >= 3000) {
    vipTier = 'Platinum Centurion Royal';
    tierColor = 'from-amber-400 via-yellow-500 to-amber-600 animate-pulse';
    tierTextColor = 'text-[#C5A880]';
    cardBg = 'bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-[#C5A880]/40';
  } else if (totalSpend >= 1000) {
    vipTier = 'Gold Ambassador Elite';
    tierColor = 'from-[#C5A880] to-[#A88C52]';
    tierTextColor = 'text-[#A88C52]';
    cardBg = 'bg-gradient-to-br from-stone-800 via-stone-900 to-stone-800 border-stone-700';
  }

  // 1-Day AI Itinerary Handler (simulated butler schedule generation contextually)
  const generateAIItinerary = async (booking: Booking) => {
    setActiveItineraryBooking(booking);
    setItineraryLoading(true);
    setItineraryResult(null);

    try {
      // Query our backend endpoint to get beautiful bespoke schedule details
      const response = await fetch('/api/gemini/assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: `Create a luxury 1-day travel timeline itinerary at "${booking.hotelName}" for guest ${booking.guestName} staying at the "${booking.roomName}" (${booking.roomType}). Suggest timing, Michelin dinners, spa hours, and yacht charters. Describe it with ultimate high-society splendor.`
            }
          ],
          selectedHotelId: booking.hotelId,
          activeRoomId: booking.roomId
        })
      });

      const data = await response.json();
      setItineraryResult(data.content || "Apologies. Our chief butler Hugo is configuring your schedule directly. Please contact our front office.");
    } catch (err) {
      console.error(err);
      // fallback
      setItineraryResult(`✨ **Your Bespoke 24-Hour Timeline at ${booking.hotelName}** ✨\n\n- **08:30 AM**: Custom-drawn lavender foam bath & organic continental berries served in the ${booking.roomName}.\n- **10:30 AM**: Soma spa massage and hydrotherapy waters.\n- **13:00 PM**: Private seaside cabana lunch with oysters and ice-fizz champagne.\n- **16:30 PM**: Direct boarding on Aurelia Sovereign yacht.\n- **20:00 PM**: Secured executive table at the Michelin-starred dining salon.\n\n*Concierge prep checklist complete!*`);
    } finally {
      setItineraryLoading(false);
    }
  };

  const printTicket = (booking: Booking) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calculate subtotal, taxes and request-itemized line items
    const nightsPrice = booking.totalPrice / booking.nightsCount;
    const baseRoomCost = nightsPrice * booking.nightsCount;
    const taxes = Math.round(baseRoomCost * 0.10); // 10%
    const serviceFee = 75; // Aurelia Concierge Fee
    const luxuryAddons = booking.specialRequests && booking.specialRequests.length > 0 ? booking.specialRequests.join(', ') : 'None';

    printWindow.document.write(`
      <html>
        <head>
          <title>Aurelia Resorts - Digital Statement invoice #${booking.id}</title>
          <style>
            body { font-family: 'Georgia', serif; padding: 40px; color: #1c1917; background-color: #faf9f6; }
            .invoice-wrapper { max-width: 700px; margin: 0 auto; border: 1px solid #c5a880; padding: 40px; border-radius: 12px; background: white; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .logo-heading { text-align: center; border-bottom: 2px solid #eae6df; padding-bottom: 20px; }
            .logo-text { font-family: 'Georgia', serif; font-size: 30px; font-weight: bold; margin: 0; color: #1c1917; letter-spacing: 0.05em; text-transform: uppercase; }
            .logo-sub { font-size: 11px; color: #a88c52; text-transform: uppercase; margin-top: 5px; letter-spacing: 0.2em; }
            .flex-meta { display: flex; justify-content: space-between; margin-top: 25px; margin-bottom: 25px; font-size: 13px; color: #444; }
            .meta-block { line-height: 1.6; }
            .section-heading { font-size: 15px; text-transform: uppercase; margin: 30px 0 12px; border-bottom: 1px solid #e1e1e1; padding-bottom: 6px; letter-spacing: 0.1em; font-weight: bold; color: #1c1917; }
            .pricing-table { width: 100%; border-collapse: collapse; margin-bottom: 25px; font-size: 13px; }
            .pricing-table th { border-bottom: 1px solid #1c1917; padding-bottom: 10px; text-align: left; font-weight: bold; text-transform: uppercase; font-size: 11px; color: #7f7f7f; }
            .pricing-table td { padding: 12px 0; border-bottom: 1px solid #efeee9; }
            .total-block { margin-top: 20px; text-align: right; border-top: 2px solid #1c1917; padding-top: 15px; font-size: 18px; font-weight: bold; color: #1c1917; }
            .footer-notes { font-size: 11px; text-align: center; color: #8c857b; margin-top: 45px; border-top: 1px dashed #e2dfd2; padding-top: 25px; line-height: 1.6; }
            .barcode-stamp { letter-spacing: 8px; font-family: 'Courier New', monospace; font-size: 20px; text-align: center; margin: 25px 0 10px; color: #333; }
          </style>
        </head>
        <body>
          <div class="invoice-wrapper">
            <div class="logo-heading">
              <div class="logo-text">Aurelia Resorts</div>
              <div class="logo-sub">Official Digital Statement Invoice</div>
              <p style="font-size: 12px; color: #777; font-style: italic; margin-top: 4px;">French Riviera Hospitality Portfolio</p>
            </div>
            
            <div class="flex-meta">
              <div class="meta-block">
                <strong>Steward Office Issuer:</strong><br/>
                ${booking.hotelName}<br/>
                Riviera Coastal District<br/>
                Phone: +33 4 93 00 11<br/>
                Email: prestige@aureliareserve.com
              </div>
              <div class="meta-block" style="text-align: right;">
                <strong>Statement Ref:</strong> #${booking.id}<br/>
                <strong>Created Date:</strong> ${new Date(booking.createdAt).toLocaleDateString()}<br/>
                <strong>Payment Terms:</strong> Guaranteed Centurion Auto-Debited<br/>
                <strong>Registration Holder:</strong> ${booking.guestName}
              </div>
            </div>
            
            <div class="section-heading">Reservation Profile</div>
            <div style="font-size: 13px; line-height: 1.6; color: #444; margin-bottom: 20px;">
              <div><strong>Living Sanctuary Suite:</strong> ${booking.roomName} (${booking.roomType})</div>
              <div><strong>Check-In Period:</strong> ${new Date(booking.checkIn).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })} &bull; after 3:00 PM</div>
              <div><strong>Check-Out Period:</strong> ${new Date(booking.checkOut).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'long', day: 'numeric' })} &bull; before 11:00 AM</div>
              <div><strong>Stay Duration:</strong> ${booking.nightsCount} Night(s)</div>
              <div><strong>Registered Party size:</strong> ${booking.guestsCount} Guest(s)</div>
            </div>

            ${booking.specialRequestsText || booking.specialRequests && booking.specialRequests.length > 0 ? `
              <div class="section-heading">Pre-Arrival Accommodations</div>
              <div style="font-size: 12px; line-height: 1.6; color: #555; margin-bottom: 20px;">
                ${booking.specialRequests && booking.specialRequests.length > 0 ? `<div><strong>Pre-Selected Luxuries:</strong> ${booking.specialRequests.join(', ')}</div>` : ''}
                ${booking.specialRequestsText ? `<div style="margin-top: 4px; font-style: italic;"><strong>Special Request Log:</strong> "${booking.specialRequestsText}"</div>` : ''}
              </div>
            ` : ''}

            <div class="section-heading">Itemized Financial Breakdown</div>
            <table class="pricing-table">
              <thead>
                <tr>
                  <th style="width: 60%;">Description</th>
                  <th style="width: 20%; text-align: center;">Rate Info</th>
                  <th style="width: 20%; text-align: right;">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Accommodation (Suite Living Area) - ${booking.roomName}</td>
                  <td style="text-align: center;">$${nightsPrice.toLocaleString()} &times; ${booking.nightsCount} N</td>
                  <td style="text-align: right;">$${(nightsPrice * booking.nightsCount).toLocaleString()}</td>
                </tr>
                <tr>
                  <td>European Riviera Resort Levy Fee</td>
                  <td style="text-align: center;">Flat Rate</td>
                  <td style="text-align: right;">$75.00</td>
                </tr>
                <tr>
                  <td>Luxury Pre-Arrival Extras (${luxuryAddons})</td>
                  <td style="text-align: center;">Pre-arranged</td>
                  <td style="text-align: right;">Included</td>
                </tr>
                <tr>
                  <td>Local French Coastal Hospitality Tax (10%)</td>
                  <td style="text-align: center;">10.00%</td>
                  <td style="text-align: right;">$${taxes.toLocaleString()}</td>
                </tr>
              </tbody>
            </table>
            
            <div class="total-block">
              <span style="font-size: 12px; font-weight: normal; color: #7f7f7f; margin-right: 15px; text-transform: uppercase;">Total Cost (Paid in Full)</span>
              $${booking.totalPrice.toLocaleString()}
            </div>

            <div class="barcode-stamp">
              *AURELIA-${booking.id}*
              <div style="font-size: 10px; letter-spacing: normal; margin-top: 6px; font-weight: bold; color: #a88c52;">SECURE TRANSACTION DETAILED STATEMENT CONFIRMED</div>
            </div>

            <div class="footer-notes">
              <p>Thank you for choosing the Aurelia Resorts Collection. This document serves as your official corporate expense statement. We eagerly await your arrival on the Riviera coast.</p>
              <p>Terms: Flexible Reservation. Pre-debited. All municipal hotel guidelines apply at check-in.</p>
              <p>&copy; ${new Date().getFullYear()} Aurelia Resorts S.A. All rights reserved.</p>
            </div>
          </div>
          <script>window.print();</script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div id="my-bookings-panel" className={`rounded-3xl border shadow-xl overflow-hidden transition-all duration-300 ${
      theme === 'dark' 
        ? 'bg-stone-900 border-stone-800 text-stone-100' 
        : 'bg-white border-stone-200 text-stone-900'
    }`}>
      
      {/* HEADER BAR */}
      <div className={`p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b ${
        theme === 'dark' ? 'bg-stone-950/80 border-stone-800' : 'bg-[#FAF9F6] border-stone-200/60'
      }`}>
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-medium tracking-tight">
            Corporate Steward Dashboard
          </h2>
          <span className="block text-[10px] uppercase tracking-widest text-[#A88C52] font-mono leading-none mt-1">
            Enterprise Booking & Loyalty Suite
          </span>
        </div>
        <button
          onClick={onClose}
          className={`text-xs font-semibold px-4 py-2.5 rounded-xl border transition-all shadow-xs cursor-pointer ${
            theme === 'dark'
              ? 'bg-stone-800 border-stone-700 hover:bg-stone-700 text-stone-200'
              : 'bg-white border-stone-200 hover:border-stone-400 text-stone-600'
          }`}
        >
          Explore More Sanctuary Suites
        </button>
      </div>

      {/* DASHBOARD ANALYTICS PANEL */}
      <div className={`p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 border-b ${
        theme === 'dark' ? 'border-stone-800' : 'border-stone-150'
      }`}>
        
        {/* VIP Loyalty Card */}
        <div className={`lg:col-span-6 rounded-2xl p-6 border flex flex-col justify-between h-48 relative overflow-hidden shadow-md ${
          theme === 'dark' ? cardBg : 'bg-gradient-to-br from-[#FAF9F6] via-white to-stone-50 border-stone-200/80'
        }`}>
          {/* Subtle logo background */}
          <Compass className="w-32 h-32 absolute -right-6 -bottom-6 text-stone-500/5 rotate-12 pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className={`w-5 h-5 ${theme === 'dark' ? 'text-[#C5A880]' : 'text-[#A88C52]'}`} />
              <span className="text-[10px] uppercase tracking-widest font-mono font-bold">
                Riviera Elite Alliance
              </span>
            </div>
            <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono text-[9px] uppercase font-bold tracking-wider text-stone-100 bg-gradient-to-r ${tierColor}`}>
              {vipTier}
            </span>
          </div>

          <div>
            <span className="block text-[10px] uppercase text-stone-400 font-mono">Guaranteed Account Holder</span>
            <span className="text-xl md:text-2xl font-semibold tracking-tight">VIP Travel Guest</span>
          </div>

          <div className="flex items-center justify-between border-t border-stone-200/30 pt-3">
            <div>
              <span className="block text-[9px] uppercase text-stone-400 font-mono">Bespoke Loyalty Points</span>
              <span className={`font-mono text-sm font-bold ${theme === 'dark' ? 'text-[#C5A880]' : 'text-[#A88C52]'}`}>
                {totalPoints.toLocaleString()} PTS
              </span>
            </div>
            <div>
              <span className="block text-[9px] uppercase text-stone-400 font-mono">Portfolio Spend</span>
              <span className="font-mono text-xs font-semibold">
                ${totalSpend.toLocaleString()} USD
              </span>
            </div>
          </div>
        </div>

        {/* Real-time Riviera IoT Weather Widgets */}
        <div className="lg:col-span-6 flex flex-col justify-between gap-4">
          <div className="grid grid-cols-3 gap-3 h-full">
            {/* Eze Weather block */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              theme === 'dark' ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-150 shadow-xs'
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-stone-400">Eze Peak</span>
                <CloudSun className="w-4 h-4 text-[#A88C52]" />
              </div>
              <div className="mt-4">
                <span className="block text-xl font-bold font-mono text-stone-800 dark:text-stone-100">24°C</span>
                <span className="text-[9px] text-stone-400 font-mono block">☀️ Sun Mist</span>
              </div>
            </div>

            {/* Saint-Tropez Weather block */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              theme === 'dark' ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-150 shadow-xs'
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-stone-400">St-Tropez</span>
                <Compass className="w-4 h-4 text-[#A88C52]" />
              </div>
              <div className="mt-4">
                <span className="block text-xl font-bold font-mono text-stone-800 dark:text-stone-100">27°C</span>
                <span className="text-[9px] text-stone-400 font-mono block">🌅 Gentle Breeze</span>
              </div>
            </div>

            {/* Cannes Weather block */}
            <div className={`p-4 rounded-xl border flex flex-col justify-between ${
              theme === 'dark' ? 'bg-stone-900/40 border-stone-800' : 'bg-white border-stone-150 shadow-xs'
            }`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-mono uppercase text-stone-400">Cannes</span>
                <Cloud className="w-4 h-4 text-[#A88C52]" />
              </div>
              <div className="mt-4">
                <span className="block text-xl font-bold font-mono text-stone-800 dark:text-stone-100">25°C</span>
                <span className="text-[9px] text-stone-400 font-mono block">🌴 Clear Skies</span>
              </div>
            </div>
          </div>
          
          <div className={`p-3 rounded-xl border text-[10px] font-mono text-stone-500 flex items-center justify-between ${
            theme === 'dark' ? 'bg-stone-950/20 border-stone-800/60' : 'bg-stone-100/45 border-stone-200'
          }`}>
            <span>🟢 Status: Secure Handshake with Azure Riviera Core Butler</span>
            <span>Refreshed: Live 0.0s</span>
          </div>
        </div>

      </div>

      {/* RESERVATIONS GRID */}
      <div className="p-6 md:p-8">
        
        {bookings.length === 0 ? (
          <div className="py-16 text-center max-w-sm mx-auto">
            <div className="w-16 h-16 rounded-full bg-[#E4DCCF]/40 flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-6 h-6 text-[#A88C52]" />
            </div>
            <h3 className="font-display text-xl font-medium mb-2">No Vacancies Reserved</h3>
            <p className="text-sm text-stone-500 leading-relaxed mb-6">
              You haven't requested any custom luxury stays at our French Riviera collection yet. Explore bedrooms to finalize your first booking.
            </p>
            <button
              onClick={onClose}
              className="text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 transition-all rounded-xl px-6 py-3 w-full shadow-md cursor-pointer"
            >
              Examine Premium Suites
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            
            {/* Active Bookings */}
            {activeBookings.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-[#A88C52] mb-4 font-semibold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#A88C52] animate-ping" />
                  Upcoming Sanctuary Bookings ({activeBookings.length})
                </h3>
                
                <div className="grid grid-cols-1 gap-6">
                  {activeBookings.map((booking) => {
                    
                    // Create dynamic mock timeline tracker based on reservation ID last digit
                    const digit = parseInt(booking.id.replace(/\D/g, '')) % 4 || 1;
                    let butlerStatusText = "Confirming details with French butler Hugo...";
                    let percentFilled = "w-1/4 bg-[#A88C52]";
                    
                    if (digit === 1) {
                      butlerStatusText = "Confirming reservation details with French butler Hugo...";
                      percentFilled = "w-1/4 bg-[#A88C52]";
                    } else if (digit === 2) {
                      butlerStatusText = "Suite purification & Dom Pérignon cooling in progress...";
                      percentFilled = "w-2/4 bg-[#A88C52]";
                    } else if (digit === 3) {
                      butlerStatusText = "Helicopter priority launch keys ready at Eze concierge...";
                      percentFilled = "w-3/4 bg-[#C5A880]";
                    } else {
                      butlerStatusText = "Sanctuary ready. Butler awaits your boarding signal.";
                      percentFilled = "w-full bg-emerald-500";
                    }

                    return (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`border rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row shadow-sm ${
                          theme === 'dark' ? 'bg-stone-800/40 border-stone-800' : 'bg-white border-stone-200'
                        }`}
                      >
                        {/* Image pane */}
                        <div className="w-full md:w-1/3 h-56 md:h-auto relative">
                          <img
                            src={booking.roomImage}
                            alt={booking.roomName}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-3 left-3 bg-[#FAF9F6]/95 dark:bg-stone-900/95 px-2.5 py-1 rounded-md border border-stone-200 dark:border-stone-800 text-[9px] font-mono font-bold tracking-widest uppercase text-stone-700 dark:text-[#C5A880]">
                            {booking.roomType}
                          </div>
                        </div>

                        {/* Content text */}
                        <div className="flex-1 p-6 md:p-8 flex flex-col justify-between">
                          <div>
                            <div className="flex flex-wrap justify-between items-start gap-4 mb-3">
                              <div>
                                <h4 className="font-display text-xl font-semibold">
                                  {booking.roomName}
                                </h4>
                                <span className={`text-xs ${theme === 'dark' ? 'text-stone-400' : 'text-[#A88C52]'} font-mono block mt-0.5`}>
                                  {booking.hotelName} &bull; ID: {booking.id}
                                </span>
                              </div>
                              <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 flex items-center gap-1.5 shrink-0">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                CONFIRMED
                              </span>
                            </div>

                            {/* Live Steward Status Tracker Bar */}
                            <div className={`p-4 rounded-xl border md:my-5 my-4 space-y-2 ${
                              theme === 'dark' ? 'bg-stone-950/40 border-stone-800' : 'bg-stone-50 border-stone-150'
                            }`}>
                              <div className="flex justify-between items-center text-[10px] font-mono uppercase text-stone-500">
                                <span>Steward Tracker: active</span>
                                <span className="font-bold text-stone-700 dark:text-[#C5A880]">{butlerStatusText}</span>
                              </div>
                              <div className="w-full bg-stone-300 dark:bg-stone-700 h-1 rounded-full overflow-hidden">
                                <div className={`h-full ${percentFilled}`} />
                              </div>
                            </div>

                            {/* Quick details Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-y border-stone-150/45 text-xs">
                              <div>
                                <span className="block text-[#A88C52] uppercase tracking-wider font-semibold text-[9px] mb-1">Check-in</span>
                                <span className="font-semibold">{booking.checkIn}</span>
                                <span className="block text-stone-400 font-mono text-[9px]">After 3:00 PM</span>
                              </div>
                              <div>
                                <span className="block text-[#A88C52] uppercase tracking-wider font-semibold text-[9px] mb-1">Check-out</span>
                                <span className="font-semibold">{booking.checkOut}</span>
                                <span className="block text-stone-400 font-mono text-[9px]">Before 11:00 AM</span>
                              </div>
                              <div>
                                <span className="block text-[#A88C52] uppercase tracking-wider font-semibold text-[9px] mb-1">Nights duration</span>
                                <span className="font-semibold font-mono">{booking.nightsCount} N</span>
                              </div>
                              <div>
                                <span className="block text-[#A88C52] uppercase tracking-wider font-semibold text-[9px] mb-1">Registered Guests</span>
                                <span className="font-semibold">{booking.guestsCount} Guest(s)</span>
                              </div>
                            </div>

                            {/* Pre-arrival configurations */}
                            <div className="py-4 space-y-1.5 text-xs">
                              <p className="text-stone-500">
                                <strong className="text-stone-700 dark:text-stone-200">Reservation Coordinator:</strong> {booking.guestName} &bull; Coordinates: {booking.guestEmail} | {booking.guestPhone}
                              </p>
                              {booking.specialRequests && booking.specialRequests.length > 0 && (
                                <p className="text-stone-500">
                                  <strong className="text-stone-700 dark:text-stone-200">Pre-arranged Extras:</strong>{' '}
                                  <span className="text-[#A88C52] font-semibold">{booking.specialRequests.join(', ')}</span>
                                </p>
                              )}
                              {booking.specialRequestsText && (
                                <p className={`border p-3 rounded-lg mt-2 font-mono text-[11px] leading-relaxed text-stone-500 ${
                                  theme === 'dark' ? 'bg-stone-900 border-stone-800' : 'bg-stone-50/50 border-stone-200'
                                }`}>
                                  <strong className="text-stone-700 dark:text-stone-300 block mb-0.5">Direct Steward Request Note:</strong>
                                  "{booking.specialRequestsText}"
                                </p>
                              )}
                            </div>
                          </div>

                          {/* CTA Control buttons */}
                          <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-stone-150/50">
                            <div>
                              <span className="block text-[10px] text-stone-400 font-sans uppercase">Debited Amount</span>
                              <span className="text-xl font-bold font-mono tracking-tight text-stone-900 dark:text-[#C5A880]">
                                ${booking.totalPrice.toLocaleString()}
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs">
                              {/* AI Custom Itinerary Planner */}
                              <button
                                onClick={() => generateAIItinerary(booking)}
                                className={`px-4 py-2 hover:bg-[#A88C52] hover:text-white border border-[#A88C52] text-[#A88C52] rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs`}
                              >
                                <Sparkles className="w-3.5 h-3.5" />
                                Plan AI Itinerary
                              </button>

                              {/* Print PDF Invoice button */}
                              <button
                                onClick={() => printTicket(booking)}
                                className={`px-4 py-2 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-200 dark:border-stone-700 rounded-xl font-semibold flex items-center gap-1.5 transition-all text-stone-600 dark:text-stone-300 cursor-pointer`}
                              >
                                <Printer className="w-3.5 h-3.5" />
                                Download PDF Statement
                              </button>

                              {/* Cancel stay */}
                              <button
                                onClick={() => onCancelBooking(booking.id)}
                                className="px-4 py-2 hover:bg-rose-500 hover:text-white border border-rose-300 dark:border-rose-900/60 text-rose-500/90 rounded-xl font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                              >
                                <Ban className="w-3.5 h-3.5" />
                                Void Reservation
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Past/Cancelled Bookings */}
            {pastBookings.length > 0 && (
              <div>
                <h3 className="text-xs font-mono uppercase tracking-widest text-stone-400 mb-4 font-semibold">
                  Historic Stay Archive Reports
                </h3>
                <div className="space-y-4 text-xs">
                  {pastBookings.map((booking) => (
                    <div
                      key={booking.id}
                      className={`border rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        theme === 'dark' ? 'bg-stone-900/30 border-stone-800' : 'bg-stone-50//20 border-stone-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <h4 className="font-semibold text-sm">{booking.roomName}</h4>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase border ${
                            booking.status === 'completed'
                              ? 'bg-stone-100 text-stone-800 border-stone-200'
                              : 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <p className="text-stone-500 leading-relaxed">
                          Stay: {booking.checkIn} to {booking.checkOut} &bull; {booking.nightsCount} night(s) &bull; Ref Log: #{booking.id}
                        </p>
                      </div>

                      <div className="text-right flex md:flex-col justify-between items-center md:items-end gap-2 shrink-0">
                        <span className="font-mono font-bold text-stone-750 dark:text-stone-300">${booking.totalPrice.toLocaleString()}</span>
                        {booking.status === 'cancelled' && (
                          <span className="text-[10px] text-[#A88C52]">Premium Room slots returned to inventory</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      {/* AI ITINERARY GENERATED MODAL POPUP */}
      <AnimatePresence>
        {activeItineraryBooking && (
          <div className="fixed inset-0 z-50 bg-stone-950/65 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`w-full max-w-2xl p-6 md:p-8 rounded-3xl border shadow-2xl relative overflow-y-auto max-h-[85vh] ${
                theme === 'dark' ? 'bg-stone-900 border-stone-800 text-stone-100' : 'bg-white border-stone-200 text-stone-900'
              }`}
            >
              <button
                onClick={() => {
                  setActiveItineraryBooking(null);
                  setItineraryResult(null);
                }}
                className={`absolute top-4 right-4 text-stone-400 hover:text-stone-900 font-bold p-1 rounded-full border border-stone-200 dark:border-stone-800 cursor-pointer`}
              >
                ✕
              </button>

              <div className="flex items-center gap-3.5 mb-4 mb-2">
                <Sparkles className="w-6 h-6 text-[#A88C52] animate-pulse" />
                <div>
                  <h3 className="font-display text-xl shrink-0 font-medium">Bespoke Guest Itinerary Timeline</h3>
                  <p className="text-[10px] text-[#A88C52] uppercase font-mono tracking-widest">
                    AI Concierge Butler Service &bull; {activeItineraryBooking.hotelName}
                  </p>
                </div>
              </div>

              <div className={`p-4 rounded-2xl border my-4 font-mono text-[11px] leading-relaxed text-stone-500 ${
                theme === 'dark' ? 'bg-stone-950/50 border-stone-800' : 'bg-stone-50 border-stone-150'
              }`}>
                Registered Suite: <span className="font-bold text-stone-800 dark:text-stone-300">{activeItineraryBooking.roomName}</span> &bull; 
                Holder: <span className="font-bold text-stone-800 dark:text-stone-300">{activeItineraryBooking.guestName}</span>
              </div>

              {itineraryLoading ? (
                <div className="py-16 text-center space-y-4">
                  <span className="w-10 h-10 border-4 border-[#A88C52] border-t-transparent rounded-full animate-spin block mx-auto" />
                  <p className="text-xs text-stone-500 italic font-mono">
                    Consulting French Riviera timetable ledger and matching yacht transfers...
                  </p>
                </div>
              ) : (
                <div className={`prose max-w-none text-xs leading-relaxed space-y-4 border p-6 rounded-2xl ${
                  theme === 'dark' ? 'bg-stone-950/20 border-stone-800 text-stone-300' : 'bg-white border-stone-150 text-stone-700'
                }`}>
                  <div className="whitespace-pre-line leading-relaxed font-sans text-xs md:text-sm">
                    {itineraryResult}
                  </div>
                </div>
              )}

              <div className="mt-6 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setActiveItineraryBooking(null);
                    setItineraryResult(null);
                  }}
                  className="px-6 py-2.5 bg-stone-900 hover:bg-stone-800 text-[#C5A880] text-xs font-bold tracking-widest uppercase rounded-xl transition-all cursor-pointer shadow-md"
                >
                  Apply & Synchronize Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
