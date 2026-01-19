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

  if (sports.length > 0) filter.sport = { $in: sports };
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
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch (e) {
    console.log(e);
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const formData = await req.formData();

  const name = formData.get("name");
  const sport = formData.get("sport");
  const price = Number(formData.get("price"));
  const description = formData.get("description");

  if (!name || !sport || !price || !description) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const images: string[] = [];

  const files = formData.getAll("images"); // IMPORTANT
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
    price,
    description,
    images,
    thumbnail: images[0] || "",
  });

  return NextResponse.json({ message: "Facility created successfully", facility }, { status: 201 });
}
