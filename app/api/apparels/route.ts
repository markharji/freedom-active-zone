// app/api/apparels/route.js
import dbConnect from "@/lib/mongoose";
import Apparel from "@/models/Apparel";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// GET → list all apparels
export async function GET() {
  await dbConnect();
  const apparels = await Apparel.find();
  return NextResponse.json(apparels);
}

// POST → create a new apparel (admin only)
export async function POST(req) {
  await dbConnect();
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET); // check admin login
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  const { name, sport, price, thumbnail, description } = await req.json();

  if (!name || !sport || !price || !description) {
    return NextResponse.json({ message: "All fields are required" }, { status: 400 });
  }

  const apparel = await Apparel.create({ name, sport, price, thumbnail, description });

  return NextResponse.json({ message: "Apparel created successfully", apparel }, { status: 201 });
}
