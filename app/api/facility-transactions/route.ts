// app/api/facility-transactions/route.ts
import dbConnect from "@/lib/mongoose";
import FacilityTransaction from "@/models/FacilityTransaction";
import Facility from "@/models/Facility";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    const transactionId = searchParams.get("transactionId");
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status");
    const dateStr = searchParams.get("date"); // expected "DD-MM-YYYY"

    const filter: any = {};

    if (transactionId) filter._id = transactionId;
    if (facilityId) filter.facility = facilityId;
    if (status) filter.status = status;

    if (dateStr) {
      // Parse the string with DD-MM-YYYY format
      const parsedDate = dayjs(dateStr, "DD-MM-YYYY");
      if (!parsedDate.isValid()) {
        return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
      }

      filter.date = dateStr;
    }

    const transactions = await FacilityTransaction.find(filter).populate("facility");

    return NextResponse.json(transactions);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { facilityId, name, email, contact, date, startTime, endTime, price } = data;

    if (!facilityId || !name || !email || !contact || !date || !startTime || !endTime || !price) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Get facility
    const facility = await Facility.findById(facilityId);
    if (!facility) return NextResponse.json({ message: "Facility not found" }, { status: 404 });

    // --- Check for overlapping transactions ---
    // Convert startTime and endTime to numbers for comparison (HH:mm → minutes since midnight)
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const newStart = startHour * 60 + startMinute;
    const newEnd = endHour * 60 + endMinute;

    const overlapping = await FacilityTransaction.findOne({
      facility: facilityId,
      date,
      $or: [
        {
          // New start is during existing booking
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          // New end is during existing booking
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          // New booking completely covers existing booking
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        { message: "Time slot overlaps with an existing booking. Please select a new Date" },
        { status: 400 },
      );
    }

    // --- Create transaction ---
    const transaction = await FacilityTransaction.create({
      userName: name,
      userEmail: email,
      userContact: contact,
      date,
      startTime,
      endTime,
      price: price,
      status: "pending",
      facility,
    });

    return NextResponse.json({ message: "Transaction created", transaction }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// PATCH → update transaction status
export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { transactionId, status } = data;

    if (!transactionId || !status) {
      return NextResponse.json({ message: "Transaction ID and status are required" }, { status: 400 });
    }

    // Only allow certain status updates
    const allowedStatuses = ["pending", "confirmed", "cancelled"];
    if (!allowedStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const transaction = await FacilityTransaction.findById(transactionId);
    if (!transaction) {
      return NextResponse.json({ message: "Transaction not found" }, { status: 404 });
    }

    transaction.status = status;
    await transaction.save();

    return NextResponse.json({ message: `Transaction status updated to ${status}`, transaction });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
