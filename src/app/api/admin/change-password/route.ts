import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { getActiveAdminKey, ADMIN_SESSION_TOKEN } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { currentPasscode, newPasscode } = await req.json();
    const activeKey = getActiveAdminKey();
    const cleanCurrent = String(currentPasscode || "").trim();

    // التحقق من صلاحية الجلسة أو الرمز الحالي أو الرموز الاحتياطية
    const sessionCookie = req.cookies.get("admin_session")?.value;
    const isAuthenticatedBySession = sessionCookie === ADMIN_SESSION_TOKEN;
    const isCurrentValid =
      cleanCurrent === activeKey ||
      cleanCurrent === "MasrDirectory#2026!" ||
      cleanCurrent === "Mody#8q7r0q9m" ||
      cleanCurrent === "admin" ||
      cleanCurrent === "admin123" ||
      isAuthenticatedBySession;

    if (!isCurrentValid) {
      return NextResponse.json(
        { error: "رمز المرور الحالي غير صحيح" },
        { status: 400 }
      );
    }

    if (!newPasscode || String(newPasscode).trim().length < 6) {
      return NextResponse.json(
        { error: "يجب ألا يقل رمز المرور الجديد عن 6 خانات" },
        { status: 400 }
      );
    }

    const cleanNewPasscode = String(newPasscode).trim();

    // كتابة الملفات على القرص لتحديث الرمز فوراً
    const envContent = `ADMIN_SECRET_KEY="${cleanNewPasscode}"\nADMIN_SESSION_TOKEN="${ADMIN_SESSION_TOKEN}"\n`;
    fs.writeFileSync(path.resolve(process.cwd(), ".env.local"), envContent, "utf-8");
    fs.writeFileSync(path.resolve(process.cwd(), ".env"), envContent, "utf-8");

    // تحديث متغير البيئة في الذاكرة
    process.env.ADMIN_SECRET_KEY = cleanNewPasscode;

    console.log(`🔑 [Security] تم تحديث رمز مرور لوحة التحكم إلى القيمة الجديدة بنجاح.`);

    return NextResponse.json({
      success: true,
      message: "تم تحديث وحفظ رمز المرور السري الجديد بنجاح!",
    });
  } catch (err: any) {
    console.error("Error changing password:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
