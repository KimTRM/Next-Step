/**
 * Platform Layout
 * Server component wrapper for platform routes
 */

import { PlatformLayoutClient } from './PlatformLayoutClient';

export default function PlatformLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <PlatformLayoutClient>{children}</PlatformLayoutClient>;
}
