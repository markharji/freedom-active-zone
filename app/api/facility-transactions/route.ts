// app/api/facility-transactions/route.ts
import dbConnect from "@/lib/mongoose";
import FacilityTransaction from "@/models/FacilityTransaction";
import Facility from "@/models/Facility";
import { NextResponse } from "next/server";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    const transactionId = searchParams.get("transactionId");
    const facilityId = searchParams.get("facilityId");
    const status = searchParams.get("status");
    const dateStr = searchParams.get("date");
    const userName = searchParams.get("search"); // optional name search
    const sport = searchParams.get("sport"); // filter by sport

    const filter: any = {};

    if (transactionId) filter._id = transactionId;
    if (facilityId) filter.facility = facilityId;
    if (status) filter.status = status;
    if (userName) filter.userName = { $regex: userName, $options: "i" };
    if (dateStr) {
      const parsedDate = dayjs(dateStr, "DD-MM-YYYY");
      if (!parsedDate.isValid()) {
        return NextResponse.json({ message: "Invalid date format" }, { status: 400 });
      }
      filter.date = dateStr;
    }

    // Fetch all matching transactions
    let transactions = await FacilityTransaction.find(filter).populate({ path: "facility" }).lean();

    if (sport && sport !== "all") {
      // Filter transactions: match either facility.sport or convertedTo
      transactions = transactions.filter((t) => {
        const facilitySport = t.facility?.sport;
        const convertedSport = t.convertTo ? t.convertedTo : null;
        return convertedSport ? convertedSport === sport : facilitySport === sport;
      });
    }

    // Include convertedTo in the response explicitly (already in the schema)
    // No additional modification needed; it’s part of each transaction object

    return NextResponse.json(transactions);
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
export async function POST(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { facilityId, name, email, contact, date, startTime, endTime, price, convertTo, convertedTo } = data;

    // Basic required validation
    if (!facilityId || !email || !contact || !date || !startTime || !endTime || !price) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    // If convertTo is true, convertedTo must be provided
    if (convertTo && !convertedTo) {
      return NextResponse.json({ message: "Please select a sport to convert to" }, { status: 400 });
    }

    // Get facility
    const facility = await Facility.findById(facilityId);
    if (!facility) return NextResponse.json({ message: "Facility not found" }, { status: 404 });

    // --- Check for overlapping transactions ---
    const overlapping = await FacilityTransaction.findOne({
      facility: facilityId,
      date,
      $or: [
        {
          startTime: { $lte: startTime },
          endTime: { $gt: startTime },
        },
        {
          startTime: { $lt: endTime },
          endTime: { $gte: endTime },
        },
        {
          startTime: { $gte: startTime },
          endTime: { $lte: endTime },
        },
      ],
    });

    if (overlapping) {
      return NextResponse.json(
        { message: "Time slot overlaps with an existing booking. Please select a new time" },
        { status: 400 },
      );
    }

    // --- Create transaction ---
    const transaction = await FacilityTransaction.create({
      userEmail: email,
      userContact: contact,
      date,
      startTime,
      endTime,
      price,
      convertTo: !!convertTo,
      convertedTo: convertTo ? convertedTo : "",
      status: "pending",
      facility,
    });

    return NextResponse.json({ message: "Transaction created", transaction }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}

// ---------------------- PATCH ----------------------
export async function PATCH(req: Request) {
  await dbConnect();

  try {
    const data = await req.json();
    const { transactionId, status, convertTo, convertedTo } = data;

    if (!transactionId) {
      return NextResponse.json({ message: "Transaction ID is required" }, { status: 400 });
    }

    const allowedStatuses = ["pending", "confirmed", "cancelled"];
    if (status && !allowedStatuses.includes(status)) {
      return NextResponse.json({ message: "Invalid status" }, { status: 400 });
    }

    const transaction = await FacilityTransaction.findById(transactionId);
    if (!transaction) return NextResponse.json({ message: "Transaction not found" }, { status: 404 });

    // Update fields if provided
    if (status) transaction.status = status;
    if (typeof convertTo === "boolean") transaction.convertTo = convertTo;
    if (convertTo && convertedTo) transaction.convertedTo = convertedTo;

    await transaction.save();

    return NextResponse.json({ message: "Transaction updated", transaction });
  } catch (err) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
