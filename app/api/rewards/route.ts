// app/api/rewards/route.js
import dbConnect from "@/lib/mongoose";
import Reward from "@/models/Reward";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined");
}

// GET → list all rewards
export async function GET(req: Request) {
  await dbConnect();

  const { searchParams } = new URL(req.url);

  const status = searchParams.get("status");
  const title = searchParams.get("title");
  const selectedDate = searchParams.get("selectedDate"); // single selected date

  const filter: any = {};

  if (status && status !== "all") filter.status = status;
  if (title) filter.title = { $regex: title, $options: "i" };

  // If a single date is selected, find rewards that include it
  if (selectedDate) {
    const date = new Date(selectedDate);
    filter.startDate = { $lte: date };
    filter.endDate = { $gte: date };
  }

  try {
    const rewards = await Reward.find(filter).sort({ startDate: -1 });
    return NextResponse.json(rewards);
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// POST → create a new reward (admin only)
export async function POST(req: Request) {
  await dbConnect();

  // --- Auth check ---
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

    const {
      title,
      startDate,
      endDate,
      status = "inactive",
      exclusions = [],
      discountValue,
      discountType = "percentage",
    } = data;

    // --- Validation ---
    if (!title || !startDate || !endDate) {
      return NextResponse.json({ message: "Title, start date, and end date are required" }, { status: 400 });
    }

    if (discountValue !== undefined && isNaN(Number(discountValue))) {
      return NextResponse.json({ message: "Discount value must be a number" }, { status: 400 });
    }

    if (discountType && !["percentage", "amount"].includes(discountType)) {
      return NextResponse.json({ message: "Discount type must be 'percentage' or 'amount'" }, { status: 400 });
    }

    // --- Create Reward ---
    const reward = await Reward.create({
      title,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      status,
      exclusions,
      discountValue: discountValue !== undefined ? Number(discountValue) : undefined,
      discountType,
    });

    return NextResponse.json({ message: "Reward created successfully", reward }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
