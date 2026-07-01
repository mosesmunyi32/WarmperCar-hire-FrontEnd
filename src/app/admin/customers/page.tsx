"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, XCircle, CheckCircle2, UserX } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { customerServices } from "@/services/customerServices";
import { UserResponse } from "@/types";

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => (
        <tr key={i} className="border-b border-light-gray animate-pulse">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3.5 bg-light-gray rounded w-20" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function AdminCustomersPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  useEffect(() => {
    customerServices
      .getAllCustomers()
      .then(setCustomers)
      .catch(() => toast.error("Failed to load customers. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleActivate = async (id: string) => {
    setActionId(id);
    try {
      await customerServices.activateUser(id);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: true } : c)),
      );
    } catch {
      toast.error("Failed to activate user.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActionId(id);
    try {
      await customerServices.deactivateUser(id);
      setCustomers((prev) =>
        prev.map((c) => (c.id === id ? { ...c, isActive: false } : c)),
      );
    } catch {
      toast.error("Failed to deactivate user.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = customers.filter((c) => {
    const q = search.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phoneNumber ?? "").toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manage Customers</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading
              ? "Loading..."
              : `${customers.length} registered customer${customers.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-gray bg-off-white">
                {[
                  "Customer",
                  "Email",
                  "Phone",
                  "County",
                  "Verified",
                  "Status",
                  "Joined",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-light-gray">
              {loading ? (
                <TableSkeleton />
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-8 text-center text-muted-foreground text-sm"
                  >
                    {search
                      ? "No customers match your search."
                      : "No customers yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const busy = actionId === c.id;
                  return (
                    <tr
                      key={c.id}
                      className="hover:bg-off-white transition-colors cursor-pointer"
                      onClick={() => router.push(`/admin/customers/${c.id}`)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-royal flex items-center justify-center text-white text-xs font-semibold shrink-0">
                            {c.firstName?.[0]}
                            {c.lastName?.[0]}
                          </div>
                          <span className="font-medium text-navy">
                            {c.firstName} {c.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.phoneNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.county ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        {c.isVerified ? (
                          <span className="flex items-center gap-1 text-xs text-success font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Verified
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-warning font-medium">
                            <XCircle className="h-3.5 w-3.5" />
                            Unverified
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            c.isActive
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {c.isActive ? "Active" : "Blacklisted"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td
                        className="px-4 py-3"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex gap-1.5">
                          {c.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => handleDeactivate(c.id)}
                              className="h-7 text-xs border-danger/30 text-danger hover:bg-danger/5 gap-1"
                            >
                              <UserX className="h-3 w-3" />
                              {busy ? "..." : "Blacklist"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => handleActivate(c.id)}
                              className="h-7 text-xs border-success/30 text-success hover:bg-success/5 gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              {busy ? "..." : "Activate"}
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
