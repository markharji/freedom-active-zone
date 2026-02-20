// app/api/facilities/route.js
import dbConnect from "@/lib/mongoose";
import Facility from "@/models/Facility";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// You can use either JWT auth or Pinata API keys
const PINATA_JWT = process.env.PINATA_JWT_TOKEN;

async function uploadToPinata(file) {
  const formData = new FormData();

  const blob = new Blob([file.buffer], { type: file.type || "application/octet-stream" });

  formData.append("file", blob, file.originalname);
  formData.append("network", "public");

  const res = await fetch("https://uploads.pinata.cloud/v3/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${PINATA_JWT}`,
    },
    body: formData,
  });

  const text = await res.text();

  if (!res.ok) {
    console.error("Pinata error:", text);
    throw new Error("Pinata upload failed");
  }

  const data = JSON.parse(text);
  console.log(data);
  return `https://${process.env.PINATA_GATEWAY}/ipfs/${data.data.cid}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`;
}

// GET → list all facilities
export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const prices = JSON.parse(searchParams.get("prices") || "[]");
  const sports = JSON.parse(searchParams.get("sports") || "[]");
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam) : null;
  const filter: any = {};

  if (sports.length > 0) {
    filter.$or = [{ sport: { $in: sports } }, { otherSports: { $elemMatch: { $in: sports } } }];
  }
  if (prices.length > 0) filter.price = { $lte: Math.max(...prices.map((p: string) => parseInt(p))) };

  let query = Facility.find(filter);
  if (limit) query = query.limit(limit);

  const facilities = await query;

  return NextResponse.json(facilities);
}

// POST → create a new facility with multiple images
export async function POST(req) {
  await dbConnect();

  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const formData = await req.formData();

  const name = formData.get("name")?.toString().trim();
  const sport = formData.get("sport")?.toString().trim();
  const convertible = formData.get("convertible") === "true";
  const description = formData.get("description")?.toString().trim();

  // Other sports
  const otherSportsRaw = formData.getAll("otherSports");
  const otherSports = otherSportsRaw.map((s) => s.toString());

  // Time slots (JSON string)
  let timeSlots: { start: number; end: number; price: number }[] = [];
  try {
    const slotsRaw = formData.get("timeSlots")?.toString();
    if (slotsRaw) timeSlots = JSON.parse(slotsRaw);

    // Validate each slot
    for (let i = 0; i < timeSlots.length; i++) {
      const slot = timeSlots[i];
      if (
        slot.start == null ||
        slot.end == null ||
        slot.price == null ||
        slot.start < 6 ||
        slot.end > 23 ||
        slot.start >= slot.end ||
        slot.price < 0
      ) {
        throw new Error(`Invalid time slot at index ${i + 1}`);
      }

      // Check overlap
      for (let j = i + 1; j < timeSlots.length; j++) {
        const other = timeSlots[j];
        if (!(slot.end <= other.start || slot.start >= other.end)) {
          throw new Error(`Time slot ${i + 1} overlaps with slot ${j + 1}`);
        }
      }
    }
  } catch (err) {
    return NextResponse.json({ message: err.message || "Invalid time slots" }, { status: 400 });
  }

  // Basic validation
  if (!name || !sport || description === undefined) {
    return NextResponse.json({ message: "All required fields must be provided" }, { status: 400 });
  }

  if (convertible && otherSports.length === 0) {
    return NextResponse.json({ message: "Please select at least one additional sport" }, { status: 400 });
  }

  // Hotspot
  let hotspot: { x: number; y: number } | null = null;
  try {
    const hotspotRaw = formData.get("hotspot")?.toString();
    if (hotspotRaw) {
      const parsed = JSON.parse(hotspotRaw);
      if (typeof parsed.x === "number" && typeof parsed.y === "number") {
        hotspot = parsed;
      } else {
        throw new Error("Invalid hotspot coordinates");
      }
    }
  } catch (err) {
    return NextResponse.json({ message: "Invalid hotspot format" }, { status: 400 });
  }

  // Images
  const images: string[] = [];
  const files = formData.getAll("images");

  for (const file of files) {
    if (file instanceof File && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());

      const url = await uploadToPinata({
        buffer,
        originalname: file.name,
        type: file.type,
      });

      images.push(url);
    }
  }

  const facility = await Facility.create({
    name,
    sport,
    convertible,
    otherSports: convertible ? otherSports : [],
    description,
    images,
    thumbnail: images[0] || "",
    timeSlots,
    hotspot, // ✅ save hotspot here
  });

  return NextResponse.json({ message: "Facility created successfully", facility }, { status: 201 });
}
