import { AdminShell } from "@/components/admin-layout"

export default function SuperAdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>
}
