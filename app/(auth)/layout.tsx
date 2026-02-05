/**
 * Auth Layout
 * 
 * Wraps auth-related pages (sign-in, sign-up, etc.)
 * 
 * IMPORTANT: This is now a SERVER component.
 * Route protection is handled by middleware.ts, not here.
 */

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
