"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { usePortalAuth } from "@/components/auth-context";
import { Brand, Icon, type IconName, Notice } from "@/components/ui";
import { signOutLocalUser } from "@/lib/local-data";

const navigation: { href: string; label: string; icon: IconName }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/applications", label: "My applications", icon: "document" },
  { href: "/inquiries", label: "My inquiries", icon: "message" },
];

export function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = usePortalAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [error, setError] = useState("");
  const [signingOut, setSigningOut] = useState(false);

  const signOut = () => {
    setSigningOut(true);
    try {
      signOutLocalUser();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign out.");
      setSigningOut(false);
      return;
    }
    router.replace("/login");
  };

  return (
    <div className="min-h-screen lg:flex">
      <aside className="flex w-full flex-col border-b border-slate-200 bg-white px-5 py-5 lg:fixed lg:inset-y-0 lg:w-[254px] lg:border-b-0 lg:border-r lg:px-6 lg:py-7">
        <Brand />
        <div className="mt-8 rounded-2xl bg-blue-50/80 p-4">
          <p className="text-[10px] font-bold tracking-[0.16em] text-blue-600">MEMBER SPACE</p>
          <p className="mt-1 truncate text-sm font-semibold text-ink">{user.fullName}</p>
          <p className="mt-0.5 truncate text-xs text-slate-500">{user.email}</p>
        </div>
        <nav aria-label="Main navigation" className="mt-6 flex gap-2 overflow-x-auto lg:flex-col">
          {navigation.map((item) => {
            const active = pathname === item.href || (item.href === "/inquiries" && pathname.startsWith("/inquiries/"));
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${active ? "bg-brand-50 text-brand-700" : "text-slate-500 hover:bg-slate-50 hover:text-ink"}`}
              >
                <Icon name={item.icon} className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-5 hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-4 lg:block">
          <Icon name="shield" className="h-5 w-5 text-brand-600" />
          <p className="mt-3 text-xs font-bold text-ink">Saved on this device</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">Demo records stay in this browser and are not sent to a service.</p>
        </div>
        <div className="mt-auto hidden border-t border-slate-100 pt-5 lg:block">
          <button onClick={signOut} disabled={signingOut} className="flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-slate-500 hover:bg-slate-50 hover:text-ink">
            <Icon name="logout" className="h-[18px] w-[18px]" />
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
        <button onClick={signOut} disabled={signingOut} className="mt-3 flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-500 lg:hidden">
          <Icon name="logout" className="h-4 w-4" />{signingOut ? "Signing out…" : "Sign out"}
        </button>
      </aside>

      <main className="min-w-0 flex-1 px-5 py-7 sm:px-8 lg:ml-[254px] lg:px-12 lg:py-10">
        <div className="mx-auto max-w-6xl">
          {error ? <div className="mb-5"><Notice>{error}</Notice></div> : null}
          {children}
        </div>
      </main>
    </div>
  );
}
