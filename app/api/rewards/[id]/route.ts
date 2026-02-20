// app/api/rewards/route.js
import dbConnect from "@/lib/mongoose";
import Reward from "@/models/Reward";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// PUT → update a reward (admin only)
export async function PUT(req, { params }) {
  await dbConnect();

  const { id } = await params; // <-- no need for await

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
    const { title, startDate, endDate, status, exclusions, discountValue, discountType } = data;

    if (!id) {
      return NextResponse.json({ message: "Reward ID is required" }, { status: 400 });
    }

    const reward = await Reward.findById(id);
    if (!reward) {
      return NextResponse.json({ message: "Reward not found" }, { status: 404 });
    }

    // Update only provided fields
    if (title !== undefined) reward.title = title;
    if (startDate !== undefined) reward.startDate = new Date(startDate);
    if (endDate !== undefined) reward.endDate = new Date(endDate);
    if (status !== undefined) reward.status = status;
    if (exclusions !== undefined) reward.exclusions = exclusions;
    if (discountValue !== undefined) reward.discountValue = discountValue;
    if (discountType !== undefined) reward.discountType = discountType;

    await reward.save();

    return NextResponse.json({ message: "Reward updated successfully", reward });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// DELETE → remove a reward (admin only)
export async function DELETE(req, { params }) {
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

  const { id } = await params;

  try {
    if (!id) {
      return NextResponse.json({ message: "Reward ID is required" }, { status: 400 });
    }

    const reward = await Reward.findById(id);
    if (!reward) {
      return NextResponse.json({ message: "Reward not found" }, { status: 404 });
    }

    await reward.deleteOne();

    return NextResponse.json({ message: "Reward deleted successfully" });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
