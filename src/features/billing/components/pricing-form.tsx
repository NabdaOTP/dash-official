"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { createCheckoutSession } from "@/features/billing/services/billing-service";
import { AmountPicker } from "./amount-picker";
import { CreditEstimator } from "./credit-estimator";
import { SandboxCard } from "./sandbox-banner"; 
import { CheckoutSummary } from "./checkout-summary";

const MIN_AMOUNT = 5;
const MAX_AMOUNT = 10000;

export function PricingForm() {
    const params = useParams();
    const projectId = params.projectId as string;

    const [selectedAmount, setSelectedAmount] = useState<number>(50);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [loading, setLoading] = useState(false);

    const finalAmount =
        customAmount.trim() !== "" ? parseFloat(customAmount) : selectedAmount;

    const handleSelectPreset = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount("");
    };

    const handleCustomChange = (value: string) => {
        if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
            setCustomAmount(value);
        }
    };

    const handleCheckout = async () => {
        if (isNaN(finalAmount) || finalAmount < MIN_AMOUNT) {
            toast.error(`Minimum amount is $${MIN_AMOUNT}`);
            return;
        }
        if (finalAmount > MAX_AMOUNT) {
            toast.error(`Maximum amount is $${MAX_AMOUNT.toLocaleString()}`);
            return;
        }
        setLoading(true);
        try {
            const session = await createCheckoutSession(projectId, finalAmount);
            if (session.url) {
                window.location.href = session.url;
            } else {
                toast.error("Failed to create checkout session");
                setLoading(false);
            }
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Checkout failed");
            setLoading(false);
        }
    };

    // Pass a safe number to the estimator (0 if invalid)
    const estimatorAmount =
        isNaN(finalAmount) || finalAmount < 0 ? 0 : finalAmount;

    return (
        <div className="max-w-3xl mx-auto px-6 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-foreground mb-2">
                    Add Credits
                </h1>
                <p className="text-sm text-muted-foreground">
                    Top up your project balance to send messages and use Nabda services
                </p>
            </div>

            <SandboxCard projectId={projectId} />

            <AmountPicker
                selectedAmount={selectedAmount}
                customAmount={customAmount}
                loading={loading}
                onSelectPreset={handleSelectPreset}
                onCustomChange={handleCustomChange}
            />

            <CreditEstimator amount={estimatorAmount} />

            <CheckoutSummary
                finalAmount={finalAmount}
                loading={loading}
                onCheckout={handleCheckout}
            />
        </div>
    );
}