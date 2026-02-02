/**
 * Auth Route Group Loading
 * Shows while auth pages are loading
 */

import { Loader2 } from "lucide-react";

export default function AuthLoading() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-green-600" />
                <p className="text-gray-600 text-sm">Loading...</p>
            </div>
        </div>
    );
}
