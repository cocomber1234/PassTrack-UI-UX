"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { usePortalAuth } from "@/components/auth-context";
import { formatDate, Icon, Notice, StatusBadge } from "@/components/ui";
import { getPortalData, newLocalId, savePortalData, type LocalInquiry, type PortalData } from "@/lib/local-data";

export default function InquiryThreadPage() {
  const { id } = useParams<{ id: string }>();
  const user = usePortalAuth();
  const [inquiry, setInquiry] = useState<LocalInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        const data = getPortalData(user.id);
        setInquiry(data.inquiries.find((item) => item.id === id) ?? null);
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load this inquiry.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [id, user.id]);

  const saveInquiry = (updatedInquiry: LocalInquiry) => {
    const data: PortalData = getPortalData(user.id);
    const updatedData = {
      ...data,
      inquiries: data.inquiries.map((item) => item.id === updatedInquiry.id ? updatedInquiry : item),
    };
    savePortalData(user.id, updatedData);
    setInquiry(updatedInquiry);
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    setNotice("");
    if (!inquiry) return;
    const form = event.currentTarget;
    const body = String(new FormData(form).get("body") ?? "").trim();
    if (body.length < 2) {
      setError("Please enter a message before sending.");
      return;
    }
    setSending(true);
    try {
      saveInquiry({
        ...inquiry,
        status: inquiry.status === "resolved" ? "open" : inquiry.status,
        updatedAt: new Date().toISOString(),
        messages: [...inquiry.messages, { id: newLocalId(), senderId: user.id, body, createdAt: new Date().toISOString() }],
      });
      form.reset();
      setNotice("Your message was saved to this browser.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save your message.");
    } finally {
      setSending(false);
    }
  };

  const resolveInquiry = () => {
    if (!inquiry) return;
    setError("");
    try {
      saveInquiry({ ...inquiry, status: "resolved", updatedAt: new Date().toISOString() });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update this inquiry.");
    }
  };

  return (
    <>
      <Link href="/inquiries" className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-brand-600"><span aria-hidden="true">←</span> Back to my inquiries</Link>
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading conversation…</div> :
        !inquiry ? <Notice>{error || "This inquiry could not be found in your local account."}</Notice> : (
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
            <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
              <div><p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">INQUIRY DETAILS</p><h1 className="mt-2 font-display text-2xl font-bold text-ink">{inquiry.subject}</h1><p className="mt-1.5 text-xs text-slate-500">Started {formatDate(inquiry.createdAt)}</p></div>
              <div className="flex items-center gap-2"><StatusBadge status={inquiry.status} />{inquiry.status !== "resolved" ? <button onClick={resolveInquiry} className="rounded-lg border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50">Resolve</button> : null}</div>
            </header>

            <div className="space-y-5 bg-slate-50/60 p-5 sm:p-7" aria-live="polite">
              <Notice tone="info">Local demo thread: replies are saved in this browser and are not sent to a support team.</Notice>
              {inquiry.messages.length === 0 ? <p className="py-12 text-center text-sm text-slate-500">No messages in this conversation yet.</p> :
                inquiry.messages.map((message) => (
                  <article key={message.id} className="flex justify-end">
                    <div className="max-w-[min(88%,620px)] rounded-2xl rounded-br-md bg-brand-600 px-4 py-3 text-white shadow-sm">
                      <p className="mb-1.5 text-[10px] font-bold text-blue-100">You</p>
                      <p className="whitespace-pre-wrap break-words text-sm leading-6">{message.body}</p>
                      <time className="mt-2 block text-right text-[10px] text-blue-100/80">{formatDate(message.createdAt)}</time>
                    </div>
                  </article>
                ))}
            </div>

            <div className="border-t border-slate-100 p-5 sm:p-6">
              {error ? <div className="mb-4"><Notice>{error}</Notice></div> : null}
              {notice ? <div className="mb-4"><Notice tone="success">{notice}</Notice></div> : null}
              {inquiry.status === "resolved" ? <Notice tone="info">This inquiry is marked resolved. Sending a new reply will reopen it.</Notice> :
                <form onSubmit={sendMessage} className="flex flex-col gap-3 sm:flex-row sm:items-end">
                  <div className="flex-1"><label htmlFor="reply" className="mb-2 block text-xs font-semibold text-slate-700">Add a message</label><textarea id="reply" name="body" required minLength={2} maxLength={5000} rows={3} placeholder="Write your message…" className="w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-3 text-sm leading-6 outline-none focus:border-brand-500 focus:ring-4 focus:ring-blue-100" /></div>
                  <button type="submit" disabled={sending} className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-600 px-5 text-xs font-bold text-white transition hover:bg-brand-700">{sending ? "Saving…" : "Save reply"} {!sending ? <Icon name="arrow" className="h-4 w-4" /> : null}</button>
                </form>}
            </div>
          </section>
        )}
    </>
  );
}
