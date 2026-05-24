"use client";

import { useState } from "react";
import { Key, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api-client";

const inputClass =
    "w-full h-10 px-3 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#7C3AED]/30 focus:border-[#7C3AED] transition-colors";

export function ChangePasswordSection() {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [showConfirmPw, setShowConfirmPw] = useState(false);
    const [pwLoading, setPwLoading] = useState(false);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!currentPassword || !newPassword || !confirmPassword) {
            toast.error("Please fill in all fields");
            return;
        }
        if (newPassword.length < 8) {
            toast.error("New password must be at least 8 characters");
            return;
        }
        if (newPassword !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }
        setPwLoading(true);
        try {
            await api.patch("/users/password", {
                currentPassword,
                newPassword,
            });
            toast.success("Password changed successfully");
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
        } catch (err: unknown) {
            toast.error((err as { message?: string })?.message ?? "Failed to change password");
        } finally {
            setPwLoading(false);
        }
    };

    return (
        <div className="bg-background border border-border rounded-xl p-5">
            <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                    <Key size={18} className="text-orange-500" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">Change Password</h2>
                    <p className="text-xs text-muted-foreground">Update your account password to keep it secure</p>
                </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-3">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Current Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input type={showCurrentPw ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="Enter your current password" className={`${inputClass} pr-10`} disabled={pwLoading} />
                        <button type="button" onClick={() => setShowCurrentPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer" tabIndex={-1}>
                            {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">New Password <span className="text-red-500">*</span></label>
                    <p className="text-[11px] text-muted-foreground">Password must be at least 8 characters long</p>
                    <div className="relative">
                        <input type={showNewPw ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Enter your new password" className={`${inputClass} pr-10`} disabled={pwLoading} />
                        <button type="button" onClick={() => setShowNewPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer" tabIndex={-1}>
                            {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-foreground">Confirm New Password <span className="text-red-500">*</span></label>
                    <div className="relative">
                        <input type={showConfirmPw ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirm your new password" className={`${inputClass} pr-10`} disabled={pwLoading} />
                        <button type="button" onClick={() => setShowConfirmPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer" tabIndex={-1}>
                            {showConfirmPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                </div>
                <div className="flex justify-end pt-1">
                    <button type="submit" disabled={pwLoading} className="h-9 px-4 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-sm font-medium cursor-pointer flex items-center gap-2">
                        {pwLoading && <Loader2 size={14} className="animate-spin" />}
                        <Key size={14} />
                        Change Password
                    </button>
                </div>
            </form>
        </div>
    );
}
