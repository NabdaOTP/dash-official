"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import {
    Loader2, CheckCircle2, XCircle, MailCheck, LogIn, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

import { acceptInvitation } from "@/features/projects/services/project-service";
import { useAuth } from "@/features/auth/context/auth-context";

type Stage =
    | "loading-auth"
    | "needs-login"
    | "ready"
    | "accepting"
    | "accepted"
    | "failed";

interface AcceptedInfo {
    projectId?: string;
    projectName?: string;
}

export function AcceptInvitationPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams?.get("token");

    const { isAuthenticated, loading: authLoading, user } = useAuth();

    const [stage, setStage] = useState<Stage>("loading-auth");
    const [acceptedInfo, setAcceptedInfo] = useState<AcceptedInfo | null>(null);
    const [errorMessage, setErrorMessage] = useState<string>("");

    //  Determine starting stage based on auth 


    useEffect(() => {
        (async () => {
            if (authLoading) return;
            if (!token) {
                await setErrorMessage("No invitation token provided in the link.");
                setStage("failed");
                return;
            }
            if (!isAuthenticated) {
                setStage("needs-login");
            } else {
                setStage("ready");
            }
        })()
    }, [authLoading, isAuthenticated, token]);


    // ── Accept handler 
    const handleAccept = useCallback(async () => {
        if (!token) return;
        setStage("accepting");
        try {
            // The acceptInvitation service currently returns void.
            // If your service returns the response data (with `project`),
            // adjust to: const data = await acceptInvitation(token);
            await acceptInvitation(token);
            setAcceptedInfo({}); // generic success
            setStage("accepted");
            toast.success("Invitation accepted");
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to accept invitation";
            setErrorMessage(msg);
            setStage("failed");
        }
    }, [token]);

    // Store token before redirecting to login, so we can come back here
    const handleGoToLogin = () => {
        if (token && typeof window !== "undefined") {
            sessionStorage.setItem(
                "pending-invitation-token",
                token
            );
        }
        router.push("/login");
    };

    // After accepting, redirect to projects list
    const handleContinue = () => {
        if (acceptedInfo?.projectId) {
            router.push(`/projects/${acceptedInfo.projectId}/dashboard`);
        } else {
            router.push("/projects");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F8F7FF] px-4 py-8">
            <div className="w-full max-w-md">
                {/* ── Loading auth state ────────────────────── */}
                {(stage === "loading-auth" || authLoading) && (
                    <Card>
                        <div className="py-8 flex flex-col items-center gap-3">
                            <Loader2 className="w-7 h-7 text-[#7C3AED] animate-spin" />
                            <p className="text-[13px] text-muted-foreground">
                                Checking your invitation…
                            </p>
                        </div>
                    </Card>
                )}

                {/* ── Needs login ───────────────────────────── */}
                {stage === "needs-login" && (
                    <Card>
                        <Hero
                            icon={<LogIn className="w-7 h-7 text-[#7C3AED]" />}
                            title="Sign in to accept"
                            description="You've been invited to join a project on Nabda OTP. Please sign in to your account to accept the invitation."
                        />
                        <button
                            type="button"
                            onClick={handleGoToLogin}
                            className="cursor-pointer w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#7C3AED]/20"
                        >
                            <LogIn className="w-4 h-4" />
                            Sign in to continue
                        </button>
                        <p className="text-[11.5px] text-muted-foreground text-center mt-3">
                            Don&apos;t have an account?{" "}
                            <button
                                type="button"
                                onClick={() => {
                                    if (token && typeof window !== "undefined") {
                                        sessionStorage.setItem(
                                            "pending-invitation-token",
                                            token
                                        );
                                    }
                                    router.push("/signup");
                                }}
                                className="cursor-pointer text-[#7C3AED] font-medium hover:underline"
                            >
                                Sign up
                            </button>
                        </p>
                    </Card>
                )}

                {/* ── Ready to accept ───────────────────────── */}
                {stage === "ready" && (
                    <Card>
                        <Hero
                            icon={<MailCheck className="w-7 h-7 text-[#7C3AED]" />}
                            title="Join the project"
                            description={
                                user?.email
                                    ? `You're signed in as ${user.email}. Accept this invitation to gain access to the project.`
                                    : "Accept this invitation to gain access to the project."
                            }
                        />
                        <button
                            type="button"
                            onClick={handleAccept}
                            className="cursor-pointer w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#7C3AED]/20"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Accept Invitation
                        </button>
                        <button
                            type="button"
                            onClick={() => router.push("/projects")}
                            className="cursor-pointer w-full h-9 mt-2 rounded-lg text-[12.5px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                            Cancel
                        </button>
                    </Card>
                )}

                {/* ── Accepting ─────────────────────────────── */}
                {stage === "accepting" && (
                    <Card>
                        <div className="py-8 flex flex-col items-center gap-3">
                            <Loader2 className="w-7 h-7 text-[#7C3AED] animate-spin" />
                            <p className="text-[13px] text-muted-foreground">
                                Accepting invitation…
                            </p>
                        </div>
                    </Card>
                )}

                {/* ── Accepted ──────────────────────────────── */}
                {stage === "accepted" && (
                    <Card>
                        <Hero
                            icon={<CheckCircle2 className="w-7 h-7 text-green-600" />}
                            iconBg="bg-green-50"
                            title="You're in!"
                            description="The invitation was accepted successfully. You can now access the project."
                        />
                        <button
                            type="button"
                            onClick={handleContinue}
                            className="cursor-pointer w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-sm shadow-[#7C3AED]/20"
                        >
                            Go to projects
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Card>
                )}

                {/* ── Failed ────────────────────────────────── */}
                {stage === "failed" && (
                    <Card>
                        <Hero
                            icon={<XCircle className="w-7 h-7 text-red-600" />}
                            iconBg="bg-red-50"
                            title="Invitation unavailable"
                            description={
                                errorMessage ||
                                "This invitation link is invalid, expired, or has already been used."
                            }
                        />
                        <button
                            type="button"
                            onClick={() => router.push(isAuthenticated ? "/projects" : "/login")}
                            className="cursor-pointer w-full h-11 rounded-lg text-[14px] font-semibold text-white bg-[#7C3AED] hover:bg-[#6D28D9] active:scale-[0.99] transition-all flex items-center justify-center gap-2"
                        >
                            {isAuthenticated ? "Back to projects" : "Go to login"}
                            <ArrowRight className="w-4 h-4" />
                        </button>
                    </Card>
                )}
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────
function Card({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-2xl border border-border/60 bg-white p-6 sm:p-7 shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(124,58,237,0.06)]">
            {children}
        </div>
    );
}

function Hero({
    icon,
    iconBg = "bg-[#EDE9FE]",
    title,
    description,
}: {
    icon: React.ReactNode;
    iconBg?: string;
    title: string;
    description: string;
}) {
    return (
        <div className="text-center mb-5">
            <div
                className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${iconBg} mb-3`}
            >
                {icon}
            </div>
            <h1 className="text-[20px] font-bold text-foreground mb-1.5 leading-tight">
                {title}
            </h1>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
                {description}
            </p>
        </div>
    );
}