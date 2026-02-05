/**
 * Platform Layout
 * 
 * Wraps all authenticated platform pages (dashboard, profile, etc.)
 * 
 * IMPORTANT: This is now a SERVER component.
 * Route protection is handled by middleware.ts, not here.
 * Onboarding redirects are handled client-side only where needed.
 */

import { PlatformLayoutClient } from './PlatformLayoutClient';

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PlatformLayoutClient>{children}</PlatformLayoutClient>;
}
