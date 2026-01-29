/**
 * Platform Route Group Loading
 * Shows while platform pages are loading
 */

import { Loader2 } from "lucide-react";

export default function PlatformLoading() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        </div>
    );
}
