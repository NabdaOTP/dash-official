"use client";

import { Link } from "@/i18n/navigation";
import {
    AlertCircle,
    ArrowRight,
    FileText,
    Loader2,
    MessageCircle,
    RefreshCw,
    Send,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

import type { SendResult } from "@/features/send-otp/types";
import { getTemplates } from "@/features/templates/services/template-service";
import type { MessageTemplate } from "@/features/templates/types";
import { getWabaStatus } from "@/features/waba/services/waba-service";
import type { WabaPhoneNumber } from "@/features/waba/types";

import { ResultCard } from "./result-card";
import { SendOtpForm } from "./send-otp-form";
import { VerifyOtpForm } from "./verify-otp-form";

type PrereqStatus = "loading" | "ready" | "no-waba" | "no-template" | "error";

export function SendOtpPage() {
    const params = useParams();
    const projectId = params?.projectId as string;

    const [prereqStatus, setPrereqStatus] = useState<PrereqStatus>("loading");
    const [phoneNumbers, setPhoneNumbers] = useState<WabaPhoneNumber[]>([]);
    const [lastResult, setLastResult] = useState<SendResult | null>(null);
    const [apiKeyUsed, setApiKeyUsed] = useState("");

    const checkPrereqs = useCallback(async () => {
        if (!projectId) return;
        setPrereqStatus("loading");
        try {
            const [status, templates] = await Promise.all([
                getWabaStatus(projectId),
                getTemplates(projectId).catch(() => [] as MessageTemplate[]),
            ]);

            const allPhones: WabaPhoneNumber[] = [];
            status.accounts.forEach((acc) => {
                (acc.phoneNumbers ?? []).forEach((p) => allPhones.push(p));
            });
            setPhoneNumbers(allPhones);

            if (!status.isConnected || allPhones.length === 0) {
                setPrereqStatus("no-waba");
                return;
            }

            const hasApproved = templates.some((t) => t.status === "APPROVED");
            if (!hasApproved) {
                setPrereqStatus("no-template");
                return;
            }

            setPrereqStatus("ready");
        } catch (err) {
            console.error("Failed to check prereqs:", err);
            setPrereqStatus("error");
        }
    }, [projectId]);

    useEffect(() => {
        (async () => {
            await checkPrereqs();
        })()
    }, [checkPrereqs]);



    const handleSent = (result: SendResult, apiKey: string) => {
        setLastResult(result);
        setApiKeyUsed(apiKey);
    };

    // Loading 
    if (prereqStatus === "loading") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-border/60 bg-white p-12 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-[#7C3AED] animate-spin" />
                </div>
            </div>
        );
    }

    // ── Error ────────────────────────────────────────────────
    if (prereqStatus === "error") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <div className="rounded-2xl border border-red-200 bg-red-50/40 p-8 text-center">
                    <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-3" />
                    <p className="text-[13.5px] text-red-900 mb-4">
                        Failed to load required data. Please try again.
                    </p>
                    <button
                        type="button"
                        onClick={checkPrereqs}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 transition-all inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    // ── No WABA ──────────────────────────────────────────────
    if (prereqStatus === "no-waba") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <PrereqState
                    icon={<MessageCircle className="w-7 h-7 text-[#7C3AED]" />}
                    title="Connect WhatsApp first"
                    description="Before sending OTPs, you need to connect a WhatsApp Business account with at least one phone number."
                    href={`/projects/${projectId}/whatsapp`}
                    buttonText="Connect WhatsApp"
                />
            </div>
        );
    }

    // ── No template ──────────────────────────────────────────
    if (prereqStatus === "no-template") {
        return (
            <div className="space-y-6">
                <PageHeader />
                <PrereqState
                    icon={<FileText className="w-7 h-7 text-[#7C3AED]" />}
                    title="Create an approved template"
                    description="You need at least one APPROVED message template before you can send OTPs. Submit a template for Meta review first."
                    href={`/projects/${projectId}/templates`}
                    buttonText="Manage Templates"
                />
            </div>
        );
    }

    // ── Ready — show form 
    return (
        <div className="space-y-6">
            <PageHeader />

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
                {/* Left: forms */}
                <div className="space-y-6">
                    <SendOtpForm
                        projectId={projectId}
                        phoneNumbers={phoneNumbers}
                        onSent={handleSent}
                    />

                    {lastResult && (
                        <VerifyOtpForm
                            sendResult={lastResult}
                            apiKey={apiKeyUsed}
                        />
                    )}
                </div>

                {/* Right: result */}
                <div className="lg:sticky lg:top-6">
                    {lastResult ? (
                        <ResultCard result={lastResult} />
                    ) : (
                        <EmptyResultPlaceholder />
                    )}
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Header
// ─────────────────────────────────────────────────────────────
function PageHeader() {
    return (
        <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                <Send className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
                <h1 className="text-[22px] font-bold tracking-tight text-foreground">
                    Send OTP
                </h1>
                <p className="text-[12.5px] text-muted-foreground">
                    Test OTP delivery to any WhatsApp number
                </p>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Prereq blocker (no WABA / no template)
// ─────────────────────────────────────────────────────────────
function PrereqState({
    icon, title, description, href, buttonText,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    href: string;
    buttonText: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-8 sm:p-12 text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#EDE9FE] mb-4">
                {icon}
            </div>
            <h2 className="text-[18px] font-bold text-foreground mb-2">{title}</h2>
            <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed mb-5">
                {description}
            </p>
            <Link
                href={href}
                className="cursor-pointer h-10 px-5 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 shadow-sm shadow-[#7C3AED]/20"
            >
                {buttonText}
                <ArrowRight className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
// Empty result placeholder
// ─────────────────────────────────────────────────────────────
function EmptyResultPlaceholder() {
    return (
        <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-8 text-center">
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-white border border-border/60 mb-3">
                <Send className="w-5 h-5 text-muted-foreground" />
            </div>
            <h3 className="text-[13.5px] font-semibold text-foreground mb-1">
                No messages sent yet
            </h3>
            <p className="text-[11.5px] text-muted-foreground max-w-[220px] mx-auto leading-relaxed">
                Fill out the form to send your first test OTP. The result will appear here.
            </p>
        </div>
    );
}