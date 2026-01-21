/**
 * Sign Up Page - NextStep Platform
 */

import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div className="min-h-screen bg-linear-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="mb-4">
                        <span className="text-4xl font-bold text-blue-600">Next</span>
                        <span className="text-4xl font-bold text-gray-900">Step</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Join NextStep
                    </h1>
                    <p className="text-gray-600">
                        Create an account to discover opportunities and connect with mentors
                    </p>
                </div>
                <SignUp
                    appearance={{
                        elements: {
                            rootBox: "mx-auto",
                            card: "shadow-xl",
                        },
                    }}
                    routing="hash"
                    signInUrl="/auth"
                    afterSignUpUrl="/dashboard"
                />
            </div>
        </div>
    );
}
