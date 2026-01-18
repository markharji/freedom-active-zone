// app/api/facilities/[id]/route.js
import dbConnect from "@/lib/mongoose";
import Facility from "@/models/Facility";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const config = {
  api: {
    bodyParser: false, // Important: disable Next.js default body parser
  },
};

// GET → get a single facility by ID
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const facility = await Facility.findById(id);
    if (!facility) {
      return NextResponse.json({ message: "Facility not found" }, { status: 404 });
    }
    return NextResponse.json(facility);
  } catch (error) {
    return NextResponse.json({ message: "Invalid facility ID" }, { status: 400 });
  }
}

// PATCH → update facility by ID (admin only)
export async function PUT(req, { params }) {
  await dbConnect();
  const { id } = await params;

  // Check admin auth
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    jwt.verify(token, JWT_SECRET);
  } catch {
    return NextResponse.json({ message: "Invalid token" }, { status: 401 });
  }

  try {
    const data = await req.json();

    console.log("data", data);

    // Validate required fields if needed
    const { name, sport, price, description, thumbnail } = data;
    if (!name || !sport || !price || !description) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    const updatedFacility = await Facility.findByIdAndUpdate(
      id,
      { name, sport, price, description, thumbnail },
      { new: true },
    );

    if (!updatedFacility) {
      return NextResponse.json({ message: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Facility updated successfully", facility: updatedFacility });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
