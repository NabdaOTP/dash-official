"use client";

import { Link } from "@/i18n/navigation";
import { MessageCircle, FileText, Users, ArrowRight, CheckCircle2 } from "lucide-react";

interface PrereqsBlockerProps {
    projectId: string;
    hasWaba: boolean;
    hasApprovedTemplate: boolean;
    hasContacts: boolean;
}

export function PrereqsBlocker({
    projectId,
    hasWaba,
    hasApprovedTemplate,
    hasContacts,
}: PrereqsBlockerProps) {
    const steps = [
        {
            id: "waba",
            label: "Connect WhatsApp Business",
            description: "Link your WhatsApp account to send messages",
            done: hasWaba,
            href: `/projects/${projectId}/whatsapp`,
            buttonText: "Connect WhatsApp",
            icon: <MessageCircle className="w-4 h-4" />,
        },
        {
            id: "template",
            label: "Create an approved template",
            description: "Submit at least one template for Meta review",
            done: hasApprovedTemplate,
            href: `/projects/${projectId}/templates`,
            buttonText: "Manage Templates",
            icon: <FileText className="w-4 h-4" />,
            disabled: !hasWaba,
        },
        {
            id: "contacts",
            label: "Add contacts",
            description: "Build your audience to send campaigns to",
            done: hasContacts,
            href: `/projects/${projectId}/contacts`,
            buttonText: "Add Contacts",
            icon: <Users className="w-4 h-4" />,
            disabled: !hasWaba || !hasApprovedTemplate,
        },
    ];

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-6 sm:p-8">
            <div className="text-center mb-6">
                <h2 className="text-[18px] font-bold text-foreground mb-1.5">
                    Before you can send a campaign
                </h2>
                <p className="text-[13px] text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Complete the steps below to set up your project for broadcasting messages.
                </p>
            </div>

            <div className="space-y-2.5 max-w-xl mx-auto">
                {steps.map((step, i) => {
                    const isNext = !step.done && !step.disabled;
                    return (
                        <div
                            key={step.id}
                            className={`flex items-center gap-3 p-3.5 rounded-xl border transition-colors ${step.done
                                    ? "bg-green-50/40 border-green-200"
                                    : isNext
                                        ? "bg-[#F8F7FF] border-[#7C3AED]/20"
                                        : "bg-muted/30 border-border/40 opacity-60"
                                }`}
                        >
                            {/* Step number / check */}
                            <div
                                className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${step.done
                                        ? "bg-green-500 text-white"
                                        : isNext
                                            ? "bg-[#7C3AED] text-white"
                                            : "bg-white border border-border text-muted-foreground"
                                    }`}
                            >
                                {step.done ? (
                                    <CheckCircle2 className="w-4 h-4" />
                                ) : (
                                    <span className="text-[12px] font-bold">{i + 1}</span>
                                )}
                            </div>

                            {/* Text */}
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-foreground leading-tight">
                                    {step.label}
                                </p>
                                <p className="text-[11.5px] text-muted-foreground mt-0.5">
                                    {step.description}
                                </p>
                            </div>

                            {/* Action */}
                            {step.done ? (
                                <span className="text-[11px] font-semibold text-green-700 uppercase tracking-wide shrink-0">
                                    Done
                                </span>
                            ) : (
                                <Link
                                    href={step.disabled ? "#" : step.href}
                                    aria-disabled={step.disabled}
                                    onClick={(e) => step.disabled && e.preventDefault()}
                                    className={`cursor-pointer h-8 px-3 rounded-lg text-[11.5px] font-medium inline-flex items-center gap-1 shrink-0 transition-all ${step.disabled
                                            ? "bg-muted text-muted-foreground cursor-not-allowed"
                                            : "bg-[#7C3AED] text-white hover:bg-[#6D28D9] active:scale-[0.99]"
                                        }`}
                                >
                                    {step.icon}
                                    {step.buttonText}
                                    <ArrowRight className="w-3 h-3" />
                                </Link>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}