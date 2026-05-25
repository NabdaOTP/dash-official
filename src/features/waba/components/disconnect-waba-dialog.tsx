"use client";

import { useState } from "react";
import { X, Loader2, AlertTriangle, Unlink } from "lucide-react";
import { toast } from "sonner";

import { disconnectWabaAccount } from "@/features/waba/services/waba-service";
import type { WabaAccount } from "@/features/waba/types";

interface DisconnectWabaDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    account: WabaAccount;
    onDisconnected: () => void;
}

export function DisconnectWabaDialog({
    open,
    onClose,
    projectId,
    account,
    onDisconnected,
}: DisconnectWabaDialogProps) {
    const [submitting, setSubmitting] = useState(false);

    if (!open) return null;

    const handleDisconnect = async () => {
        setSubmitting(true);
        try {
            await disconnectWabaAccount(projectId, account.id);
            toast.success(`${account.name || "Account"} disconnected`);
            onDisconnected();
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to disconnect";
            toast.error(msg);
            setSubmitting(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => !submitting && onClose()}
        >
            <div
                className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-border/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                            <Unlink className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                Disconnect Account
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                This action cannot be undone
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="cursor-pointer text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40"
                        aria-label="Close"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Account info */}
                    <div className="rounded-xl border border-border/60 bg-muted/20 p-3.5">
                        <p className="text-[10.5px] uppercase tracking-wide font-semibold text-muted-foreground mb-1">
                            Account to disconnect
                        </p>
                        <p className="text-[13.5px] font-semibold text-foreground">
                            {account.name || "WhatsApp Business"}
                        </p>
                        <p className="text-[12px] text-muted-foreground font-mono mt-0.5">
                            {account.displayPhoneNumber}
                        </p>
                    </div>

                    {/* Warning */}
                    <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5">
                        <div className="flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                            <div className="text-[12px] text-amber-900 leading-relaxed space-y-1.5">
                                <p className="font-semibold">
                                    What happens when you disconnect:
                                </p>
                                <ul className="space-y-1 ms-1">
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-amber-700 mt-1">•</span>
                                        <span>
                                            You&apos;ll stop receiving messages and OTP delivery on this
                                            number
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-amber-700 mt-1">•</span>
                                        <span>
                                            Active templates and campaigns using this number will fail
                                        </span>
                                    </li>
                                    <li className="flex items-start gap-1.5">
                                        <span className="text-amber-700 mt-1">•</span>
                                        <span>
                                            You can reconnect anytime by clicking &quot;Add Account&quot; again
                                        </span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-4 bg-muted/30 border-t border-border/40">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={submitting}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDisconnect}
                        disabled={submitting}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-red-600 hover:bg-red-700 active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {submitting ? "Disconnecting…" : "Disconnect Account"}
                    </button>
                </div>
            </div>
        </div>
    );
}