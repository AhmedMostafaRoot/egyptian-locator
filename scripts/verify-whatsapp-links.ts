import puppeteer, { Browser } from "puppeteer-core";
import fs from "fs";
import path from "path";
import { db } from "../src/db";
import { businesses } from "../src/db/schema";
import { eq } from "drizzle-orm";

interface VerificationResult {
  businessId: number;
  businessName: string;
  phone: string;
  whatsappNumber: string;
  whatsappUrl: string;
  isActive: boolean;
  httpStatus: number | null;
  statusReason: string;
  timestamp: string;
}

/**
 * التحقق من قواعد أرقام الهواتف المحمولة في مصر
 * يجب أن يبدأ بـ 2010 (فودافون)، 2011 (إتصالات)، 2012 (أورنج)، 2015 (وي) ويتكون من 12 رقماً
 */
function isValidEgyptianWhatsAppNumber(num: string): boolean {
  const clean = num.replace(/[^0-9]/g, "");
  const regex = /^201[0125][0-9]{8}$/;
  return regex.test(clean);
}

export async function runWhatsAppVerification(): Promise<VerificationResult[]> {
  console.log("⏰ [Cron Task] بدء تشغيل مهمة التحقق الآلي من أرقام واتساب للأعمال المسجلة...");

  const allBusinesses = await db
    .select({
      id: businesses.id,
      nameAr: businesses.nameAr,
      phone: businesses.phone,
      whatsappNumber: businesses.whatsappNumber,
      verifiedStatus: businesses.verifiedStatus,
    })
    .from(businesses);

  console.log(`📋 إجمالي الأنشطة التجارية المطلوب فحصها: ${allBusinesses.length}`);

  const browser: Browser = await puppeteer.launch({
    executablePath: "/usr/bin/google-chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--headless=new",
      "--lang=ar,en-US;q=0.9,en;q=0.8",
    ],
  });

  const results: VerificationResult[] = [];
  let activeCount = 0;
  let inactiveCount = 0;

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    for (const biz of allBusinesses) {
      const cleanNumber = biz.whatsappNumber.replace(/[^0-9]/g, "");
      const whatsappUrl = `https://api.whatsapp.com/send?phone=${cleanNumber}`;

      let isActive = false;
      let reason = "";
      let httpStatus: number | null = null;

      // 1. الفحص المبدئي لصحة الرقم المصري
      if (!isValidEgyptianWhatsAppNumber(cleanNumber)) {
        isActive = false;
        reason = "رقم هاتف غير متوافق مع شبكات المحمول المصرية (يجب أن يبدأ بـ 2010 أو 2011 أو 2012 أو 2015)";
      } else {
        // 2. زيارة رابط واتساب الرسمي عبر متصفح Chromium الخفي
        try {
          const response = await page.goto(whatsappUrl, {
            waitUntil: "domcontentloaded",
            timeout: 15000,
          });

          httpStatus = response ? response.status() : null;

          if (httpStatus === 200) {
            // فحص محتوى الصفحة للتأكد من جاهزية الدردشة
            const pageText = await page.evaluate(() => document.body.innerText || "");

            const hasChatIntent =
              pageText.includes("Chat on WhatsApp") ||
              pageText.includes("الدردشة على واتساب") ||
              pageText.includes("Continue to Chat") ||
              pageText.includes("متابعة إلى الدردشة") ||
              pageText.includes(cleanNumber.slice(-8));

            if (hasChatIntent) {
              isActive = true;
              reason = "الرابط نشط ويستقبل محادثات واتساب بنجاح";
            } else {
              isActive = false;
              reason = "استجابت صفحة واتساب ولكن تعذر التحقق من واجهة الدردشة المباشرة";
            }
          } else {
            isActive = false;
            reason = `خطأ في استجابة خادم واتساب (HTTP ${httpStatus})`;
          }
        } catch (err: any) {
          isActive = false;
          reason = `مهلة الاتصال انتهت أو تعذر الوصول للخادم: ${err.message}`;
        }
      }

      // 3. تحديث حالة النشاط في قاعدة بيانات SQLite تلقائياً
      if (!isActive) {
        inactiveCount++;
        await db
          .update(businesses)
          .set({ verifiedStatus: false })
          .where(eq(businesses.id, biz.id));
        console.warn(`  ⚠️ [غير نشط]: تم إلغاء توثيق "${biz.nameAr}" (السبب: ${reason})`);
      } else {
        activeCount++;
        await db
          .update(businesses)
          .set({ verifiedStatus: true })
          .where(eq(businesses.id, biz.id));
        console.log(`  ✓ [نشط ومعتمد]: "${biz.nameAr}" - هاتف: ${biz.whatsappNumber}`);
      }

      results.push({
        businessId: biz.id,
        businessName: biz.nameAr,
        phone: biz.phone,
        whatsappNumber: biz.whatsappNumber,
        whatsappUrl,
        isActive,
        httpStatus,
        statusReason: reason,
        timestamp: new Date().toISOString(),
      });

      // مهلة لطيفة لتجنب حظر المعدل (Rate-limiting)
      await new Promise((r) => setTimeout(r, 600));
    }

    // حفظ سجل التقرير
    const logPath = path.resolve(process.cwd(), "src/data/whatsapp_verification_log.json");
    fs.writeFileSync(logPath, JSON.stringify(results, null, 2), "utf-8");

    console.log("\n=======================================================");
    console.log(`🏁 اكتمل فحص التحقق الآلي:`);
    console.log(`   - إجمالي الأنشطة: ${allBusinesses.length}`);
    console.log(`   - الأنشطة النشطة المعتمدة: ${activeCount}`);
    console.log(`   - الأنشطة غير النشطة المحددة: ${inactiveCount}`);
    console.log(`   - تم حفظ السجل في: ${logPath}`);
    console.log("=======================================================\n");
  } finally {
    await browser.close();
  }

  return results;
}

// تنفيذ السكريبت عند استدعائه من سطر الأوامر أو كـ Cron Job
if (require.main === module) {
  runWhatsAppVerification().catch((err) => {
    console.error("❌ خطأ أثناء تشغيل الفحص الدوري:", err);
    process.exit(1);
  });
}

