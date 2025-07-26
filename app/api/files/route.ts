import fs from "fs";
import path from "path";

import { NextResponse } from "next/server";

export async function GET() {
  try {
    const inputDir = path.join(process.cwd(), "input-txt");
    const files = fs
      .readdirSync(inputDir)
      .filter((file) => file.endsWith(".txt"))
      .map((file) => ({
        key: file,
        label: file,
      }));

    return NextResponse.json({ files });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to read files" },
      { status: 500 },
    );
  }
}
