import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function GET(req) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    return NextResponse.json({
      loggedIn: true,
      user: {
        id: decoded.id,
        username: decoded.username,
      },
    });
  } catch (err) {
    return NextResponse.json({ loggedIn: false }, { status: 401 });
  }
}
