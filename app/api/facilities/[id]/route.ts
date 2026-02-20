// app/api/facilities/[id]/route.js
import dbConnect from "@/lib/mongoose";
import Facility from "@/models/Facility";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// GET → get a single facility by ID
export async function GET(req, { params }) {
  await dbConnect();
  const { id } = await params;

  try {
    const facility = await Facility.findById(id);
    console.log(facility);
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
  const { id } = await params; // params is already an object

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

    const { name, sport, description, thumbnail, convertible, otherSports, timeSlots, hotspot } = data;

    // Required fields
    if (!name || !sport || !description) {
      return NextResponse.json({ message: "Name, sport, and description are required" }, { status: 400 });
    }

    // Validate convertible
    const isConvertible = typeof convertible === "boolean" ? convertible : false;

    // Validate otherSports
    const validOtherSports =
      Array.isArray(otherSports) && otherSports.every((s) => typeof s === "string") ? otherSports : [];

    if (isConvertible && validOtherSports.length === 0) {
      return NextResponse.json({ message: "Convertible facilities must have otherSports" }, { status: 400 });
    }

    // Validate timeSlots
    let validTimeSlots: { start: number; end: number; price: number }[] = [];
    if (Array.isArray(timeSlots)) {
      validTimeSlots = timeSlots.map((slot, idx) => {
        const { start, end, price } = slot;
        if (
          start == null ||
          end == null ||
          price == null ||
          typeof start !== "number" ||
          typeof end !== "number" ||
          typeof price !== "number" ||
          start < 6 ||
          end > 23 ||
          start >= end ||
          price < 0
        ) {
          throw new Error(`Invalid time slot at index ${idx + 1}`);
        }
        return { start, end, price };
      });

      // Check for overlaps
      for (let i = 0; i < validTimeSlots.length; i++) {
        const a = validTimeSlots[i];
        for (let j = i + 1; j < validTimeSlots.length; j++) {
          const b = validTimeSlots[j];
          if (!(a.end <= b.start || a.start >= b.end)) {
            throw new Error(`Time slot ${i + 1} overlaps with slot ${j + 1}`);
          }
        }
      }
    } else {
      return NextResponse.json({ message: "timeSlots must be an array" }, { status: 400 });
    }

    // Update facility
    const updatedFacility = await Facility.findByIdAndUpdate(
      id,
      {
        name,
        sport,
        description,
        thumbnail: thumbnail || "",
        convertible: isConvertible,
        otherSports: isConvertible ? validOtherSports : [],
        timeSlots: validTimeSlots,
        hotspot,
      },
      { new: true },
    );

    if (!updatedFacility) {
      return NextResponse.json({ message: "Facility not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Facility updated successfully",
      facility: updatedFacility,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
