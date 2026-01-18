import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export async function POST(req) {
  await dbConnect();
  const { username, password } = await req.json();

  if (!username || !password) return NextResponse.json({ message: "Missing credentials" }, { status: 400 });

  const user = await User.findOne({ username });
  if (!user) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });

  const token = jwt.sign({ id: user._id, username: user.username }, JWT_SECRET, { expiresIn: "1d" });

  const response = NextResponse.json({
    message: "Login successful",
    user: { id: user._id, username: user.username, token },
  });

  response.cookies.set("token", token, {
    httpOnly: true,
    path: "/",
    maxAge: 60 * 60 * 24,
  });

  return response;
}
