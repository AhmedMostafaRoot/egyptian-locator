import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_VALUE = process.env.ADMIN_SESSION_TOKEN || "egypt_local_dir_admin_authenticated_token_2026";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. حماية صفحات لوحة التحكم /admin (مع استثناء صفحة تسجيل الدخول)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie || sessionCookie !== SESSION_VALUE) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 2. حماية واجهات برمجة التطبيقات للأدمن (مع استثناء واجهة المصادقة)
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/auth") {
    const sessionCookie = request.cookies.get("admin_session")?.value;
    if (!sessionCookie || sessionCookie !== SESSION_VALUE) {
      return NextResponse.json(
        { error: "غير مصرح بالدخول. يرجى تسجيل الدخول كمسؤول أولاً." },
        { status: 401 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};

