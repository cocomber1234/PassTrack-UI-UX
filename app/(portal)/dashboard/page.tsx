"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EmptyState, formatDate, Icon, Notice, PageTitle, StatusBadge } from "@/components/ui";
import { usePortalAuth } from "@/components/auth-context";
import { getPortalData, type PortalData } from "@/lib/local-data";

export default function DashboardPage() {
  const user = usePortalAuth();
  const [portalData, setPortalData] = useState<PortalData>({ applications: [], inquiries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setPortalData(getPortalData(user.id));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load your local portal data.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user.id]);

  const applications = portalData.applications;
  const inquiries = portalData.inquiries;

  return (
    <>
      <PageTitle eyebrow="MEMBER DASHBOARD" title={`Welcome, ${user.fullName.split(/\s+/)[0]}`} description="Your passport application updates and next steps at a glance." />
      {error ? <div className="mb-6"><Notice>{error}</Notice></div> : null}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Applications", value: applications.length, icon: "document" as const, href: "/applications" },
          { label: "Open inquiries", value: inquiries.filter((item) => item.status !== "resolved").length, icon: "message" as const, href: "/inquiries" },
          { label: "Documents to do", value: applications.reduce((total, application) => total + application.documents.filter((document) => document.status === "required" || document.status === "rejected").length, 0), icon: "document" as const, href: "/applications" },
        ].map((item) => (
          <Link key={item.label} href={item.href} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:border-blue-200">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500">{item.label}</span>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-blue-50 text-brand-600"><Icon name={item.icon} className="h-[18px] w-[18px]" /></span>
            </div>
            <p className="mt-4 font-display text-2xl font-bold capitalize text-ink">{loading ? "—" : item.value}</p>
          </Link>
        ))}
      </div>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div><p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">APPLICATION OVERVIEW</p><h2 className="mt-1.5 font-display text-lg font-bold text-ink">Recent applications</h2></div>
          <Link href="/applications" className="text-xs font-bold text-brand-600 hover:text-brand-700">View all <span aria-hidden="true">→</span></Link>
        </div>
        <div className="p-5 sm:p-6">
          {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading your applications…</p> :
            applications.length === 0 ? <EmptyState title="No application linked yet" description="Your passport applications will appear here once they are added to your account." /> :
              <div className="divide-y divide-slate-100">
                {applications.slice(0, 4).map((application) => (
                  <Link key={application.id} href="/applications" className="flex flex-wrap items-center justify-between gap-3 py-4 first:pt-0 last:pb-0">
                          <div><p className="text-sm font-bold text-ink">{application.applicationType}</p><p className="mt-1 text-xs text-slate-500">{application.applicationNumber} · Updated {formatDate(application.updatedAt)}</p></div>
                    <StatusBadge status={application.status} />
                  </Link>
                ))}
              </div>}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-5 sm:px-6">
          <div><p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">SUPPORT</p><h2 className="mt-1.5 font-display text-lg font-bold text-ink">Recent inquiries</h2></div>
          <Link href="/inquiries" className="text-xs font-bold text-brand-600 hover:text-brand-700">View all <span aria-hidden="true">→</span></Link>
        </div>
        <div className="divide-y divide-slate-100 px-5 sm:px-6">
          {!loading && inquiries.length === 0 ? <p className="py-8 text-center text-sm text-slate-500">No inquiries yet. Visit My inquiries if you need help.</p> : null}
          {inquiries.slice(0, 3).map((inquiry) => (
            <Link key={inquiry.id} href={`/inquiries/${inquiry.id}`} className="flex items-center justify-between gap-3 py-4">
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-ink">{inquiry.subject}</p><p className="mt-1 text-xs text-slate-500">{formatDate(inquiry.updatedAt)}</p></div>
              <StatusBadge status={inquiry.status} />
            </Link>
          ))}
          {loading ? <p className="py-7 text-center text-sm text-slate-500">Loading your inquiries…</p> : null}
        </div>
      </section>
    </>
  );
}
