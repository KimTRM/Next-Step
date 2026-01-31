"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/jobs", label: "Jobs" },
    { href: "/match-jobs", label: "Match Jobs" },
    { href: "/applications", label: "Applications" },
    { href: "/mentors", label: "Mentors" },
    { href: "/messages", label: "Messages" },
    { href: "/profile", label: "Profile" },
  ];

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 bg-white/90 backdrop-blur border-b border-border shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center hover:opacity-80 transition-opacity"
          >
            <Image
              src="/logo.png"
              alt="NextStep"
              width={120}
              height={40}
              className="h-10 w-auto"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative transition-colors duration-200 ${
                  isActive(item.href)
                    ? "text-primary font-semibold"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {item.label}
                <span
                  className={`${
                    isActive(item.href)
                      ? "opacity-100 scale-x-100"
                      : "opacity-0 scale-x-0"
                  } absolute -bottom-2 left-0 h-0.5 w-full bg-primary rounded-full transition-all duration-300 origin-left`}
                />
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <SignedOut>
              <Link
                href="/auth"
                className="px-4 py-2 text-primary hover:text-primary/80 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/welcome"
                className="px-6 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors"
              >
                Sign Up
              </Link>
            </SignedOut>
            <SignedIn>
              <div>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-10 h-10",
                    },
                  }}
                  afterSignOutUrl="/"
                />
              </div>
            </SignedIn>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`transition-colors py-2 text-left ${
                    isActive(item.href)
                      ? "text-primary font-semibold"
                      : "text-foreground hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                <SignedOut>
                  <Link
                    href="/auth"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 text-primary hover:text-primary/80 transition-colors text-left"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/welcome"
                    onClick={() => setMobileMenuOpen(false)}
                    className="py-2 px-4 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition-colors text-center"
                  >
                    Sign Up
                  </Link>
                </SignedOut>
                <SignedIn>
                  <div className="py-2">
                    <UserButton
                      appearance={{
                        elements: {
                          avatarBox: "w-10 h-10",
                        },
                      }}
                      afterSignOutUrl="/"
                    />
                  </div>
                </SignedIn>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
