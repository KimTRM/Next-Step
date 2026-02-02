"use client";

import { Mail, MapPin, Pencil, Phone } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

interface ProfileCardProps {
    name?: string;
    email?: string;
    location?: string;
    phone?: string;
    onEdit?: () => void;
}

export function ProfileCard({
    name,
    email,
    location,
    phone,
    onEdit,
}: ProfileCardProps) {
    // Stripe color matching the design
    const stripeColor = "rgba(168, 213, 186, 0.55)";

    return (
        <div
            className="relative w-full overflow-hidden bg-white"
            style={{
                maxWidth: "580px",
                borderRadius: "24px",
                border: "1px solid #e5e5e5",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
            }}
        >
            {/* Top-right stripes - staggered pattern */}
            <div
                className="absolute pointer-events-none"
                style={{ top: 0, right: 0, width: "55%", height: "95px", overflow: "hidden" }}
            >
                <div
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "-20px",
                        width: "250px",
                        height: "20px",
                        backgroundColor: stripeColor,
                        transform: "skewX(-30deg)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "34px",
                        right: "-35px",
                        width: "290px",
                        height: "20px",
                        backgroundColor: stripeColor,
                        transform: "skewX(-30deg)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        top: "60px",
                        right: "-50px",
                        width: "330px",
                        height: "20px",
                        backgroundColor: stripeColor,
                        transform: "skewX(-30deg)",
                    }}
                />
            </div>

            {/* Bottom-left stripes - staggered pattern */}
            <div
                className="absolute pointer-events-none"
                style={{ bottom: 0, left: 0, width: "45%", height: "95px", overflow: "hidden" }}
            >
                <div
                    style={{
                        position: "absolute",
                        bottom: "60px",
                        left: "-20px",
                        width: "180px",
                        height: "20px",
                        backgroundColor: stripeColor,
                        transform: "skewX(-30deg)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "34px",
                        left: "-35px",
                        width: "220px",
                        height: "20px",
                        backgroundColor: stripeColor,
                        transform: "skewX(-30deg)",
                    }}
                />
                <div
                    style={{
                        position: "absolute",
                        bottom: "8px",
                        left: "-50px",
                        width: "260px",
                        height: "20px",
                        backgroundColor: stripeColor,
                        transform: "skewX(-30deg)",
                    }}
                />
            </div>

            {/* Content */}
            <div
                className="relative z-10"
                style={{ padding: "clamp(24px, 5vw, 40px) clamp(24px, 5vw, 48px)" }}
            >
                {/* Name - Bold Italic like the design */}
                <h1
                    style={{
                        fontWeight: 700,
                        fontStyle: "italic",
                        fontSize: "clamp(26px, 6vw, 44px)",
                        color: "#1a1a1a",
                        marginBottom: "clamp(16px, 3vw, 28px)",
                        lineHeight: 1.15,
                        letterSpacing: "-0.01em",
                    }}
                >
                    {name}
                </h1>

                {/* Contact Info */}
                <div style={{ display: "flex", flexDirection: "column", gap: "clamp(10px, 2vw, 16px)" }}>
                    <div className="flex items-center" style={{ gap: "12px" }}>
                        <Mail
                            size={22}
                            strokeWidth={1.4}
                            style={{ color: "#1a1a1a", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "clamp(14px, 2.5vw, 18px)", color: "#1a1a1a" }}>
                            {email}
                        </span>
                    </div>
                    <div className="flex items-center" style={{ gap: "12px" }}>
                        <MapPin
                            size={22}
                            strokeWidth={1.4}
                            style={{ color: "#1a1a1a", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "clamp(14px, 2.5vw, 18px)", color: "#1a1a1a" }}>
                            {location}
                        </span>
                    </div>
                    <div className="flex items-center" style={{ gap: "12px" }}>
                        <Phone
                            size={22}
                            strokeWidth={1.4}
                            style={{ color: "#1a1a1a", flexShrink: 0 }}
                        />
                        <span style={{ fontSize: "clamp(14px, 2.5vw, 18px)", color: "#1a1a1a" }}>
                            {phone}
                        </span>
                    </div>
                </div>

                {/* Edit Button */}
                <div className="flex justify-end" style={{ marginTop: "clamp(16px, 3vw, 24px)" }}>
                    <Button
                        variant="ghost"
                        onClick={onEdit}
                        style={{
                            height: "38px",
                            backgroundColor: "#e8e8e8",
                            borderRadius: "6px",
                            border: "1px solid #c5c5c5",
                            padding: "0 18px",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                        className="hover:bg-[#dcdcdc] transition-colors"
                    >
                        <Pencil size={15} style={{ color: "#1a1a1a" }} />
                        <span style={{ fontSize: "14px", fontWeight: 500, color: "#1a1a1a" }}>
                            Edit
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
