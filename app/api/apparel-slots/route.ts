import dbConnect from "@/lib/mongoose";
import ApparelTransaction from "@/models/ApparelTransaction";
import Apparel from "@/models/Apparel";
import { NextResponse } from "next/server";
import dayjs from "dayjs";

import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export async function GET(req: Request) {
  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);

    const apparelId = searchParams.get("apparelId");
    const dateStr = searchParams.get("date"); // DD-MM-YYYY

    if (!apparelId || !dateStr) {
      return NextResponse.json({ message: "apparelId and date are required" }, { status: 400 });
    }

    const apparel = await Apparel.findById(apparelId);
    if (!apparel) {
      return NextResponse.json({ message: "Apparel not found" }, { status: 404 });
    }

    const transactions = await ApparelTransaction.find({
      apparel: apparelId,
      date: dateStr,
      status: "pending",
    }).sort("startTime");

    console.log(transactions);

    const dayStart = dayjs(`${dateStr} 00:00`, "DD-MM-YYYY HH:mm");
    const dayEnd = dayjs(`${dateStr} 23:00`, "DD-MM-YYYY HH:mm");

    let cursor = dayStart;
    const freeSlots: { startTime: string; endTime: string }[] = [];

    for (const t of transactions) {
      console.log(`${dateStr} ${t.startTime}`);
      console.log(`${dateStr} ${t.endTime}`);

      const bookingStart = dayjs(`${dateStr} ${t.startTime}`, "DD-MM-YYYY HH:mm");
      const bookingEnd = dayjs(`${dateStr} ${t.endTime}`, "DD-MM-YYYY HH:mm");

      console.log(dateStr);
      console.log(bookingStart.format("DD-MM-YYYY HH:mm"));
      console.log(bookingEnd.format("DD-MM-YYYY HH:mm"));
      // Free slot BEFORE this booking
      if (cursor.isBefore(bookingStart)) {
        freeSlots.push({
          startTime: cursor.format("HH:mm"),
          endTime: bookingStart.format("HH:mm"),
        });
      }

      // Move cursor forward
      if (bookingEnd.isAfter(cursor)) {
        cursor = bookingEnd;
      }
    }

    // Free slot AFTER last booking
    if (cursor.isBefore(dayEnd)) {
      freeSlots.push({
        startTime: cursor.format("HH:mm"),
        endTime: dayEnd.format("HH:mm"),
      });
    }

    return NextResponse.json({
      date: dateStr,
      freeSlots,
    });
  } catch (err: any) {
    return NextResponse.json({ message: err.message }, { status: 500 });
  }
}
