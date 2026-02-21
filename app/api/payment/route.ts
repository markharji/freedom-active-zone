// app/api/payment/route.ts
import { NextRequest, NextResponse } from "next/server";

const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;

const headers = {
  Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
  "Content-Type": "application/json",
};

async function callPayMongo(url: string, method: string, body?: any) {
  const res = await fetch(url, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    // PayMongo errors are usually in data.errors array
    const errorMsg = data?.errors?.map((e: any) => e.detail).join(", ") || data?.message || "PayMongo API error";

    throw new Error(errorMsg);
  }

  return data;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      transactionId,
      description,
      action,
      amount,
      currency,
      paymentIntentId,
      paymentMethod,
      phone,
      payment_method_allowed,
      dateRange = null,
    } = body;

    // -----------------------
    // 1. CREATE PAYMENT INTENT
    // -----------------------
    if (action === "create_intent") {
      const data = await callPayMongo("https://api.paymongo.com/v1/payment_intents", "POST", {
        data: {
          attributes: {
            amount,
            currency: currency || "PHP",
            payment_method_allowed: payment_method_allowed,
            description: description,
          },
        },
      });
      return NextResponse.json(data);
    }

    // -----------------------
    // 2. CONFIRM PAYMENT INTENT
    // -----------------------
    if (action === "confirm_payment") {
      if (!paymentIntentId) return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
      if (!paymentMethod) return NextResponse.json({ error: "paymentMethod required" }, { status: 400 });

      const confirmData = await callPayMongo(
        `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/confirm`,
        "POST",
        {
          data: {
            attributes: {
              payment_method_data: {
                type: paymentMethod,
                gcash: { phone }, // only needed for GCash
              },
            },
          },
        },
      );

      return NextResponse.json({
        paymentIntent: confirmData.data,
      });
    }

    if (action === "create_payment_method") {
      if (!paymentIntentId) return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });
      if (!paymentMethod) return NextResponse.json({ error: "paymentMethod required" }, { status: 400 });

      const confirmData = await callPayMongo(`https://api.paymongo.com/v1/payment_methods`, "POST", {
        data: {
          attributes: {
            type: paymentMethod,
          },
        },
      });

      const attachData = await callPayMongo(
        `https://api.paymongo.com/v1/payment_intents/${paymentIntentId}/attach`,
        "POST",
        {
          data: {
            attributes: {
              payment_method: confirmData.data.id,
              return_url: `http://localhost:3000/payment/${transactionId}`,
            },
          },
        },
      );

      return NextResponse.json({
        data: attachData.data,
      });
    }

    if (action === "get_intent") {
      if (!paymentIntentId) return NextResponse.json({ error: "paymentIntentId required" }, { status: 400 });

      const intentData = await callPayMongo(`https://api.paymongo.com/v1/payment_intents/${paymentIntentId}`, "GET");

      return NextResponse.json({
        paymentIntent: intentData.data,
      });
    }

    if (action === "get_all_payments") {
      let url = "https://api.paymongo.com/v1/payments?limit=100";
      if (dateRange) {
        // dateRange format: "2026-02-01..2026-02-20"
        url += `&created_at.between=${dateRange}`;
      }

      const headers = {
        Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
        accept: "application/json",
      };

      const options = {
        method: "GET",
        headers,
      };

      const payments = await fetch(url, options);

      const data = await payments.json();

      return NextResponse.json({
        payments: data,
      });
    }

    if (action === "get_metrics") {
      const url = `https://api.paymongo.com/v1/payments?limit=100`;

      const headers = {
        Authorization: `Basic ${Buffer.from(PAYMONGO_SECRET_KEY + ":").toString("base64")}`,
        Accept: "application/json",
      };

      const response = await fetch(url, { method: "GET", headers });

      const result = await response.json();
      const payments = result?.data || [];

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const currentMonthPayments = payments.filter((p: any) => {
        const createdAt = new Date(p.attributes.created_at * 1000);
        return createdAt.getMonth() === currentMonth && createdAt.getFullYear() === currentYear;
      });

      // Current month metrics
      const totalTransactionsCurrentMonth = currentMonthPayments.length;
      const totalRevenueCurrentMonth =
        currentMonthPayments.reduce((sum: number, p: any) => sum + p.attributes.amount, 0) / 100;

      // All-time metrics
      const totalTransactionsAllTime = payments.length;
      const totalRevenueAllTime = payments.reduce((sum: number, p: any) => sum + p.attributes.amount, 0) / 100;

      return NextResponse.json({
        metrics: {
          total_transactions_current_month: totalTransactionsCurrentMonth,
          total_revenue_current_month: totalRevenueCurrentMonth,
          total_transactions_all_time: totalTransactionsAllTime,
          total_revenue_all_time: totalRevenueAllTime,
        },
      });
    }
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}
