"use client";

import { useEffect, useState } from "react";
import {
    X, Loader2, UserPlus, Plus, Trash2, ToggleLeft, ToggleRight,
} from "lucide-react";
import { toast } from "sonner";

import { addContact } from "@/features/contacts/services/contact-service";
import { validatePhoneNumber } from "@/features/contacts/lib/contact-helpers";
import type { Contact, ContactAttributes } from "@/features/contacts/types";

interface AttributeRow {
    id: string;
    key: string;
    value: string;
}

interface AddContactDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    onAdded: (contact: Contact) => void;
}

export function AddContactDialog({
    open,
    onClose,
    projectId,
    onAdded,
}: AddContactDialogProps) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [isSubscribed, setIsSubscribed] = useState(true);
    const [attributes, setAttributes] = useState<AttributeRow[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    
    useEffect(() => {
        (async () => {
            if (open) {
            await setName("");
            setPhone("");
            setIsSubscribed(true);
            setAttributes([]);
            setSubmitting(false);
            setErrors({});
        }
        })()
    }, [open]);


    if (!open) return null;

    const addAttribute = () => {
        setAttributes((prev) => [
            ...prev,
            { id: Math.random().toString(36).slice(2, 9), key: "", value: "" },
        ]);
    };

    const updateAttribute = (
        id: string,
        field: "key" | "value",
        val: string
    ) => {
        setAttributes((prev) =>
            prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
        );
    };

    const removeAttribute = (id: string) => {
        setAttributes((prev) => prev.filter((a) => a.id !== id));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        const phoneError = validatePhoneNumber(phone);
        if (phoneError) newErrors.phone = phoneError;

        if (name.trim().length > 100) {
            newErrors.name = "Name must be 100 characters or fewer";
        }

        // Validate attribute rows (both fields must be filled or both empty)
        for (const attr of attributes) {
            if ((attr.key.trim() === "") !== (attr.value.trim() === "")) {
                newErrors.attributes =
                    "All attribute rows must have both a key and a value";
                break;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildAttributes = (): ContactAttributes | undefined => {
        const obj: ContactAttributes = {};
        for (const a of attributes) {
            const key = a.key.trim();
            const value = a.value.trim();
            if (!key || !value) continue;
            // Coerce numeric strings to numbers
            obj[key] = /^\d+(\.\d+)?$/.test(value) ? Number(value) : value;
        }
        return Object.keys(obj).length > 0 ? obj : undefined;
    };

    const handleSubmit = async () => {
        if (!validate() || submitting) return;
        setSubmitting(true);
        try {
            // Clean the phone — keep digits and an optional leading +
            const cleanPhone = phone.replace(/[^0-9+]/g, "");
            const contact = await addContact(projectId, {
                phoneNumber: cleanPhone,
                name: name.trim() || undefined,
                attributes: buildAttributes(),
                isSubscribed,
            });
            toast.success(
                `${contact.name?.trim() || "Contact"} added successfully`
            );
            onAdded(contact);
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to add contact";
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
                className="w-full max-w-md max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                            <UserPlus className="w-5 h-5 text-[#7C3AED]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                New Contact
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                Add a contact to your project
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
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
                    {/* Name */}
                    <Field
                        label="Name"
                        helper="Optional. Used as a friendly identifier."
                        error={errors.name}
                    >
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => {
                                setName(e.target.value);
                                if (errors.name) setErrors({ ...errors, name: "" });
                            }}
                            disabled={submitting}
                            maxLength={100}
                            placeholder="John Doe"
                            className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        />
                    </Field>

                    {/* Phone */}
                    <Field
                        label="Phone Number"
                        helper="International format with country code"
                        error={errors.phone}
                        required
                    >
                        <input
                            type="tel"
                            value={phone}
                            onChange={(e) => {
                                setPhone(e.target.value);
                                if (errors.phone) setErrors({ ...errors, phone: "" });
                            }}
                            disabled={submitting}
                            placeholder="+201001234567"
                            className={`w-full h-10 px-3.5 rounded-lg border bg-background font-mono text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 ${errors.phone ? "border-red-300" : "border-border"
                                }`}
                        />
                    </Field>

                    {/* Subscribed toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setIsSubscribed((s) => !s)}
                            disabled={submitting}
                            className="cursor-pointer w-full rounded-lg border border-border bg-muted/20 p-3 flex items-center justify-between gap-3 hover:bg-muted/30 transition-colors disabled:opacity-50"
                        >
                            <div className="text-left">
                                <p className="text-[12.5px] font-semibold text-foreground">
                                    Subscribed
                                </p>
                                <p className="text-[11px] text-muted-foreground mt-0.5">
                                    Receive messages from this project
                                </p>
                            </div>
                            {isSubscribed ? (
                                <ToggleRight className="w-9 h-9 text-[#7C3AED] shrink-0" />
                            ) : (
                                <ToggleLeft className="w-9 h-9 text-muted-foreground shrink-0" />
                            )}
                        </button>
                    </div>

                    {/* Attributes */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[12.5px] font-semibold text-foreground">
                                Attributes
                            </label>
                            <button
                                type="button"
                                onClick={addAttribute}
                                disabled={submitting}
                                className="cursor-pointer h-7 px-2 rounded-md text-[11px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <Plus className="w-3 h-3" />
                                Add attribute
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground mb-2 leading-relaxed">
                            Custom data like city or segment for targeting campaigns.
                        </p>

                        {attributes.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-center">
                                <p className="text-[11.5px] text-muted-foreground">
                                    No attributes — add some to enable audience filtering
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {attributes.map((attr) => (
                                    <div key={attr.id} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={attr.key}
                                            onChange={(e) =>
                                                updateAttribute(attr.id, "key", e.target.value)
                                            }
                                            disabled={submitting}
                                            placeholder="city"
                                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-[12.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 font-mono"
                                        />
                                        <span className="text-muted-foreground text-[12px]">
                                            =
                                        </span>
                                        <input
                                            type="text"
                                            value={attr.value}
                                            onChange={(e) =>
                                                updateAttribute(attr.id, "value", e.target.value)
                                            }
                                            disabled={submitting}
                                            placeholder="Dubai"
                                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-[12.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeAttribute(attr.id)}
                                            disabled={submitting}
                                            className="cursor-pointer w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                                            aria-label="Remove attribute"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errors.attributes && (
                            <p className="text-[11px] text-red-600 mt-1">
                                {errors.attributes}
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 sm:px-6 py-4 bg-muted/30 border-t border-border/40 shrink-0">
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
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2"
                    >
                        {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        {submitting ? "Adding…" : "Add Contact"}
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function Field({
    label, helper, error, required, children,
}: {
    label: string;
    helper?: string;
    error?: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div>
            <label className="block text-[12.5px] font-semibold text-foreground mb-1.5">
                {label}
                {required && <span className="text-red-500 ms-1">*</span>}
            </label>
            {children}
            {error && <p className="text-[11px] text-red-600 mt-1">{error}</p>}
            {!error && helper && (
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    {helper}
                </p>
            )}
        </div>
    );
}