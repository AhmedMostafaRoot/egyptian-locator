import { NextRequest, NextResponse } from "next/server";
import { approveBusinessClaim, rejectBusinessClaim } from "@/db/queries/businesses";

export async function POST(req: NextRequest) {
  try {
    const { claimId, action } = await req.json();

    if (!claimId || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "معرف الطلب أو الإجراء غير صحيح" },
        { status: 400 }
      );
    }

    if (action === "approve") {
      const result = await approveBusinessClaim(Number(claimId));
      return NextResponse.json({ success: true, message: "تمت الموافقة وتفعيل الترقية بنجاح!", result });
    } else {
      const result = await rejectBusinessClaim(Number(claimId));
      return NextResponse.json({ success: true, message: "تم رفض الطلب.", result });
    }
  } catch (err: any) {
    console.error("Error managing claim:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

