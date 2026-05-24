"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { Plus, Loader2 } from "lucide-react";
import { getProjectBalance } from "@/features/billing/services/billing-service";

export function BalanceWidget() {
  const params = useParams();
  const router = useRouter();
  const locale = useLocale();
  const projectId = params.projectId as string;

  const [balance, setBalance] = useState<number | null>(null);
  const [currency, setCurrency] = useState("USD");
  const [loading, setLoading] = useState(true);

  const fetchBalance = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await getProjectBalance(projectId);
      setBalance(data.balance);
      setCurrency(data.currency ?? "USD");
    } catch {
      // ⚠️ Endpoint currently returns 500 — show 0 until backend is fixed
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    (async () => {
      await fetchBalance();
    })()
  }, [fetchBalance]);




  const handleAddCredits = () => {
    router.push(`/${locale}/projects/${projectId}/pricing`);
  };

  return (
    <div className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-[10.5px] text-muted-foreground mb-0.5">Balance</p>
        {loading ? (
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
        ) : (
          <p className="text-[15px] font-semibold text-foreground truncate">
            {currency} {balance?.toLocaleString() ?? "0"}
          </p>
        )}
      </div>
      <button
        onClick={handleAddCredits}
        className="w-7 h-7 rounded-full bg-[#7C3AED] hover:bg-[#6D28D9] flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-2"
        aria-label="Add credits"
      >
        <Plus size={14} className="text-white" />
      </button>
    </div>
  );
}