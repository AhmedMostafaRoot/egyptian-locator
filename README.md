# 🇪🇬 دليل مصر المحلي (Egypt Local Business Directory)

منصة رقمية برمجية متكاملة لدليل الأنشطة والخدمات التجارية في محافظات مصر الـ 27، مبنية بأحدث معايير **Next.js 14 (App Router)** مع صفحات سيو مبرمجة تلقائياً (**Programmatic SEO**)، وتكامل مباشر وسريع عبر **واتساب**، ومحرك زحف آلي بمتصفح **Chromium** الخفي، ولوحة تحكم للمسؤول (**Admin Dashboard**) لإدارة الأنشطة والطلبات بضغطة زر.

---

## 📌 مسار التطبيق في النظام (Application Path):
```bash
/home/mr-root/.gemini/antigravity/scratch/egypt-local-directory
```

---

## 🚀 التقنيات المستخدمة (Tech Stack)

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server-Side Rendering, Server Actions, Dynamic Rewrites)
- **Styling**: [Tailwind CSS 3.4](https://tailwindcss.com/) (RTL Layout, Custom Arabic Typography with Google Cairo Font)
- **Database & ORM**: SQLite (`local.db`) مع [Drizzle ORM](https://orm.drizzle.team/)
- **Scraping Engine**: [Puppeteer Core](https://pptr.dev/) مع Google Chrome في وضع Headless لاستخراج الأنشطة العامة
- **Automation / Cron**: سكريبتات Node.js لفحص نشاط أرقام واتساب المصرية تلقائياً
- **Icons**: [Lucide React](https://lucide.dev/)
- **Security**: نظام مصادقة محمي بـ HttpOnly Cookies وتشفير الجلسات وحماية الـ Middleware لصفحات `/admin`

---

## ✨ المميزات الرئيسية للمنصة

1. **دعم كامل لكافة محافظات مصر الـ 27**:
   - تغطية شاملة لجميع المحافظات: القاهرة، الجيزة، الإسكندرية، الدقهلية (المنصورة)، الشرقية، الغربية، القليوبية، المنوفية، دمياط، بورسعيد، السويس، البحر الأحمر (الغردقة)، جنوب سيناء (شرم الشيخ)، مطروح، الصعيد، والقناة.

2. **صفحات سيو مبرمجة ديناميكياً (Programmatic SEO)**:
   - مسارات سيو تلقائية بالعربية للمحافظات والأحياء: `/[city]/[district]/[category]`
   - بيانات وصفية ديناميكية (`generateMetadata`) بالعربية لكل تصنيف ومنطقة لرفع الترتيب في محرك بحث Google.
   - كود Schema.org بصيغة `LocalBusiness JSON-LD` في صفحات الأنشطة الفردية (`/b/[slug]`).

3. **لوحة تحكم إدارية احترافية (`/admin`)**:
   - **مركز تشغيل واستخراج بيانات الـ 27 محافظة**: قائمة منسدلة لاختيار أي محافظة وتشغيل زاحف Chromium بنقرة زر واحدة.
   - **قائمة مراجعة الأنشطة المستخرجة (Staged Review Queue)**: فحص الأنشطة المسحوبة قبل اعتمادها، مع زر اعتماد فردي لكل نشاط أو زر دمج واعتماد شامل للجميع.
   - **إدارة طلبات توثيق الأنشطة وترقية الباقات**: قبول أو رفض طلبات العملاء بضغطة زر مع تفعيل شارة النخبة (Elite 👑) أو شارة التوثيق (Pro) فوراً.
   - **جدول إدارة الأنشطة مع الترقيم والبحث (Pagination)**: بحث فوري بالاسم أو الهاتف أو الحي مع تصفح متدرج للصفحات.
   - **نافذة أوامر طرفية حية (Live Terminal Console)**: متابعة سجل تنفيذ مهام الـ NPM وزمن التنفيذ بالميللي ثانية.
   - **مودال إضافة نشاط جديد يدوياً** و **مودال تغيير رمز المرور السري**.

4. **فحص نشاط أرقام واتساب الآلي (WhatsApp Verification Cron)**:
   - سكريبت يتحقق من استقبال رقم واتساب للمحادثات، وإلغاء توثيق أي رقم معطل، وحفظ السجلات التفصيلية في ملف JSON.

5. **تواصل واتساب مباشر وسريع**:
   - زر واتساب عائم يربط العميل فوراً بإدارة الدليل على الرقم: `01007718787`.
   - زر "أضف نشاطك مجاناً" وزر طلب التوثيق بالفوتر مجهزان بروابط واتساب مع نصوص مرسلة مسبقاً.

---

## 📂 هيكل المجلدات (Project Directory Structure)

```
egypt-local-directory/
├── src/
│   ├── app/
│   │   ├── [city]/[district]/[category]/page.tsx  # صفحات السيو المبرمجة
│   │   ├── b/[slug]/page.tsx                     # صفحة تفاصيل النشاط مع Schema.org
│   │   ├── admin/
│   │   │   ├── page.tsx                          # لوحة التحكم التفاعلية
│   │   │   └── login/page.tsx                    # صفحة تسجيل دخول المسؤول
│   │   ├── api/
│   │   │   ├── admin/auth/route.ts               # تسجيل الدخول والخروج
│   │   │   ├── admin/change-password/route.ts    # تغيير رمز المرور
│   │   │   ├── admin/commands/route.ts           # تشغيل مهام السكرابر و NPM
│   │   │   ├── admin/claims/manage/route.ts      # قبول ورفض ترقيات العملاء
│   │   │   ├── admin/staged/manage/route.ts      # اعتماد الأنشطة المستخرجة
│   │   │   └── claim-business/route.ts           # تقديم طلب التوثيق من العميل
│   │   ├── layout.tsx                            # التصميم العام وخط Cairo والرقم العائم
│   │   ├── page.tsx                              # الصفحة الرئيسية للموقع
│   │   └── globals.css                           # إعدادات Tailwind CSS والاتجاه RTL
│   ├── components/
│   │   ├── directory/                            # كروت الأنشطة، المودالات، أشرطة الفلترة
│   │   └── layout/                               # الهيدر والفوتر المتجاوبين
│   ├── db/
│   │   ├── schema.ts                             # جداول SQLite (الأنشطة، المحافظات، الطلبات)
│   │   ├── index.ts                              # تهيئة Drizzle ORM
│   │   └── seed.ts                               # التغذية الأولية لقاعدة البيانات
│   ├── lib/
│   │   └── auth.ts                               # دوال إدارة مفاتيح الجلسة
│   └── data/                                     # ملفات السكرابينج وسجلات واتساب المؤقتة
├── scripts/
│   ├── scrape-businesses.ts                      # محرك زاحف Chromium لكافة المحافظات
│   ├── import-scraped-data.ts                    # استيراد البيانات المستخرجة لقاعدة البيانات
│   ├── verify-whatsapp-links.ts                  # الفحص الآلي لأرقام واتساب
│   └── seed-all-egypt-governorates.ts            # تغذية المحافظات الـ 27
├── public/                                       # الصور والأيقونات
├── .env.example                                  # نموذج متغيرات البيئة
├── package.json
└── README.md
```

---

## 🛠️ التثبيت والتشغيل المحلي (Setup & Installation)

### 1. تثبيت الحزم:
```bash
cd /home/mr-root/.gemini/antigravity/scratch/egypt-local-directory
npm install
```

### 2. إعداد ملف البيئة:
قم بإنشاء ملف `.env.local` أو انسخ الملف النموذجي:
```bash
cp .env.example .env.local
```

### 3. تهيئة وتغذية قاعدة البيانات:
```bash
npm run db:seed
```

### 4. تشغيل خادم التطوير:
```bash
npm run dev
```
افتح المتصفح على: `http://localhost:3000`

### 5. بناء وتشغيل نسخة الإنتاج السريعة:
```bash
npm run build
npm run start
```

---

## 🔐 بيانات الدخول للوحة التحكم (`/admin`):

- **رابط اللوحة**: `http://localhost:3000/admin`
- **رمز المرور الافتراضي**: `MasrDirectory#2026!`
- *(يمكنك تغيير الرمز في أي وقت مباشرة من زر "تغيير الرمز" أعلى اللوحة)*

---

## 📤 كيفية رفع المشروع إلى مستودع خاص على GitHub (Private Git Repository):

### الخطوة 1: تهيئة الـ Commit الأخير:
```bash
cd /home/mr-root/.gemini/antigravity/scratch/egypt-local-directory
git add .
git commit -m "feat: complete Egyptian programmatic local directory with 27 governorates and admin dashboard"
```

### الخطوة 2: إنشاء مستودع خاص جديد على GitHub:
1. توجه إلى [GitHub New Repository](https://github.com/new).
2. اختر اسماً للمستودع (مثلاً: `egypt-local-directory`).
3. اختر نوع المستودع: **Private**.
4. اضغط على **Create repository** دون تحديد خيار إنشاء README.

### الخطوة 3: ربط المستودع ورفع الكود (Push):
انسخ رابط المستودع الخاص بك ونفذ الأمرين التاليين:
```bash
# تسمية الفرع الرئيسي main
git branch -M main

# إضافة رابط مستودعك الخاص (استبدل YOUR_USERNAME و YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/egypt-local-directory.git

# رفع الكود بالكامل
git push -u origin main
```

*(إذا كان المستودع موجوداً بالفعل وترغب بتغيير رابطه):*
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/egypt-local-directory.git
git push -u origin main
```

---

## 📜 رخصة الاستخدام (License)

هذا المشروع مخصص للأعمال والأنشطة المحلية في مصر، ومرخص بموجب رخصة **MIT**.

