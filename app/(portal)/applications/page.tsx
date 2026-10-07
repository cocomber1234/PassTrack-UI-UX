"use client";

import { useEffect, useState, type FormEvent } from "react";
import { usePortalAuth } from "@/components/auth-context";
import { EmptyState, formatDate, Notice, PageTitle, StatusBadge } from "@/components/ui";
import {
  formatApplicationNumber,
  getPortalData,
  newLocalId,
  savePortalData,
  type LocalApplication,
  type PortalData,
} from "@/lib/local-data";

const progressSteps: LocalApplication["status"][] = ["draft", "submitted", "under_review", "approved"];
const statusDescriptions: Record<string, string> = {
  draft: "Your application is being prepared.",
  submitted: "Your application has been received.",
  under_review: "Your application is being reviewed.",
  approved: "Your application has been approved.",
  rejected: "Please review the latest update from the passport office.",
};

export default function ApplicationsPage() {
  const user = usePortalAuth();
  const [portalData, setPortalData] = useState<PortalData>({ applications: [], inquiries: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      try {
        setPortalData(getPortalData(user.id));
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Unable to load application progress.");
      } finally {
        setLoading(false);
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [user.id]);

  const createApplication = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const applicationType = String(new FormData(form).get("applicationType") ?? "").trim();
    if (!applicationType) {
      setError("Choose an application type.");
      return;
    }
    setSaving(true);
    try {
      const now = new Date().toISOString();
      const application: LocalApplication = {
        id: newLocalId(),
        applicationNumber: formatApplicationNumber(),
        applicationType,
        status: "draft",
        submittedAt: null,
        createdAt: now,
        updatedAt: now,
        documents: [
          { id: newLocalId(), documentType: "identity proof", fileName: null, status: "required", uploadedAt: null },
          { id: newLocalId(), documentType: "address proof", fileName: null, status: "required", uploadedAt: null },
          { id: newLocalId(), documentType: "passport photograph", fileName: null, status: "required", uploadedAt: null },
        ],
        events: [{ id: newLocalId(), status: "draft", note: "Application started.", createdAt: now }],
      };
      const updatedData = { ...portalData, applications: [application, ...portalData.applications] };
      savePortalData(user.id, updatedData);
      setPortalData(updatedData);
      setShowNewForm(false);
      form.reset();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save the application in this browser.");
    } finally {
      setSaving(false);
    }
  };

  const simulateDocumentProgress = (applicationId: string, documentId: string) => {
    try {
      const now = new Date().toISOString();
      const updatedData = {
        ...portalData,
        applications: portalData.applications.map((application) =>
          application.id !== applicationId ? application : {
            ...application,
            updatedAt: now,
            documents: application.documents.map((document) =>
              document.id !== documentId ? document : { ...document, status: "uploaded" as const, uploadedAt: now },
            ),
          },
        ),
      };
      savePortalData(user.id, updatedData);
      setPortalData(updatedData);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the local document status.");
    }
  };

  const simulateNextStatus = (applicationId: string) => {
    const application = portalData.applications.find((item) => item.id === applicationId);
    if (!application) return;
    const currentIndex = progressSteps.indexOf(application.status);
    if (currentIndex < 0 || currentIndex >= progressSteps.length - 1) return;
    const nextStatus = progressSteps[currentIndex + 1];
    const now = new Date().toISOString();
    const updatedData = {
      ...portalData,
      applications: portalData.applications.map((item) => item.id !== applicationId ? item : {
        ...item,
        status: nextStatus,
        submittedAt: nextStatus === "submitted" ? now : item.submittedAt,
        updatedAt: now,
        events: [{ id: newLocalId(), status: nextStatus, note: `Demo status changed to ${nextStatus.replaceAll("_", " ")}.`, createdAt: now }, ...item.events],
      }),
    };
    try {
      savePortalData(user.id, updatedData);
      setPortalData(updatedData);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the local application status.");
    }
  };

  return (
    <>
      <PageTitle
        eyebrow="PASSPORT SERVICES"
        title="My applications"
        description="Follow each application, check document requirements, and review status updates."
        action={<button onClick={() => setShowNewForm((visible) => !visible)} className="rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-white transition hover:bg-brand-700">{showNewForm ? "Cancel" : "Start application"}</button>}
      />
      {error ? <div className="mb-6"><Notice>{error}</Notice></div> : null}
      {showNewForm ? (
        <form onSubmit={createApplication} className="mb-6 rounded-2xl border border-blue-100 bg-white p-5 shadow-card sm:p-6">
          <p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">NEW APPLICATION</p>
          <h2 className="mt-1.5 font-display text-lg font-bold text-ink">Start tracking a passport application</h2>
          <p className="mt-1 text-xs leading-5 text-slate-500">This local demo creates an application checklist only; it does not submit an application to an agency.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <label htmlFor="applicationType" className="sr-only">Application type</label>
            <select id="applicationType" name="applicationType" required defaultValue="" className="min-h-11 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-sm outline-none focus:border-brand-500 focus:bg-white focus:ring-4 focus:ring-blue-100">
              <option value="" disabled>Select application type</option>
              <option>New passport</option>
              <option>Passport renewal</option>
              <option>Replacement passport</option>
            </select>
            <button disabled={saving} type="submit" className="rounded-xl bg-brand-600 px-5 py-3 text-xs font-bold text-white hover:bg-brand-700">{saving ? "Saving…" : "Create application"}</button>
          </div>
        </form>
      ) : null}
      {loading ? <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading your applications…</div> :
        portalData.applications.length === 0 ? <EmptyState title="No applications to show" description="Start an application to create a local checklist and track its progress in this demo." action={<button onClick={() => setShowNewForm(true)} className="rounded-xl bg-brand-600 px-4 py-3 text-xs font-bold text-white hover:bg-brand-700">Start application</button>} /> :
          <div className="space-y-5">
            {portalData.applications.map((application) => {
              const currentStep = progressSteps.indexOf(application.status);
              return (
                <article key={application.id} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
                  <header className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 p-5 sm:p-6">
                    <div>
                      <p className="text-[10px] font-bold tracking-[0.16em] text-brand-600">APPLICATION {application.applicationNumber}</p>
                      <h2 className="mt-2 font-display text-xl font-bold text-ink">{application.applicationType}</h2>
                      <p className="mt-1.5 text-xs text-slate-500">Submitted {formatDate(application.submittedAt)}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={application.status} />
                      {application.status !== "approved" && application.status !== "rejected" ? <button onClick={() => simulateNextStatus(application.id)} className="text-[10px] font-bold text-brand-600 hover:text-brand-700">Simulate next step</button> : null}
                    </div>
                  </header>
                  <div className="grid gap-7 p-5 sm:p-6 lg:grid-cols-[1.2fr_.8fr]">
                    <section>
                      <h3 className="text-sm font-bold text-ink">Application progress</h3>
                      <p className="mt-1 text-xs text-slate-500">{statusDescriptions[application.status] ?? "Your application progress is being updated."}</p>
                      <p className="mt-1 text-[10px] text-slate-400">Status changes here are local demo examples only.</p>
                      {application.status === "rejected" ? (
                        <div className="mt-5 rounded-xl bg-rose-50 p-4 text-xs leading-5 text-rose-800">Please check the status updates or contact support for assistance.</div>
                      ) : (
                        <ol className="mt-6 grid grid-cols-4">
                          {progressSteps.map((step, index) => {
                            const complete = currentStep >= index;
                            return (
                              <li key={step} className="relative text-center">
                                {index < progressSteps.length - 1 ? <span className={`absolute left-1/2 top-4 h-0.5 w-full ${currentStep > index ? "bg-brand-500" : "bg-slate-200"}`} aria-hidden="true" /> : null}
                                <span className={`relative mx-auto grid h-8 w-8 place-items-center rounded-full border text-xs font-bold ${complete ? "border-brand-600 bg-brand-600 text-white" : "border-slate-200 bg-white text-slate-400"}`}>{complete ? "✓" : index + 1}</span>
                                <span className={`relative mt-2 block text-[10px] font-semibold capitalize sm:text-xs ${complete ? "text-ink" : "text-slate-400"}`}>{step.replaceAll("_", " ")}</span>
                              </li>
                            );
                          })}
                        </ol>
                      )}
                      <div className="mt-8 border-t border-slate-100 pt-5">
                        <h3 className="text-sm font-bold text-ink">Latest updates</h3>
                        {application.events.length === 0 ? <p className="mt-3 text-xs text-slate-500">No status updates are available yet.</p> :
                          <ol className="mt-4 space-y-4">
                            {application.events.map((eventItem) => (
                              <li key={eventItem.id} className="flex gap-3">
                                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-brand-500" />
                                <div><p className="text-xs font-semibold capitalize text-ink">{eventItem.status.replaceAll("_", " ")}</p><p className="mt-1 text-xs leading-5 text-slate-500">{eventItem.note}</p><time className="mt-1 block text-[10px] text-slate-400">{formatDate(eventItem.createdAt)}</time></div>
                              </li>
                            ))}
                          </ol>}
                      </div>
                    </section>
                    <section className="rounded-xl bg-slate-50 p-4 sm:p-5">
                      <div className="flex items-start justify-between gap-2">
                        <div><h3 className="text-sm font-bold text-ink">Document progress</h3><p className="mt-1 text-xs text-slate-500">Required supporting documents</p></div>
                        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-semibold text-slate-500">{application.documents.filter((document) => document.status === "verified").length}/{application.documents.length} verified</span>
                      </div>
                      <Notice tone="info">Demo checklist only: files are not uploaded or stored by this page.</Notice>
                      {application.documents.length === 0 ? <p className="mt-5 rounded-lg border border-dashed border-slate-200 bg-white px-3 py-4 text-xs leading-5 text-slate-500">No document checklist has been added to this application yet.</p> :
                        <ul className="mt-4 divide-y divide-slate-200/70">
                          {application.documents.map((document) => (
                            <li key={document.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                              <div className="min-w-0"><p className="truncate text-xs font-semibold capitalize text-ink">{document.documentType.replaceAll("_", " ")}</p><p className="mt-1 truncate text-[10px] text-slate-500">{document.fileName || "No file attached"}</p></div>
                              <div className="flex shrink-0 items-center gap-2"><StatusBadge status={document.status} />{document.status === "required" ? <button onClick={() => simulateDocumentProgress(application.id, document.id)} className="text-[10px] font-bold text-brand-600 hover:text-brand-700">Simulate</button> : null}</div>
                            </li>
                          ))}
                        </ul>}
                    </section>
                  </div>
                </article>
              );
            })}
          </div>}
    </>
  );
}
