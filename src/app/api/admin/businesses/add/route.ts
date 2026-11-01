import { NextRequest, NextResponse } from "next/server";
import { addBusinessDirectly } from "@/db/queries/businesses";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      nameAr,
      phone,
      whatsappNumber,
      address,
      categoryId,
      locationId,
      featuredTier,
      rating,
      description,
      workingHoursAr,
    } = body;

    if (!nameAr || !phone || !whatsappNumber || !address || !categoryId || !locationId) {
      return NextResponse.json(
        { error: "يرجى ملء كافة الحقول الإلزامية (الاسم، الهاتف، واتساب، العنوان، التصنيف، والمنطقة)" },
        { status: 400 }
      );
    }

    // تنظيف رقم الهاتف ورقم الواتساب
    let cleanPhone = phone.replace(/[^0-9]/g, "");
    let cleanWhatsapp = whatsappNumber.replace(/[^0-9]/g, "");
    if (cleanWhatsapp.startsWith("01")) {
      cleanWhatsapp = `20${cleanWhatsapp.slice(1)}`;
    }

    // توليد slug فريد
    const baseSlug = nameAr
      .toLowerCase()
      .replace(/[^a-z0-9\u0621-\u064A]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40);
    const slug = `${baseSlug || "biz"}-${Date.now().toString(36).slice(-4)}`;

    const newBiz = await addBusinessDirectly({
      nameAr: nameAr.trim(),
      slug,
      phone: cleanPhone,
      whatsappNumber: cleanWhatsapp,
      address: address.trim(),
      categoryId: Number(categoryId),
      locationId: Number(locationId),
      featuredTier: featuredTier || "free",
      rating: rating ? Number(rating) : 5.0,
      description: description ? description.trim() : "",
      workingHoursAr: workingHoursAr ? workingHoursAr.trim() : "يومياً من 9:00 ص حتى 10:00 م",
      verifiedStatus: true,
    });

    return NextResponse.json({ success: true, business: newBiz[0] });
  } catch (err: any) {
    console.error("Error adding business from admin:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

