import { PortalShell } from "@/components/auth-context";
import { PortalLayout } from "@/components/portal-layout";

export default function MemberLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <PortalShell>
      <PortalLayout>{children}</PortalLayout>
    </PortalShell>
  );
}
