// app/api/facilities/route.js
import dbConnect from "@/lib/mongoose";
import Facility from "@/models/Facility";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// GET → list all facilities
export async function GET() {
  await dbConnect();
  const facilities = await Facility.find();
  return NextResponse.json(facilities);
}

// POST → create a new facility (admin only)
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

  const facility = await Facility.create({ name, sport, price, thumbnail, description });

  return NextResponse.json({ message: "Facility created successfully", facility }, { status: 201 });
}
