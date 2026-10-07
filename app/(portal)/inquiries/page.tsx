"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { usePortalAuth } from "@/components/auth-context";
import { EmptyState, formatDate, Icon, Notice, PageTitle, StatusBadge } from "@/components/ui";
import { getPortalData, newLocalId, savePortalData, type PortalData } from "@/lib/local-data";

export default function InquiriesPage() {
  const user = usePortalAuth();
  const router = useRouter();
  const [portalData, setPortalData] = useState<PortalData>({ applications: [], inquiries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setPortalData(getPortalData(user.id));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load your inquiries.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user.id]);

  const createInquiry = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const subject = String(data.get("subject") ?? "").trim();
    const body = String(data.get("body") ?? "").trim();
    if (!subject || body.length < 5) {
      setError("Enter a subject and a message of at least 5 characters.");
      return;
    }
    setBusy(true);
    try {
      const now = new Date().toISOString();
      const inquiryId = newLocalId();
      const inquiry = {
        id: inquiryId,
        subject,
        status: "open" as const,
        createdAt: now,
        updatedAt: now,
        messages: [{ id: newLocalId(), senderId: user.id, body, createdAt: now }],
      };
      const updatedData = { ...portalData, inquiries: [inquiry, ...portalData.inquiries] };
      savePortalData(user.id, updatedData);
      setPortalData(updatedData);
      router.push(`/inquiries/${inquiryId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save this inquiry in your browser.");
      setBusy(false);
    }
  };

  return (
    <>
      <PageTitle eyebrow="MEMBER SUPPORT" title="My inquiries" description="Contact the support team and review the replies to your questions." />
      {error ? <div className="mb-6"><Notice>{error}</Notice></div> : null}
      <div className="grid items-start gap-6 lg:grid-cols-[1fr_340px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-card">
          <header className="flex items-center justify-between border-b border-slate-100 px-5 py-5 sm:px-6">
            <div><p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">MESSAGE HISTORY</p><h2 className="mt-1.5 font-display text-lg font-bold text-ink">Your conversations</h2></div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">{portalData.inquiries.length} total</span>
          </header>
          <div className="p-5 sm:p-6">
            {loading ? <p className="py-8 text-center text-sm text-slate-500">Loading your inquiries…</p> :
              portalData.inquiries.length === 0 ? <EmptyState title="No inquiries yet" description="If you need help with your application, send a message to our support team." /> :
                <div className="divide-y divide-slate-100">
                  {portalData.inquiries.map((inquiry) => (
                    <Link key={inquiry.id} href={`/inquiries/${inquiry.id}`} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-brand-600"><Icon name="message" className="h-[18px] w-[18px]" /></span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-bold text-ink">{inquiry.subject}</span><span className="mt-1 block text-xs text-slate-500">Updated {formatDate(inquiry.updatedAt)} · {inquiry.messages.length} {inquiry.messages.length === 1 ? "message" : "messages"}</span></span>
                      <StatusBadge status={inquiry.status} />
                    </Link>
                  ))}
                </div>}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">GET IN TOUCH</p>
          <h2 className="mt-1.5 font-display text-lg font-bold text-ink">Start an inquiry</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">Describe how we can help and keep the conversation in one thread.</p>
          <div className="mt-4"><Notice tone="info">Demo messages are saved only in this browser. No support team receives them.</Notice></div>
          <form onSubmit={createInquiry} className="mt-5 space-y-4">
            <div><label htmlFor="subject" className="mb-2 block text-xs font-semibold text-slate-700">Subject</label><input id="subject" name="subject" required maxLength={120} placeholder="What do you need help with?" className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
            <div><label htmlFor="body" className="mb-2 block text-xs font-semibold text-slate-700">Message</label><textarea id="body" name="body" required minLength={5} maxLength={5000} rows={5} placeholder="Add details to help describe your question…" className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3 text-xs leading-5 outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100" /></div>
            <button disabled={busy} type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-brand-700">{busy ? "Saving…" : "Start inquiry"} {!busy ? <Icon name="arrow" className="h-4 w-4" /> : null}</button>
          </form>
        </section>
      </div>
    </>
  );
}
