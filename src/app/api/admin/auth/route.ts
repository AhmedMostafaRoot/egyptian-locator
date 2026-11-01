import { NextRequest, NextResponse } from "next/server";
import { getActiveAdminKey, ADMIN_SESSION_TOKEN } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { passcode } = await req.json();
    const activeKey = getActiveAdminKey();
    const cleanSubmitted = String(passcode || "").trim();

    // قبول الرمز الحالي أو الرمز الافتراضي MasrDirectory#2026! أو Mody#8q7r0q9m لضمان عدم إغلاق الوصول
    const isValid =
      cleanSubmitted === activeKey ||
      cleanSubmitted === "MasrDirectory#2026!" ||
      cleanSubmitted === "Mody#8q7r0q9m";

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "رمز المرور السري غير صحيح، يرجى المحاولة مرة أخرى." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true, message: "تم تسجيل الدخول بنجاح" });

    const isHttps = req.nextUrl.protocol === "https:";
    response.cookies.set("admin_session", ADMIN_SESSION_TOKEN, {
      httpOnly: true,
      secure: isHttps,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, error: "خطأ في معالجة الطلب" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true, message: "تم تسجيل الخروج بنجاح" });

  response.cookies.set("admin_session", "", {
    httpOnly: true,
    maxAge: 0,
    path: "/",
  });

  return response;
}
