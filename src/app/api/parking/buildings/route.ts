import { NextResponse } from "next/server";
import { listBuildings } from "@/lib/parking/buildings-store";

export async function GET() {
  const buildings = listBuildings();
  return NextResponse.json({ data: buildings });
}
