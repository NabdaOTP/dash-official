import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";

import {
    getWabaConnectUrl,
    getWabaStatus,
} from "@/features/waba/services/waba-service";
import { openOAuthPopup } from "@/features/waba/lib/oauth-popup";

interface UseWabaConnectOptions {
    projectId: string;
    onSuccess?: () => void;
}

export function useWabaConnect({ projectId, onSuccess }: UseWabaConnectOptions) {
    const [isConnecting, setIsConnecting] = useState(false);
    const connectingRef = useRef(false);

    const connect = useCallback(async () => {
        if (connectingRef.current) return;
        connectingRef.current = true;
        setIsConnecting(true);

        try {
            const connectData = await getWabaConnectUrl(projectId);
            if (!connectData.connectUrl) {
                throw new Error("No Meta connect URL was returned by backend.");
            }

            let baselineCount = 0;
            try {
                const before = await getWabaStatus(projectId);
                baselineCount = before.accounts.length;
            } catch {
                // Ignore status read failures and rely on popup signals.
            }

            const hasNewAccount = async (): Promise<boolean> => {
                try {
                    const status = await getWabaStatus(projectId);
                    return status.accounts.length > baselineCount;
                } catch {
                    return false;
                }
            };

            const result = await openOAuthPopup(
                connectData.connectUrl,
                "Connect WhatsApp",
                {
                    onPoll: hasNewAccount,
                    pollIntervalMs: 2000,
                    pollTimeoutMs: 30000,
                }
            );

            if (result.completed) {
                let confirmed = await hasNewAccount();
                if (!confirmed) {
                    for (let i = 0; i < 10; i++) {
                        await new Promise((r) => window.setTimeout(r, 1500));
                        confirmed = await hasNewAccount();
                        if (confirmed) break;
                    }
                }

                if (confirmed) {
                    toast.success("WhatsApp connected successfully");
                    onSuccess?.();
                    return;
                }

                toast.info(
                    "Authorization finished, but we're still waiting for Meta sync. Please refresh in a moment.",
                    { duration: 8000 }
                );
                return;
            }

            if (result.error) {
                throw new Error(result.error);
            }
        } catch (err) {
            console.error("[WABA] Connect failed:", err);
            const message =
                err instanceof Error ? err.message : "Failed to connect WhatsApp";
            toast.error(message);
        } finally {
            connectingRef.current = false;
            setIsConnecting(false);
        }
    }, [projectId, onSuccess]);

    return { connect, isConnecting };
}
