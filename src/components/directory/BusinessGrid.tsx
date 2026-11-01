"use client";

import { useState } from "react";
import { BusinessCard, type BusinessCardData } from "./BusinessCard";
import { ClaimBusinessModal } from "./ClaimBusinessModal";
import { SearchX, PlusCircle } from "lucide-react";

interface BusinessGridProps {
  businesses: BusinessCardData[];
}

export function BusinessGrid({ businesses }: BusinessGridProps) {
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedBusiness, setSelectedBusiness] = useState<{ id: number; name: string } | null>(
    null
  );

  function handleClaimClick(id: number, name: string) {
    setSelectedBusiness({ id, name });
    setClaimModalOpen(true);
  }

  if (businesses.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 bg-white p-12 text-center my-6">
        <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-3">
          <SearchX className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-gray-900">لم يتم العثور على أنشطة تجارية مطابقة</h3>
        <p className="mt-1 text-xs text-gray-500 max-w-sm mx-auto">
          جرب تقليل معايير التقييم أو اختيار منطقة أخرى، أو كن أول من يضيف نشاطه في هذه المنطقة مجاناً.
        </p>
        <a
          href="https://wa.me/201007718787?text=%D9%85%D8%B1%D8%AD%D8%A8%D8%A7%D9%8B%D8%8C%20%D8%A3%D8%B1%D8%BA%D8%A8%20%D9%81%D9%8A%20%D8%A5%D8%B6%D8%A7%D9%81%D8%A9%20%D9%86%D8%B4%D8%A7%D8%B7%D9%8A%20%D8%A7%D9%84%D8%AA%D8%AC%D8%A7%D8%B1%D9%8A"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-emerald-700"
        >
          <PlusCircle className="w-4 h-4" />
          إضافة نشاط تجاري في هذه المنطقة
        </a>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {businesses.map((biz) => (
          <BusinessCard key={biz.id} business={biz} onClaimClick={handleClaimClick} />
        ))}
      </div>

      <ClaimBusinessModal
        isOpen={claimModalOpen}
        onClose={() => setClaimModalOpen(false)}
        businessId={selectedBusiness?.id ?? null}
        businessName={selectedBusiness?.name ?? ""}
      />
    </>
  );
}

