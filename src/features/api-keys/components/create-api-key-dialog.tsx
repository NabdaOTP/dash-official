"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import {
    X, Loader2, Key, Copy, Check, AlertTriangle, Shield,
    KeyRound,
} from "lucide-react";
import { toast } from "sonner";
import { createApiKey } from "@/features/projects/services/project-service";

interface CreateApiKeyDialogProps {
    open: boolean;
    onClose: () => void;
    onCreated: () => void;
}

export function CreateApiKeyDialog({
    open,
    onClose,
    onCreated,
}: CreateApiKeyDialogProps) {
    const params = useParams();
    const projectId = params.projectId as string;

    const [name, setName] = useState("");
    const [loading, setLoading] = useState(false);
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim() || name.trim().length < 2) {
            toast.error("Key name must be at least 2 characters");
            return;
        }

        setLoading(true);
        try {
            const result = await createApiKey(projectId, name.trim());
            setCreatedKey(result.rawKey);
            toast.success("API key created successfully");
        } catch (err: unknown) {
            toast.error(
                (err as { message?: string })?.message ?? "Failed to create API key"
            );
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        if (!createdKey) return;
        navigator.clipboard.writeText(createdKey);
        setCopied(true);
        toast.success("API key copied to clipboard");
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        if (loading) return;
        setName("");
        setCreatedKey(null);
        setCopied(false);
        onClose();
    };

    const handleContinue = () => {
        setName("");
        setCreatedKey(null);
        setCopied(false);
        onCreated();
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            onClick={handleClose}
        >
            <div
                className="bg-background rounded-2xl border border-border w-full max-w-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── State 1: After creation — show the key ── */}
                {createdKey ? (
                    <>
                        <div className="flex items-start justify-between p-5 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                                    <Shield size={18} className="text-green-600" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        API Key Created
                                    </h2>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">
                                        Save this key — you won&apos;t see it again
                                    </p>
                                </div>
                            </div>
                        </div>

                        {createdKey && (
                            <div className="p-5 space-y-4">
                                <div>
                                    <label className="flex items-center gap-1.5 text-[12px] font-semibold text-muted-foreground mb-1.5">
                                        <KeyRound size={12} />
                                        YOUR NEW API KEY
                                    </label>
                                    <div className="bg-muted/40 rounded-lg p-3 flex items-start gap-2 border border-border/50">
                                        <code className="flex-1 text-[12px] font-mono text-foreground break-all leading-relaxed">
                                            {createdKey}
                                        </code>
                                        <button
                                            type="button"
                                            onClick={handleCopy}
                                            className="shrink-0 h-7 px-2 rounded-md hover:bg-background flex items-center gap-1 cursor-pointer transition-colors text-[11px] font-medium text-[#7C3AED]"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={12} />
                                                    Copied
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={12} />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mt-1.5 leading-relaxed">
                                        You can view and copy this key anytime from the API Keys list.
                                    </p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="w-full h-10 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13.5px] font-semibold cursor-pointer transition-colors"
                                >
                                    Done
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* ── State 2: Form ── */}
                        <div className="flex items-start justify-between p-5 border-b border-border">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                                    <Key size={18} className="text-[#7C3AED]" />
                                </div>
                                <div>
                                    <h2 className="text-base font-semibold text-foreground">
                                        Create API Key
                                    </h2>
                                    <p className="text-[12px] text-muted-foreground mt-0.5">
                                        Generate a new key for API access
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleClose}
                                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer text-muted-foreground"
                                disabled={loading}
                                aria-label="close button"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label
                                    htmlFor="key-name"
                                    className="text-[13px] font-medium text-foreground"
                                >
                                    Key Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    id="key-name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="e.g., Production server, Mobile app"
                                    className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-[13.5px] text-foreground placeholder:text-muted-foreground/70 focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-all"
                                    disabled={loading}
                                    autoFocus
                                    maxLength={50}
                                />
                                <p className="text-[11px] text-muted-foreground">
                                    Choose a name that helps you identify where this key is used
                                </p>
                            </div>

                            <div className="flex justify-end gap-2 pt-2">
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    disabled={loading}
                                    className="h-9 px-4 rounded-lg border border-border text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !name.trim()}
                                    className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13px] font-semibold cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading && <Loader2 size={14} className="animate-spin" />}
                                    {loading ? "Creating..." : "Create Key"}
                                </button>
                            </div>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
}