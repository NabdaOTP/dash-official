// ─────────────────────────────────────────────────────────────
// File: src/features/waba/lib/facebook-sdk.ts
//
// Loads the Facebook JS SDK and initializes it with the given appId.
// We load it once per session and cache the FB global.
// ─────────────────────────────────────────────────────────────

// Minimal FB types we use
interface FBAuthResponse {
    code?: string;
    userID?: string;
    accessToken?: string;
}

interface FBLoginResponse {
    status?: string;
    authResponse?: FBAuthResponse;
}

interface FBLoginOptions {
    config_id: string;
    response_type: "code";
    override_default_response_type: true;
    redirect_uri?: string;
    fallback_redirect_uri?: string;
    extras?: string;
    state?: string;
}

interface FBSdk {
    init: (config: {
        appId: string;
        cookie: boolean;
        xfbml: boolean;
        version: string;
    }) => void;
    login: (
        callback: (response: FBLoginResponse) => void,
        options: FBLoginOptions
    ) => void;
}

declare global {
    interface Window {
        FB?: FBSdk;
        fbAsyncInit?: () => void;
    }
}

let loadingPromise: Promise<FBSdk> | null = null;
let loadedConfig: { appId: string; version: string } | null = null;

/**
 * Load the Facebook SDK script and initialize it.
 * Subsequent calls with the same config return the cached SDK.
 */
export async function loadFacebookSdk(
    appId: string,
    version: string
): Promise<FBSdk> {
    // Return cached SDK if already initialized with same config
    if (
        window.FB &&
        loadedConfig &&
        loadedConfig.appId === appId &&
        loadedConfig.version === version
    ) {
        return window.FB;
    }

    // Return in-flight loading promise if any
    if (loadingPromise) return loadingPromise;

    loadingPromise = new Promise<FBSdk>((resolve, reject) => {
        // Set the async init callback BEFORE injecting the script
        window.fbAsyncInit = () => {
            if (!window.FB) {
                reject(new Error("FB SDK loaded but FB global is missing"));
                return;
            }
            window.FB.init({
                appId,
                cookie: true,
                xfbml: false,
                version,
            });
            loadedConfig = { appId, version };
            resolve(window.FB);
        };

        // Check if script tag already exists
        const existingScript = document.getElementById("facebook-jssdk");
        if (existingScript) {
            // Script exists but FB might not be ready yet
            // If FB is already there, init manually
            if (window.FB) {
                window.FB.init({
                    appId,
                    cookie: true,
                    xfbml: false,
                    version,
                });
                loadedConfig = { appId, version };
                resolve(window.FB);
            }
            return;
        }

        // Inject the SDK script
        const script = document.createElement("script");
        script.id = "facebook-jssdk";
        script.src = "https://connect.facebook.net/en_US/sdk.js";
        script.async = true;
        script.defer = true;
        script.crossOrigin = "anonymous";
        script.onerror = () => {
            loadingPromise = null;
            reject(new Error("Failed to load Facebook SDK"));
        };
        document.body.appendChild(script);
    });

    try {
        return await loadingPromise;
    } catch (err) {
        loadingPromise = null;
        throw err;
    }
}

/**
 * Trigger Facebook login with the given embedded signup config.
 * Returns the OAuth code on success, or null if user cancelled.
 */
export function fbLogin(
    configId: string,
    options: {
        redirectUri?: string;
        fallbackRedirectUri?: string;
        extras?: Record<string, unknown>;
        state?: string;
    } = {}
): Promise<{ code: string; state?: string } | null> {
    return new Promise((resolve, reject) => {
        if (!window.FB) {
            reject(new Error("Facebook SDK not loaded"));
            return;
        }

        window.FB.login(
            (response) => {
                const code = response?.authResponse?.code;
                if (!code) {
                    // User cancelled or no code returned
                    resolve(null);
                    return;
                }
                resolve({
                    code,
                    state: options.state,
                });
            },
            {
                config_id: configId,
                response_type: "code",
                override_default_response_type: true,
                redirect_uri: options.redirectUri,
                fallback_redirect_uri: options.fallbackRedirectUri,
                extras: options.extras ? JSON.stringify(options.extras) : undefined,
                state: options.state,
            }
        );
    });
}