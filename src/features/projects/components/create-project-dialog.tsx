"use client";

import { useState } from "react";
import { X, Loader2, Building2, Copy, Check, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { createProject } from "../services/project-service";
import { Button } from "@/components/ui/button";

interface CreateProjectDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: (projectId: string) => void;
}

export function CreateProjectDialog({
  open,
  onClose,
  onCreated,
}: CreateProjectDialogProps) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a project name");
      return;
    }

    if (name.trim().length < 2) {
      toast.error("Project name must be at least 2 characters");
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({ name: name.trim() });
      toast.success("Project created successfully");
      setName("");
      setCreatedKey(project.apiKey.rawKey);
      setCreatedProjectId(project.id);
    } catch (err: unknown) {
      toast.error(
        (err as { message?: string })?.message ?? "Failed to create project"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (loading) return;
    setName("");
    setCreatedKey(null);
    setCreatedProjectId(null);
    setCopied(false);
    onClose();
  };

  const handleCopy = async () => {
    if (!createdKey) return;
    await navigator.clipboard.writeText(createdKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleContinue = () => {
    if (createdProjectId) {
      onCreated(createdProjectId);
    }
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
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#EDE9FE] flex items-center justify-center">
              <Building2 size={18} className="text-[#7C3AED]" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-foreground">
                {createdKey ? "Project Created" : "Create New Project"}
              </h2>
              <p className="text-xs text-muted-foreground">
                {createdKey
                  ? "Save your API key before continuing"
                  : "Give your project a name to get started"}
              </p>
            </div>
          </div>
          <Button
            onClick={handleClose}
            className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-muted cursor-pointer text-white hover:text-red-700"
            disabled={loading}
          >
            <X size={18} />
          </Button>
        </div>

        {createdKey ? (
          /* API Key display */
          <div className="p-5 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex gap-2.5">
              <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12.5px] font-semibold text-amber-900">
                  This is the only time you&apos;ll see this key
                </p>
                <p className="text-[11.5px] text-amber-800 mt-0.5 leading-relaxed">
                  Copy and store it in a secure location. If you lose it, you&apos;ll need to create a new one.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[12px] font-medium text-muted-foreground mb-1.5 block">
                Your API key
              </label>
              <div className="bg-muted/60 rounded-lg p-3 flex items-start gap-2 border border-border/50">
                <code className="flex-1 text-[12px] font-mono text-foreground break-all leading-relaxed">
                  {createdKey}
                </code>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="shrink-0 w-6 h-6 rounded-md hover:bg-background flex items-center justify-center cursor-pointer transition-colors"
                  aria-label="Copy API key"
                >
                  {copied ? (
                    <Check size={15} className="text-green-600" />
                  ) : (
                    <Copy size={15} className="text-muted-foreground" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleContinue}
              className="w-full h-10 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[13.5px] font-semibold cursor-pointer transition-colors"
            >
              Continue to Project
            </button>
          </div>
        ) : (
          /* Creation form */
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Project Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My WhatsApp Project"
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors"
                disabled={loading}
                autoFocus
                maxLength={50}
              />
              <p className="text-[11px] text-muted-foreground">
                Choose a descriptive name for your project (max 50 characters)
              </p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="h-9 px-4 rounded-lg border border-border text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium cursor-pointer flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                {loading ? "Creating..." : "Create Project"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
