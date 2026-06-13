/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type RoomType = 'Standard' | 'Deluxe' | 'Executive Suite' | 'Presidential Suite' | 'Royal Villa';

export interface Hotel {
  id: string;
  name: string;
  tagline: string;
  location: string;
  city: 'Eze' | 'Saint-Tropez' | 'Cannes';
  rating: number;
  reviewsCount: number;
  image: string;
  description: string;
  amenities: string[];
  phone: string;
  email: string;
}

export interface Room {
  id: string;
  hotelId: string;
  hotelName: string;
  name: string;
  type: RoomType;
  description: string;
  longDescription: string;
  pricePerNight: number;
  capacity: number; // Max guests
  sizeSqFt: number;
  bedType: string;
  images: string[];
  amenities: string[];
  rating: number;
  reviewsCount: number;
  availableCount: number;
  featured?: boolean;
}

export type BookingStatus = 'confirmed' | 'active' | 'completed' | 'cancelled';

export interface Booking {
  id: string;
  roomId: string;
  roomName: string;
  roomType: RoomType;
  roomImage: string;
  hotelId: string;
  hotelName: string;
  checkIn: string; // ISO date string YYYY-MM-DD
  checkOut: string; // ISO date string YYYY-MM-DD
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  guestsCount: number;
  totalPrice: number;
  nightsCount: number;
  status: BookingStatus;
  createdAt: string; // datetime offset
  specialRequests?: string[];
  specialRequestsText?: string;
  billingAddress?: string;
  creditCardLast4?: string;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  avatar?: string;
  hotelId?: string;
  hotelName?: string;
}
