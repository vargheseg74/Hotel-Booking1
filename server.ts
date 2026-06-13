/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Load mock rooms/hotels so AI has 100% accurate contextual catalog
import { BOUTIQUE_HOTELS, MOCK_ROOMS } from "./src/data.js";

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialization client helper to safeguard against missing keys and follow standard guide
let geminiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!geminiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is required to authenticate with local steward offices.");
    }
    geminiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return geminiClient;
}

// 1. Core Endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    api_key_enabled: !!process.env.GEMINI_API_KEY,
  });
});

// AI Travel Assistant Conversational route
app.post("/api/gemini/assist", async (req, res) => {
  const { messages, selectedHotelId, activeRoomId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "Context messages must be provided as a structured transcript array." });
  }

  try {
    const client = getGeminiClient();

    // Compile active context to feed the Steward's persona
    let currentContext = "The user is browsing the Aurelia Riviera Resorts Booking Platform. ";
    if (selectedHotelId && selectedHotelId !== "All") {
      const hotel = BOUTIQUE_HOTELS.find((h) => h.id === selectedHotelId);
      if (hotel) {
        currentContext += `They are interested in "${hotel.name}" located in ${hotel.city}. `;
      }
    }
    if (activeRoomId) {
      const room = MOCK_ROOMS.find((r) => r.id === activeRoomId);
      if (room) {
        currentContext += `They are viewing the "${room.name}" suite ($${room.pricePerNight}/night, capacity ${room.capacity} guests). `;
      }
    }

    // Format chat history to send to Gemini
    const systemPrompt = `You are the Elite AI Concierge and Riviera Travel Steward on the Aurelia Riviera Resorts Booking Platform.
Your tone is highly refined, majestic, exceptionally helpful, warm, polished, and sophisticated.
You address guests with ultimate poise and assistance.
You provide advice regarding:
- Private yacht charters (Saint-Tropez, Cannes)
- Michelin-starred dining, beach club bookings, helicopter transfers, pillows menu, soma wellness therapies.
- Tailored itineraries for Eze, Saint-Tropez, and Cannes.
- Our boutique hotels (The Aurelia Reserve, Le Club Peninsula, Villa Bellecour). Always reference our REAL accommodation options (Atelier Classic King, Rive Gauche Ocean Terrace, The Cliffs Overwater Pavilion, San Remo Classic, Tropezienne Plunge Pool Garden Wood, Serene Coastal Penthouse, Boulevard View Double, The Cannes Marina Suite, The Grand Palais Residence). Never invent fake suites!

${currentContext}

Formulate replies using beautiful formatting and high-society flair. Keep answers concise, helpful, and formatted inside clean, scannable Markdown blocks. Wait, do not output any HTML tags inside Markdown!`;

    // Map message list to Gemini contents
    const contentHistory = messages.map((m: any) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.content || "" }],
    }));

    // Generate assistant reply
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentHistory,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.7,
      },
    });

    const text = response.text || "I apologize. I am processing your grand itinerary setup. How may I serve your travel coordinates today?";
    res.json({ content: text });

  } catch (error: any) {
    console.error("Gemini Assistant route error:", error);
    // Provide magnificent luxury mock fallback if API Key is not set so the app continues to perform beautifully!
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      const userMsg = messages[messages.length - 1]?.content?.toLowerCase() || "";
      let genericReply = `Welcome to the Aurelia Riviera Resorts Elite Service Centre. 
We've set up your assistant with high-society insights! (To unlock the live, dynamic Gemini AI Travel Steward, kindly add your **GEMINI_API_KEY** in the **Settings > Secrets** panel.)

How I can suggest:
1. **The Aurelia Reserve (Eze)**: Quiet luxury, Soma Spa heated saltwater lagoons, 24/7 personal butler Hugo.
2. **Le Club Peninsula (Saint-Tropez)**: Yacht charters, vibrant beach cabanas, fresh citrus pools.
3. **Villa Bellecour (Cannes)**: Cinema screening salon, grand film festival priority transfers.

Where can I curate your next bespoke stay?`;

      if (userMsg.includes("yacht") || userMsg.includes("boat")) {
        genericReply = `✨ **Bespoke Yacht Experiences** ✨
All our guests at Cannes and Saint-Tropez retain absolute boarding and mooring privileges.
Our recommended charter, the *Aurelia Grand Sovereign*, holds sunset champagne cruises daily. Let me know if you would like to secure reservation passes inside your booking details!
*(Enter your Live Gemini API Key in the Settings to coordinate yacht timetables dynamically.)*`;
      } else if (userMsg.includes("dining") || userMsg.includes("michelin") || userMsg.includes("food")) {
        genericReply = `🍽️ **Gastronomy & Lounges** 🍽️
The Aurelia Reserve hosts *Le Pléiade*, a stellar 3-Michelin-starred culinary experience focusing on citrus dry-aged wild sea-bass and vintage Dom Pérignon preparations.
*(Enable your live Gemini AI Steward in the Settings for personalized culinary reservations.)*`;
      }

      return res.json({ content: genericReply });
    }
    res.status(500).json({ error: "Apologies, your steward encountered an issue processing that luxury request." });
  }
});

// AI Hotel & Suite Smart Recommendation engine
app.post("/api/gemini/recommend", async (req, res) => {
  const { city, maxPrice, guestsCount, preferencesText } = req.body;

  try {
    const client = getGeminiClient();

    // Prepare complete catalog summary
    const catalogString = MOCK_ROOMS.map(r => 
      `- [ID: "${r.id}", Hotel: "${r.hotelName}", City: "${r.hotelId.replace('hotel-', '')}"] Room: "${r.name}" (${r.type}), Price: $${r.pricePerNight}/night, Capacity: ${r.capacity} guests. Amenities: ${r.amenities.join(', ')}. Spec: ${r.description}`
    ).join("\n");

    const systemPrompt = `You are the chief concierge matchmaker of Aurelia Riviera Resorts.
Your task is to analyze a guest's travel coordinates and recommend the absolute best 2 matching suites from our EXACT existing catalog.
Do not invent mock or fake properties. Select solely from these rooms:
${catalogString}

The guest's search inputs are:
- City/Destination constraint: ${city || "All"}
- Maximum Nightly Budget: $${maxPrice || "No Limit"}
- Minimum Guest Capacity Needed: ${guestsCount || 1} Guests
- Custom Personal Preferences: "${preferencesText || "Quiet luxury, ocean terraces"}"

Generate a structured JSON response containing:
1. A concise, elegant greeting explaining the tailored match.
2. An array of "matches" (exactly 2 matches if possible). Each match MUST include:
   - "roomId" (matching the exact ID from our catalog list)
   - "roomName" (matching exact room title)
   - "stewardConsensus" (1 tailored, beautifully written sentence explaining why this suite matches their preferences exquisitely, with high-society flair)
   - "curatedLuxAddon" (1 suggested personalized luxury touch, e.g., "Scented eucalyptus oil mist", "Private launch deck reservation")
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: "Select the ultimate luxury match for me.",
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const text = response.text || "{}";
    res.send(JSON.parse(text));

  } catch (error: any) {
    console.error("Gemini Recommendation route error:", error);
    // Provide high-fidelity mock recommendation fallback in case of no key
    const roomMatches = MOCK_ROOMS.filter(r => {
      const matchesCity = city === "All" || r.hotelId.includes(city.toLowerCase().substring(0, 4));
      const matchesPrice = r.pricePerNight <= (maxPrice || 2200);
      const matchesGuests = r.capacity >= (guestsCount || 1);
      return matchesCity && matchesPrice && matchesGuests;
    }).slice(0, 2);

    const fallbackRooms = roomMatches.length > 0 ? roomMatches : MOCK_ROOMS.slice(0, 2);

    const fallbackResult = {
      greeting: "We have compiled a premier recommendation itinerary from our French Riviera vaults just for you. (Configure your live Gemini API Key in Settings to enable smart AI recommendations dynamically.)",
      matches: fallbackRooms.map(r => ({
        roomId: r.id,
        roomName: r.name,
        stewardConsensus: `The ${r.name} matches your requested criteria of $${r.pricePerNight}/night. Featuring exquisite ${r.amenities[0] || "Botanical care packs"} setup.`,
        curatedLuxAddon: "Complimentary chilled glass of vintage champagne at check-in",
      }))
    };

    res.json(fallbackResult);
  }
});

// Setup Vite Dev server or production static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Aurelia Server] running on http://localhost:${PORT}`);
  });
}

startServer();
