import { Header } from "@/shared/components/layout";

export default function ApplicationsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <Header />
            <main className="min-h-screen bg-background">
                {children}
            </main>
        </>
    );
}
