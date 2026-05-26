"use client";

import { useMemo, useState } from "react";
import { KeyRound, Loader2, PlugZap, Send } from "lucide-react";
import { toast } from "sonner";

import {
    attachWabaSender,
    sendWabaTestMessage,
} from "@/features/waba/services/waba-service";
import type { WabaAccount } from "@/features/waba/types";

interface WabaReviewToolsProps {
    projectId: string;
    accounts: WabaAccount[];
    onRefresh: () => void;
}

export function WabaReviewTools({
    projectId,
    accounts,
    onRefresh,
}: WabaReviewToolsProps) {
    const [phoneNumberId, setPhoneNumberId] = useState("");
    const [wabaId, setWabaId] = useState("");
    const [accessToken, setAccessToken] = useState("");
    const [recipient, setRecipient] = useState("");
    const [selectedSenderId, setSelectedSenderId] = useState("");
    const [attaching, setAttaching] = useState(false);
    const [sending, setSending] = useState(false);

    const senderOptions = useMemo(
        () => accounts.filter((account) => account.isActive && !account.needsReauth),
        [accounts]
    );
    const senderPhoneNumberId = selectedSenderId || senderOptions[0]?.phoneNumberId || "";

    const handleAttach = async () => {
        if (attaching) return;
        if (!phoneNumberId.trim() || !wabaId.trim() || !accessToken.trim()) {
            toast.error("Phone Number ID, WABA ID, and access token are required");
            return;
        }

        setAttaching(true);
        try {
            await attachWabaSender(projectId, {
                phoneNumberId: phoneNumberId.trim(),
                wabaId: wabaId.trim(),
                accessToken: accessToken.trim(),
            });
            toast.success("WhatsApp sender attached");
            setAccessToken("");
            onRefresh();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to attach sender";
            toast.error(message);
        } finally {
            setAttaching(false);
        }
    };

    const handleSendTest = async () => {
        if (sending) return;
        if (!senderPhoneNumberId) {
            toast.error("Attach or connect a sender first");
            return;
        }
        if (!recipient.trim()) {
            toast.error("Recipient phone number is required");
            return;
        }

        setSending(true);
        try {
            await sendWabaTestMessage(projectId, senderPhoneNumberId, {
                to: recipient.trim(),
                templateName: "hello_world",
                language: "en_US",
            });
            toast.success("Test message sent");
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Failed to send test message";
            toast.error(message);
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="rounded-2xl border border-border/60 bg-white p-5 sm:p-6 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
            <div>
                <h2 className="text-base font-semibold text-foreground">
                    App Review Test Sender
                </h2>
                <p className="text-[12px] text-muted-foreground mt-0.5">
                    Attach the working Meta API Setup sender and send hello_world from Nabda.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Field label="Phone Number ID">
                    <input
                        value={phoneNumberId}
                        onChange={(e) => setPhoneNumberId(e.target.value)}
                        placeholder="999372706599985"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                </Field>

                <Field label="WABA ID">
                    <input
                        value={wabaId}
                        onChange={(e) => setWabaId(e.target.value)}
                        placeholder="4419551288316559"
                        className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                    />
                </Field>

                <Field label="Meta Access Token">
                    <div className="relative">
                        <KeyRound className="w-3.5 h-3.5 text-muted-foreground absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        <input
                            type="password"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                            placeholder="EAA..."
                            autoComplete="off"
                            className="w-full h-10 ps-9 pe-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                        />
                    </div>
                </Field>
            </div>

            <button
                type="button"
                onClick={handleAttach}
                disabled={attaching}
                className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all inline-flex items-center gap-2 disabled:opacity-60"
            >
                {attaching ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    <PlugZap className="w-4 h-4" />
                )}
                Attach Sender
            </button>

            <div className="border-t border-border/60 pt-5 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
                    <Field label="Sender">
                        <select
                            value={senderPhoneNumberId}
                            onChange={(e) => setSelectedSenderId(e.target.value)}
                            disabled={senderOptions.length === 0}
                            className="appearance-none w-full h-10 px-3 rounded-lg border border-border bg-background text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        >
                            {senderOptions.length === 0 ? (
                                <option value="">No sender connected</option>
                            ) : (
                                senderOptions.map((account) => (
                                    <option
                                        key={account.id}
                                        value={account.phoneNumberId}
                                    >
                                        {account.displayPhoneNumber || account.phoneNumberId}
                                    </option>
                                ))
                            )}
                        </select>
                    </Field>

                    <Field label="Recipient">
                        <input
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                            placeholder="201099811370"
                            className="w-full h-10 px-3 rounded-lg border border-border bg-background font-mono text-[13px] outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED]"
                        />
                    </Field>

                    <button
                        type="button"
                        onClick={handleSendTest}
                        disabled={sending || !senderPhoneNumberId}
                        className="cursor-pointer h-10 px-4 rounded-lg text-[13px] font-semibold text-white bg-[#111827] hover:bg-[#030712] active:scale-[0.99] transition-all inline-flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                        Send Test
                    </button>
                </div>
            </div>
        </div>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <label className="block">
            <span className="block text-[12px] font-semibold text-foreground mb-1.5">
                {label}
            </span>
            {children}
        </label>
    );
}
