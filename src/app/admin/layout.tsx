import { ReactNode } from "react";
import { requireAdminAccess } from "@/lib/admin";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requireAdminAccess();
  return children;
}
