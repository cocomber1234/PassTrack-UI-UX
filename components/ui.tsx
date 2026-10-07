import type { ReactNode } from "react";

export function Brand({ light = false }: { light?: boolean }) {
  return (
    <a href="/dashboard" aria-label="PASSTRACK dashboard" className={`flex items-center gap-3 ${light ? "text-white" : "text-ink"}`}>
      <span className={`grid h-11 w-11 place-items-center rounded-xl font-bold ${light ? "border border-white/20 bg-white/10 text-white" : "border border-blue-100 bg-blue-50 text-brand-600"}`}>
        P
      </span>
      <span>
        <strong className="block text-sm tracking-[0.16em]">PASSTRACK</strong>
        <small className={`mt-0.5 block text-[11px] ${light ? "text-blue-100/80" : "text-slate-500"}`}>Passport services portal</small>
      </span>
    </a>
  );
}

const iconPaths = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8M8 17h8" /></>,
  message: <><path d="M21 11.5a8.5 8.5 0 0 1-12.9 7.3L3 20l1.2-4.2A8.5 8.5 0 1 1 21 11.5Z" /><path d="M8 11h8M8 14h5" /></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6" /></>,
  logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h6a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-6" /></>,
  plus: <><path d="M12 5v14M5 12h14" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  shield: <><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z" /><path d="m9 12 2 2 4-4" /></>,
} as const;

export type IconName = keyof typeof iconPaths;

export function Icon({ name, className = "h-5 w-5" }: { name: IconName; className?: string }) {
  return (
    <svg aria-hidden="true" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      {iconPaths[name]}
    </svg>
  );
}

export function PageTitle({
  eyebrow,
  title,
  description,
  action,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="text-[11px] font-bold tracking-[0.18em] text-brand-600">{eyebrow}</p>
        <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
      {action}
    </div>
  );
}

const statusStyles: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  submitted: "bg-blue-50 text-blue-700",
  under_review: "bg-amber-50 text-amber-700",
  approved: "bg-emerald-50 text-emerald-700",
  rejected: "bg-rose-50 text-rose-700",
  required: "bg-amber-50 text-amber-700",
  uploaded: "bg-blue-50 text-blue-700",
  verified: "bg-emerald-50 text-emerald-700",
  open: "bg-blue-50 text-blue-700",
  in_progress: "bg-amber-50 text-amber-700",
  resolved: "bg-emerald-50 text-emerald-700",
};

export function StatusBadge({ status }: { status: string }) {
  const label = status.replaceAll("_", " ");
  return (
    <span className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusStyles[status] ?? "bg-slate-100 text-slate-600"}`}>
      {label}
    </span>
  );
}

export function Notice({ children, tone = "error" }: { children: ReactNode; tone?: "error" | "info" | "success" }) {
  const toneClass = {
    error: "border-rose-200 bg-rose-50 text-rose-800",
    info: "border-blue-200 bg-blue-50 text-blue-800",
    success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  }[tone];
  return <div role={tone === "error" ? "alert" : "status"} className={`rounded-xl border px-4 py-3 text-sm leading-6 ${toneClass}`}>{children}</div>;
}

export function LoadingState({ label = "Loading your secure portal…" }: { label?: string }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 text-sm text-slate-500" role="status">
      <span className="h-8 w-8 animate-spin rounded-full border-2 border-blue-100 border-t-brand-600" />
      {label}
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="grid justify-items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-2xl text-brand-600">◎</span>
      <h3 className="mt-4 font-display text-lg font-bold text-ink">{title}</h3>
      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "Not submitted";
  return new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(value));
}
