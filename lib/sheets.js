import { google } from "googleapis";

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const key = (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n");
  return new google.auth.JWT(email, null, key, [
    "https://www.googleapis.com/auth/spreadsheets",
  ]);
}

function getClient() {
  return google.sheets({ version: "v4", auth: getAuth() });
}

// ชื่อระบบ/เครื่องจักร/เครื่องจักรย่อยใน Google Sheet มักเป็น merged cell
// ค่าจะว่างในทุกแถวยกเว้นแถวแรกของกลุ่ม ฟังก์ชันนี้ไล่เติมค่าจากแถวบนลงล่าง
function forwardFill(rows, columnIndexes) {
  const last = {};
  return rows.map((row) => {
    const filled = [...row];
    for (const idx of columnIndexes) {
      if (filled[idx] && String(filled[idx]).trim() !== "") {
        last[idx] = filled[idx];
      } else {
        filled[idx] = last[idx] || "";
      }
    }
    return filled;
  });
}

function normalize(str) {
  return String(str || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

// อ่านรายการเครื่องจักรทั้งหมดจากชีต1 (คอลัมน์ A-D)
export async function getEquipmentList() {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "ชีต1!A2:D2000",
  });
  const raw = (res.data.values || []).filter((r) => r.some((c) => c && String(c).trim() !== ""));
  const filled = forwardFill(raw, [0, 1, 2]);

  return filled.map((row, i) => {
    const [system, machine, subMachine, code] = row;
    const key = code && String(code).trim() !== "" ? String(code).trim() : `row-${i}`;
    return {
      key,
      system: system || "",
      machine: machine || "",
      subMachine: subMachine || "",
      code: code || "",
    };
  });
}

// อ่านประวัติ PM ทั้งหมดจาก PM_Log แล้วกรองเฉพาะของเครื่องที่ต้องการ
export async function getLogsForMachine(key) {
  const sheets = getClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: "PM_Log!A2:M5000",
  });
  const rows = res.data.values || [];
  const target = normalize(key);

  return rows
    .filter((r) => normalize(r[6]) === target || normalize(r[5]) === target)
    .map((r) => ({
      loggedAt: r[0] || "",
      cycle: r[1] || "",
      workerType: r[2] || "",
      workerName: r[3] || "",
      system: r[4] || "",
      machine: r[5] || "",
      code: r[6] || "",
      startDate: r[7] || "",
      startTime: r[8] || "",
      endTime: r[9] || "",
      details: r[10] || "",
      partsOrCause: r[11] || "",
      price: r[12] || "",
    }))
    .reverse();
}

// เพิ่มแถวใหม่เข้า PM_Log
export async function appendLog(entry) {
  const sheets = getClient();
  const now = new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" });
  const row = [
    now,
    entry.cycle || "",
    entry.workerType || "",
    entry.workerName || "",
    entry.system || "",
    entry.machine || "",
    entry.code || "",
    entry.startDate || "",
    entry.startTime || "",
    entry.endTime || "",
    entry.details || "",
    entry.partsOrCause || "",
    entry.price || "",
  ];
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: "PM_Log!A2:M2",
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}
