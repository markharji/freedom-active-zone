import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

/* GET: list users (without password) */
export async function GET() {
  await dbConnect();
  const users = await User.find().select("-password");
  return NextResponse.json(users);
}

/* PUT: create user */
export async function PUT(req) {
  await dbConnect();
  const { name, username, password } = await req.json();

  if (!username || !password)
    return NextResponse.json({ message: "Username and password are required" }, { status: 400 });

  const existingUser = await User.findOne({ username });
  if (existingUser) return NextResponse.json({ message: "Username already exists" }, { status: 409 });

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await User.create({ name, username, password: hashedPassword });

  return NextResponse.json(
    {
      message: "User created successfully",
      user: { id: user._id, name: user.name, username: user.username },
    },
    { status: 201 },
  );
}
