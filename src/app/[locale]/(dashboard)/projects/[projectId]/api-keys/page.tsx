import { ApiKeysList } from "@/features/api-keys/components/api-keys-list";
import { ApiKeysInfo } from "@/features/api-keys/components/api-keys-info";

export default function ApiKeysPage() {
    return (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-5">
            {/* Page header */}
            <div>
                <h1 className="text-2xl font-bold text-foreground mb-1">API Keys</h1>
                <p className="text-sm text-muted-foreground">
                    Manage authentication keys for accessing the Nabda API
                </p>
            </div>

            {/* Layout: list (2/3) + info card (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                    <ApiKeysList />
                </div>
                <div>
                    <ApiKeysInfo />
                </div>
            </div>
        </div>
    );
}