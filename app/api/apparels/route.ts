// app/api/apparels/route.js
import dbConnect from "@/lib/mongoose";
import Apparel from "@/models/Apparel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const PINATA_JWT = process.env.PINATA_JWT_TOKEN;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// Upload to Pinata (v3)
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

  return `https://${process.env.PINATA_GATEWAY}/ipfs/${data.data.cid}?pinataGatewayToken=${process.env.PINATA_GATEWAY_TOKEN}`;
}

// GET → list all apparels
export async function GET(req) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const prices = JSON.parse(searchParams.get("prices") || "[]");
  const sports = JSON.parse(searchParams.get("sports") || "[]");

  const filter: any = {};

  if (sports.length > 0) filter.sport = { $in: sports };
  if (prices.length > 0) filter.price = { $lte: Math.max(...prices.map((p: string) => parseInt(p))) };

  const apparels = await Apparel.find(filter);
  return NextResponse.json(apparels);
}

// POST → create a new apparel (admin only, multiple images)
export async function POST(req) {
  await dbConnect();

  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
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
  const files = formData.getAll("images");

  for (const file of files) {
    if (file instanceof File && file.size > 0) {
      if (!file.type.startsWith("image/")) {
        return NextResponse.json({ message: "Only images allowed" }, { status: 400 });
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const url = await uploadToPinata({
        buffer,
        originalname: file.name,
        type: file.type,
      });

      images.push(url);
    }
  }

  const apparel = await Apparel.create({
    name,
    sport,
    price,
    description,
    images,
    thumbnail: images[0] || "",
  });

  return NextResponse.json({ message: "Apparel created successfully", apparel }, { status: 201 });
}
