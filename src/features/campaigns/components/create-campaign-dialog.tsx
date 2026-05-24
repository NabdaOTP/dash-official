"use client";

import { useEffect, useState } from "react";
import {
    X, Loader2, Megaphone, Calendar, Send, Plus, Trash2,
    Filter, FileText, ChevronDown,
} from "lucide-react";
import { toast } from "sonner";

import { createCampaign, startCampaign } from "@/features/campaigns/services/campaign-service";
import type { Campaign, AudienceFilter } from "@/features/campaigns/types";
import type { MessageTemplate } from "@/features/templates/types";

type ScheduleMode = "now" | "scheduled";

interface FilterRow {
    id: string;
    key: string;
    value: string;
}

interface CreateCampaignDialogProps {
    open: boolean;
    onClose: () => void;
    projectId: string;
    wabaAccountId: string;
    approvedTemplates: MessageTemplate[];
    onCreated: (campaign: Campaign) => void;
}

export function CreateCampaignDialog({
    open,
    onClose,
    projectId,
    wabaAccountId,
    approvedTemplates,
    onCreated,
}: CreateCampaignDialogProps) {
    const [name, setName] = useState("");
    const [templateName, setTemplateName] = useState("");
    const [scheduleMode, setScheduleMode] = useState<ScheduleMode>("now");
    const [scheduledAt, setScheduledAt] = useState("");
    const [filters, setFilters] = useState<FilterRow[]>([]);
    const [submitting, setSubmitting] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
    (async () => {
      if (open) {
            await setName("");
            setTemplateName(approvedTemplates[0]?.name ?? "");
            setScheduleMode("now");
            setScheduledAt(getDefaultSchedule());
            setFilters([]);
            setSubmitting(false);
            setErrors({});
        }
    })()
  }, [open, approvedTemplates]);

    // useEffect(() => {
    //     if (open) {
    //         setName("");
    //         setTemplateName(approvedTemplates[0]?.name ?? "");
    //         setScheduleMode("now");
    //         setScheduledAt(getDefaultSchedule());
    //         setFilters([]);
    //         setSubmitting(false);
    //         setErrors({});
    //     }
    // }, [open, approvedTemplates]);

    if (!open) return null;

    const addFilter = () => {
        setFilters((prev) => [
            ...prev,
            { id: Math.random().toString(36).slice(2, 9), key: "", value: "" },
        ]);
    };

    const updateFilter = (id: string, field: "key" | "value", value: string) => {
        setFilters((prev) =>
            prev.map((f) => (f.id === id ? { ...f, [field]: value } : f))
        );
    };

    const removeFilter = (id: string) => {
        setFilters((prev) => prev.filter((f) => f.id !== id));
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        if (!name.trim()) newErrors.name = "Campaign name is required";
        if (name.trim().length > 100) newErrors.name = "Name must be 100 characters or fewer";
        if (!templateName) newErrors.templateName = "Select a template";
        if (scheduleMode === "scheduled") {
            if (!scheduledAt) {
                newErrors.scheduledAt = "Select a date and time";
            } else if (new Date(scheduledAt) <= new Date()) {
                newErrors.scheduledAt = "Schedule must be in the future";
            }
        }
        // Validate non-empty filter rows
        for (const f of filters) {
            if ((f.key.trim() === "") !== (f.value.trim() === "")) {
                newErrors.filters = "All filter rows must have both a key and a value";
                break;
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const buildAudienceFilter = (): AudienceFilter | undefined => {
        const audience: AudienceFilter = {};
        for (const f of filters) {
            const key = f.key.trim();
            const value = f.value.trim();
            if (!key || !value) continue;
            // Coerce to number if it looks numeric
            audience[key] = /^\d+(\.\d+)?$/.test(value) ? Number(value) : value;
        }
        return Object.keys(audience).length > 0 ? audience : undefined;
    };

    const handleSubmit = async (shouldStart: boolean) => {
        if (!validate() || submitting) return;
        setSubmitting(true);
        try {
            const campaign = await createCampaign(projectId, {
                name: name.trim(),
                templateName,
                wabaAccountId,
                scheduledAt: scheduleMode === "scheduled" ? scheduledAt : undefined,
                audienceFilter: buildAudienceFilter(),
            });

            // If "Send now", trigger the start endpoint immediately
            if (shouldStart && scheduleMode === "now") {
                try {
                    await startCampaign(projectId, campaign.id);
                    toast.success(`Campaign "${campaign.name}" started`);
                } catch (startErr) {
                    console.error("Start failed:", startErr);
                    toast.error("Campaign created but failed to start. You can start it manually.");
                }
            } else {
                toast.success(`Campaign "${campaign.name}" created`);
            }

            onCreated(campaign);
            onClose();
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to create campaign";
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
                className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-border/40 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
                            <Megaphone className="w-5 h-5 text-[#7C3AED]" />
                        </div>
                        <div>
                            <h2 className="text-base font-semibold text-foreground">
                                New Campaign
                            </h2>
                            <p className="text-[12px] text-muted-foreground mt-0.5">
                                Broadcast messages to your contacts
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
                <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
                    {/* Campaign name */}
                    <Field
                        label="Campaign name"
                        helper="Internal name to identify this campaign (e.g. 'Spring promo 2026')"
                        error={errors.name}
                        required
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
                            placeholder="Spring promo 2026"
                            className="w-full h-10 px-3.5 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                        />
                    </Field>

                    {/* Template */}
                    <Field
                        label="Template"
                        helper="Only approved templates can be used in campaigns"
                        error={errors.templateName}
                        required
                    >
                        <div className="relative">
                            <select
                                aria-label="select"
                                value={templateName}
                                onChange={(e) => {
                                    setTemplateName(e.target.value);
                                    if (errors.templateName) setErrors({ ...errors, templateName: "" });
                                }}
                                disabled={submitting}
                                className="appearance-none w-full h-10 px-3.5 pe-10 rounded-lg border border-border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                            >
                                <option value="">Select a template…</option>
                                {approvedTemplates.map((t) => (
                                    <option key={t.id} value={t.name}>
                                        {t.name} ({t.language})
                                    </option>
                                ))}
                            </select>
                            <FileText className="w-3.5 h-3.5 text-muted-foreground absolute end-9 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground absolute end-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </Field>

                    {/* Schedule */}
                    <div>
                        <label className="block text-[12.5px] font-semibold text-foreground mb-1.5">
                            When to send <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <ScheduleOption
                                active={scheduleMode === "now"}
                                onClick={() => setScheduleMode("now")}
                                disabled={submitting}
                                icon={<Send className="w-4 h-4" />}
                                label="Send now"
                                description="Broadcast immediately"
                            />
                            <ScheduleOption
                                active={scheduleMode === "scheduled"}
                                onClick={() => setScheduleMode("scheduled")}
                                disabled={submitting}
                                icon={<Calendar className="w-4 h-4" />}
                                label="Schedule"
                                description="Pick a date and time"
                            />
                        </div>

                        {scheduleMode === "scheduled" && (
                            <div className="mt-3">
                                <input
                                    type="datetime-local"
                                    aria-label="input"
                                    value={scheduledAt}
                                    onChange={(e) => {
                                        setScheduledAt(e.target.value);
                                        if (errors.scheduledAt) setErrors({ ...errors, scheduledAt: "" });
                                    }}
                                    disabled={submitting}
                                    min={getDefaultSchedule()}
                                    className={`w-full h-10 px-3.5 rounded-lg border bg-background text-[13.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 ${errors.scheduledAt ? "border-red-300" : "border-border"
                                        }`}
                                />
                                {errors.scheduledAt && (
                                    <p className="text-[11px] text-red-600 mt-1">
                                        {errors.scheduledAt}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Audience filters */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-[12.5px] font-semibold text-foreground flex items-center gap-1.5">
                                <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                                Audience filters
                            </label>
                            <button
                                type="button"
                                onClick={addFilter}
                                disabled={submitting}
                                className="cursor-pointer h-7 px-2 rounded-md text-[11px] font-medium text-[#7C3AED] hover:bg-[#EDE9FE]/40 transition-colors flex items-center gap-1 disabled:opacity-50"
                            >
                                <Plus className="w-3 h-3" />
                                Add filter
                            </button>
                        </div>
                        <p className="text-[11px] text-muted-foreground leading-relaxed mb-2">
                            Limit who receives this campaign by contact attributes (e.g. city: Dubai, segment: VIP). Leave empty to send to all contacts.
                        </p>

                        {filters.length === 0 ? (
                            <div className="rounded-lg border border-dashed border-border bg-muted/20 px-3 py-3 text-center">
                                <p className="text-[11.5px] text-muted-foreground">
                                    No filters — campaign will reach all subscribed contacts
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filters.map((filter) => (
                                    <div
                                        key={filter.id}
                                        className="flex items-center gap-2"
                                    >
                                        <input
                                            type="text"
                                            value={filter.key}
                                            onChange={(e) =>
                                                updateFilter(filter.id, "key", e.target.value)
                                            }
                                            disabled={submitting}
                                            placeholder="Attribute (e.g. city)"
                                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-[12.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50 font-mono"
                                        />
                                        <span className="text-muted-foreground text-[12px]">=</span>
                                        <input
                                            type="text"
                                            value={filter.value}
                                            onChange={(e) =>
                                                updateFilter(filter.id, "value", e.target.value)
                                            }
                                            disabled={submitting}
                                            placeholder="Value (e.g. Dubai)"
                                            className="flex-1 h-9 px-3 rounded-lg border border-border bg-background text-[12.5px] outline-none transition-colors focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] disabled:opacity-50"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeFilter(filter.id)}
                                            disabled={submitting}
                                            className="cursor-pointer w-9 h-9 rounded-lg text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors disabled:opacity-50 shrink-0"
                                            aria-label="Remove filter"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {errors.filters && (
                            <p className="text-[11px] text-red-600 mt-1">{errors.filters}</p>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between gap-2 px-5 sm:px-6 py-4 bg-muted/30 border-t border-border/40 shrink-0 flex-wrap">
                    <p className="text-[11.5px] text-muted-foreground">
                        {scheduleMode === "now"
                            ? "Campaign will start sending immediately."
                            : "Campaign will be created and sent at the scheduled time."}
                    </p>
                    <div className="flex items-center gap-2 ms-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={submitting}
                            className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        {scheduleMode === "now" ? (
                            <button
                                type="button"
                                onClick={() => handleSubmit(true)}
                                disabled={submitting}
                                className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Send className="w-3.5 h-3.5" />
                                )}
                                {submitting ? "Sending…" : "Create & Send"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={() => handleSubmit(false)}
                                disabled={submitting}
                                className="cursor-pointer h-9 px-4 rounded-lg text-[13px] font-medium text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center gap-2"
                            >
                                {submitting ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    <Calendar className="w-3.5 h-3.5" />
                                )}
                                {submitting ? "Scheduling…" : "Schedule Campaign"}
                            </button>
                        )}
                    </div>
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

function ScheduleOption({
    active, onClick, disabled, icon, label, description,
}: {
    active: boolean;
    onClick: () => void;
    disabled?: boolean;
    icon: React.ReactNode;
    label: string;
    description: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`cursor-pointer rounded-lg p-3 text-left border transition-all disabled:opacity-50 ${active
                    ? "bg-[#F8F7FF] border-[#7C3AED] shadow-sm"
                    : "bg-white border-border/60 hover:border-[#7C3AED]/40"
                }`}
        >
            <div className="flex items-center gap-2">
                <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${active ? "bg-[#7C3AED] text-white" : "bg-muted/40 text-muted-foreground"
                        }`}
                >
                    {icon}
                </div>
                <div className="flex-1 min-w-0">
                    <p className={`text-[13px] font-semibold leading-tight ${active ? "text-[#7C3AED]" : "text-foreground"
                        }`}>
                        {label}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                        {description}
                    </p>
                </div>
            </div>
        </button>
    );
}

// Get a default schedule time = now + 1 hour, in datetime-local format
function getDefaultSchedule(): string {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    d.setMinutes(0);
    d.setSeconds(0);
    // YYYY-MM-DDTHH:MM
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}