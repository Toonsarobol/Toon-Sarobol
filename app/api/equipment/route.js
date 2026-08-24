import { NextResponse } from "next/server";
import { getEquipmentList } from "../../../lib/sheets";

export async function GET() {
  try {
    const equipment = await getEquipmentList();
    return NextResponse.json({ equipment });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
