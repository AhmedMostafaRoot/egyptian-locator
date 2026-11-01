import { NextRequest, NextResponse } from "next/server";
import { createBusinessClaim } from "@/db/queries/businesses";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessId, claimantName, claimantPhone, nationalIdOrCr, requestedTier, notes } = body;

    if (!businessId || !claimantName || !claimantPhone) {
      return NextResponse.json(
        { error: "جميع الحقول الإلزامية مطلوبة (الاسم، رقم الهاتف، ومعرف النشاط)" },
        { status: 400 }
      );
    }

    // التحقق من رقم الموبايل المصري
    const egyptRegex = /^01[0125][0-9]{8}$/;
    if (!egyptRegex.test(claimantPhone)) {
      return NextResponse.json(
        { error: "يرجى إدخال رقم هاتف محمول مصري صحيح" },
        { status: 400 }
      );
    }

    const inserted = await createBusinessClaim({
      businessId: Number(businessId),
      claimantName: String(claimantName).trim(),
      claimantPhone: String(claimantPhone).trim(),
      nationalIdOrCr: nationalIdOrCr ? String(nationalIdOrCr).trim() : undefined,
      requestedTier: requestedTier || "claim_ownership",
      notes: notes ? String(notes).trim() : undefined,
    });

    return NextResponse.json({ success: true, claim: inserted[0] });
  } catch (err: any) {
    console.error("API Error claiming business:", err);
    return NextResponse.json(
      { error: "حدث خطأ بالخادم أثناء تسجيل الطلب" },
      { status: 500 }
    );
  }
}

