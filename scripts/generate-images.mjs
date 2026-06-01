#!/usr/bin/env node
/**
 * Brand image generation via Nano Banana Pro (Gemini 3 Pro Image) voor Zeeland Schakelt.
 *
 * Usage:
 *   npm run generate:images                              # alle ontbrekende
 *   npm run generate:images -- --force                   # alles opnieuw (kost geld)
 *   npm run generate:images -- --only=hero-home --force  # één specifiek
 *
 * Vereist GEMINI_API_KEY (in ~/.zshrc shell-env of lokale .env).
 */

import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, "..");
const OUTPUT_DIR = path.join(PROJECT_ROOT, "public", "images", "zeeland-schakelt", "generated");

if (!process.env.GEMINI_API_KEY) {
  console.error("\x1b[31mGEMINI_API_KEY is niet gezet.\x1b[0m");
  console.error("  Zet in ~/.zshrc:  export GEMINI_API_KEY=AIza...");
  console.error("  Of kopieer .env.example naar .env en vul hem in.");
  console.error("  Key ophalen: https://aistudio.google.com/apikey");
  process.exit(1);
}

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const ONLY = args.find((a) => a.startsWith("--only="))?.split("=")[1];

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

/**
 * Gedeelde stijl-signatuur op elke prompt. High-end, editorial, Apple-waardig.
 */
const BRAND = [
  "Photorealistic editorial photography for Zeeland Schakelt, a premium regional platform for working, commuting and staying in the Dutch province of Zeeland during a major tunnel closure.",
  "Visual language: clean architectural composition, calm sculptural minimalism, generous negative space, refined and high-end like an Apple keynote visual.",
  "Light: soft diffuse Northern-European coastal daylight or low golden hour, gentle shadows, airy and fresh.",
  "Sophisticated muted palette of deep sea blue, soft aqua-teal, warm sand and off-white, with restrained warm accents.",
  "Magazine-quality finish in the spirit of Cereal, Kinfolk and Monocle.",
  "No people in frame, no faces. No text, no logos, no watermarks, no captions, no signage.",
  "Shot on medium-format camera, honest natural materials and textures, crisp yet warm, subtle depth of field.",
].join(" ");

/**
 * Alle beeld-slots. Naamgeving = stabiele content-slug (geen toolnaam).
 * hero-* = paginahero, cat-* = categorie-fallback, rest = per aanbod-id.
 */
const IMAGES = [
  // ---- Hero's ----
  {
    name: "hero-home",
    prompt:
      "Wide cinematic aerial view of the Zeeland coastline where green polder land meets the calm Westerschelde estuary at low golden hour. A thin coastal road curves through the landscape, soft sandbanks and distant dunes, glassy water catching warm light. Expansive, tranquil and optimistic. Aspect ratio 16:9.",
  },
  {
    name: "hero-community",
    prompt:
      "A bright calm modern communal interior with a long shared light-wood table beside large windows overlooking Zeeland water. Empty designer chairs, a few plants, warm minimal styling, the quiet sense that people just stepped away. Soft daylight. Aspect ratio 16:9.",
  },

  // ---- Categorie-fallbacks ----
  {
    name: "cat-werkplek",
    prompt:
      "A minimal Scandinavian flexible workspace: a clean light-wood desk by a large window with soft daylight, a closed laptop, a ceramic coffee cup and a single plant. Calm, uncluttered, premium. Aspect ratio 3:2.",
  },
  {
    name: "cat-vergaderruimte",
    prompt:
      "A refined small meeting room with a light oak table, elegant chairs, a glass partition and a clean whiteboard, soft diffuse daylight, minimal and high-end. Aspect ratio 3:2.",
  },
  {
    name: "cat-overnachting",
    prompt:
      "A serene boutique hotel room with linen bedding in muted sand tones and a small work nook by the window, soft coastal morning light, calm and quietly luxurious. Aspect ratio 3:2.",
  },
  {
    name: "cat-carpool",
    prompt:
      "A quiet coastal Dutch dike road at golden hour from a low angle, a single modern car in soft focus and the Westerschelde water beyond, calm and cinematic. Aspect ratio 3:2.",
  },

  // ---- Per aanbod ----
  {
    name: "dockwize-flexhub",
    prompt:
      "A modern innovation-hub coworking space inside a converted harbor building: industrial-chic with exposed steel and warm wood desks, large windows letting in soft maritime light, plants and stylish empty chairs. Premium and creative. Aspect ratio 3:2.",
  },
  {
    name: "co3-campus-werkplekken",
    prompt:
      "A bright contemporary campus co-working area with long communal tables, soft daylight, greenery and minimal Scandinavian furniture, calm and academic. Aspect ratio 3:2.",
  },
  {
    name: "stadshaven-goes",
    prompt:
      "A characterful flex office in a historic Dutch town center: sit-stand desks, exposed brick, tall arched windows with soft daylight, refined and cozy. Aspect ratio 3:2.",
  },
  {
    name: "werkhub-terneuzen",
    prompt:
      "A clean new workhub interior with private phone booths, a small lounge with soft seating, light wood and muted blue accents, fresh daylight. Aspect ratio 3:2.",
  },
  {
    name: "bibliotheek-goes",
    prompt:
      "A serene modern library study area with warm wooden shelves and a quiet reading desk by tall windows, soft natural light, calm and minimal. Aspect ratio 3:2.",
  },
  {
    name: "dorpshuis-oostburg",
    prompt:
      "A warm community-hall workspace: a simple wooden table with chairs, large windows onto a village green, homely and inviting, soft daylight. Aspect ratio 3:2.",
  },
  {
    name: "hz-flexruimte",
    prompt:
      "A modern university open study space with sleek minimal furniture, abundant daylight from a glass facade, a few plants, calm and contemporary. Aspect ratio 3:2.",
  },
  {
    name: "strandwerkplek-breskens",
    prompt:
      "A beach pavilion interior in the off-season arranged as a workspace: a wooden table facing floor-to-ceiling windows onto a quiet North Sea beach, soft overcast light, calm and atmospheric. Aspect ratio 3:2.",
  },
  {
    name: "projectruimte-de-kaai",
    prompt:
      "A bright project room by a harbor: a large light-wood table, whiteboards, big windows overlooking moored boats and water, minimal and professional. Aspect ratio 3:2.",
  },
  {
    name: "vergaderzaal-kapelle",
    prompt:
      "A spacious rural meeting hall with a long table and simple elegant chairs, large windows onto orchards, plenty of light, clean and understated. Aspect ratio 3:2.",
  },
  {
    name: "hotel-terminus-goes",
    prompt:
      "An elegant boutique hotel room with a tidy work desk and lamp by the window, crisp neutral bedding, warm evening light, refined and comfortable. Aspect ratio 3:2.",
  },
  {
    name: "bb-cadzand",
    prompt:
      "A serene seaside bed-and-breakfast room with linen textures in soft sand tones and a small desk by a window full of dune and sea light, airy and calm. Aspect ratio 3:2.",
  },
  {
    name: "stayokay-domburg",
    prompt:
      "A characterful private room in a monumental Dutch building: high ceilings, a neat single workspace, soft daylight through tall windows, refined heritage feel. Aspect ratio 3:2.",
  },
  {
    name: "camping-zonneweide",
    prompt:
      "A cozy modern wooden cabin interior with a small work table by a window onto dunes and trees, warm minimal styling, soft natural light. Aspect ratio 3:2.",
  },
  {
    name: "carpoolpunt-goes",
    prompt:
      "An orderly park-and-ride carpool point in soft morning light: empty parking bays beside a tidy modern shelter, a Dutch dike and water in the background, calm and clean. Aspect ratio 3:2.",
  },
  {
    name: "fietsvoetveer-breskens",
    prompt:
      "A bicycle-and-pedestrian ferry crossing the Westerschelde: neat rows of parked bikes on the deck, calm water and a wide fresh sky, maritime light, optimistic. Aspect ratio 3:2.",
  },
  {
    name: "shuttle-zvl-goes",
    prompt:
      "A sleek modern shuttle bus parked at a clean station platform in soft morning light, minimal and contemporary, calm commuter atmosphere, no people. Aspect ratio 3:2.",
  },
];

if (IMAGES.length === 0) {
  console.error("\x1b[31mIMAGES array is leeg.\x1b[0m");
  process.exit(1);
}

const filtered = ONLY ? IMAGES.filter((i) => i.name === ONLY) : IMAGES;
if (ONLY && filtered.length === 0) {
  console.error(`\x1b[31mGeen beeld met naam "${ONLY}".\x1b[0m  Beschikbaar:`);
  IMAGES.forEach((i) => console.error(`    ${i.name}`));
  process.exit(1);
}

async function generateOne({ name, prompt }) {
  const outPath = path.join(OUTPUT_DIR, `${name}.png`);
  if (fs.existsSync(outPath) && !FORCE) {
    console.log(`\x1b[90mskip (bestaat): ${name}.png\x1b[0m`);
    return { name, status: "skip" };
  }
  console.log(`\x1b[36mgenereren: ${name}\x1b[0m`);
  const t0 = Date.now();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-image-preview",
      contents: `${BRAND}\n\n${prompt}`,
    });
    const part = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData);
    if (!part) {
      console.warn(`\x1b[33m  geen beelddata terug voor ${name}\x1b[0m`);
      return { name, status: "empty" };
    }
    const buffer = Buffer.from(part.inlineData.data, "base64");
    fs.writeFileSync(outPath, buffer);
    const kb = (buffer.length / 1024).toFixed(0);
    const secs = ((Date.now() - t0) / 1000).toFixed(1);
    console.log(`\x1b[32mopgeslagen: ${name}.png  (${kb} KB, ${secs}s)\x1b[0m`);
    return { name, status: "ok" };
  } catch (err) {
    console.error(`\x1b[31mmislukt: ${name}  ${err.message}\x1b[0m`);
    return { name, status: "error" };
  }
}

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  console.log(`\nGenereren van ${filtered.length} beeld${filtered.length === 1 ? "" : "en"} naar:`);
  console.log(`  ${path.relative(PROJECT_ROOT, OUTPUT_DIR)}/\n`);

  const results = [];
  for (const img of filtered) {
    results.push(await generateOne(img));
  }

  const ok = results.filter((r) => r.status === "ok").length;
  const skip = results.filter((r) => r.status === "skip").length;
  const fail = results.filter((r) => r.status !== "ok" && r.status !== "skip").length;
  console.log(`\n\x1b[1mKlaar:\x1b[0m ${ok} gegenereerd, ${skip} overgeslagen, ${fail} mislukt.\n`);
  if (fail > 0) process.exit(1);
}

main();
