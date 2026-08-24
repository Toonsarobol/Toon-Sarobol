# ระบบบันทึกประวัติเครื่องจักร

เว็บนี้อ่าน/เขียนข้อมูลจาก Google Sheet ของคุณโดยตรง ไม่มีฐานข้อมูลแยก

## วิธีขึ้นเว็บ (ทำตามลำดับ)

### 1. อัปโค้ดขึ้น GitHub
1. สมัคร github.com (ฟรี)
2. กด "New repository" ตั้งชื่อ เช่น `pm-machine-website` เลือก Private ก็ได้
3. ในหน้า repo กด "uploading an existing file" แล้วลากไฟล์/โฟลเดอร์ทั้งหมดนี้ขึ้นไป (ยกเว้นไฟล์ `.env.local` ถ้ามี — ไฟล์นี้ห้ามอัปโหลด)
4. กด Commit changes

### 2. เชื่อม Vercel
1. สมัคร vercel.com ด้วยบัญชี GitHub เดียวกัน (ฟรี)
2. กด "Add New" → "Project" เลือก repo ที่เพิ่งอัปโหลด
3. ก่อนกด Deploy ให้เปิดส่วน "Environment Variables" แล้วใส่ 4 ตัวนี้ (ดูค่าได้จากไฟล์ JSON ของ Service Account และจาก URL ของ Google Sheet):

   - `GOOGLE_SERVICE_ACCOUNT_EMAIL` — อีเมลจากไฟล์ JSON (field: `client_email`)
   - `GOOGLE_PRIVATE_KEY` — ค่าจาก field `private_key` ในไฟล์ JSON (คัดลอกทั้งหมดรวมเครื่องหมายคำพูด)
   - `GOOGLE_SHEET_ID` — `1zQ9vsjDsCtC_ZhaYi_bTBgEoqFXqnjYogco61XpqiaE`
   - `TEAM_PASSWORD` — ตั้งรหัสผ่านให้ทีมงานใช้ล็อกอิน เช่น `TIJ2026pm`

4. กด Deploy รอประมาณ 1-2 นาที จะได้ URL เช่น `pm-machine-website.vercel.app`

### 3. เช็คว่าเชื่อม Sheet สำเร็จ
เปิดเว็บที่ได้ ล็อกอินด้วย TEAM_PASSWORD ที่ตั้งไว้ ถ้าเห็นรายการเครื่องจักรแสดงว่าเชื่อมสำเร็จ

หากขึ้นข้อความ "ดึงข้อมูลจาก Google Sheet ไม่สำเร็จ" ให้เช็ค:
- แชร์ Sheet ให้อีเมลของ Service Account เป็น Editor แล้วหรือยัง
- ชื่อแท็บใน Sheet ตรงกับ `ชีต1` และ `PM_Log` หรือไม่ (ถ้าตั้งชื่อแท็บไม่ตรง ต้องแก้ในไฟล์ `lib/sheets.js`)
- ค่า `GOOGLE_PRIVATE_KEY` ใน Vercel ครบถ้วนไม่ตกหล่นบรรทัด

## แก้ไขเว็บภายหลัง
แก้โค้ดในเครื่อง หรือแก้ตรงๆ บน GitHub ได้เลย (กดไอคอนดินสอที่ไฟล์) ทุกครั้งที่ save ขึ้น GitHub, Vercel จะ build เว็บใหม่ให้อัตโนมัติ
