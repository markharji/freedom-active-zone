// app/api/apparel-transactions/route.ts
import dbConnect from "@/lib/mongoose";
import ApparelTransaction from "@/models/ApparelTransaction";
import Apparel from "@/models/Apparel";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export async function GET(req) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    const apparelId = searchParams.get("apparelId");
    const status = searchParams.get("status");
    const dateStr = searchParams.get("date"); // expected "DD-MM-YYYY"

    const filter: any = {};

    if (apparelId) filter.apparel = apparelId;
    if (status) filter.status = status;

    if (dateStr) {
      // Parse the string with DD-MM-YYYY format
      const parsedDate = dayjs(dateStr, "DD-MM-YYYY");
      if (!parsedDate.isValid()) {
        return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
      }

      filter.date = dateStr;
    }

    console.log(filter);

    const transactions = await ApparelTransaction.find(filter).populate("apparel");

    return NextResponse.json(transactions);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { apparelId, name, email, contact, date, startTime, endTime, price } = data;

    if (!apparelId || !name || !email || !contact || !date || !startTime || !endTime || !price) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // Get apparel
    const apparel = await Apparel.findById(apparelId);
    if (!apparel) return NextResponse.json({ message: "Apparel not found" }, { status: 404 });

    // --- Check for overlapping transactions ---
    // Convert startTime and endTime to numbers for comparison (HH:mm → minutes since midnight)
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);
    const newStart = startHour * 60 + startMinute;
    const newEnd = endHour * 60 + endMinute;

    const overlapping = await ApparelTransaction.findOne({
      apparel: apparelId,
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
    const transaction = await ApparelTransaction.create({
      userName: name,
      userEmail: email,
      userContact: contact,
      date,
      startTime,
      endTime,
      price,
      status: "pending",
      apparel,
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

    const transaction = await ApparelTransaction.findById(transactionId);
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
