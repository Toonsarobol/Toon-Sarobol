import { NextResponse } from "next/server";
import { getLogsForMachine, appendLog } from "../../../lib/sheets";

export async function GET(request) {
  const key = request.nextUrl.searchParams.get("key");
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 400 });
  try {
    const logs = await getLogsForMachine(key);
    return NextResponse.json({ logs });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(request) {
  const body = await request.json();
  if (!body.details || !body.details.trim()) {
    return NextResponse.json({ error: "กรุณากรอกรายละเอียด" }, { status: 400 });
  }
  try {
    await appendLog(body);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
