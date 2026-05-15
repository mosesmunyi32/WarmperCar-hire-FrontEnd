"use client";

import { useEffect, useState } from "react";
import { Search, Shield, UserMinus, XCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { superAdminService } from "@/services/superAdminService";
import { customerServices } from "@/services/customerServices";
import { UserResponse } from "@/types";

function TableSkeleton() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <tr key={i} className="border-b border-light-gray animate-pulse">
          {[0, 1, 2, 3, 4, 5, 6].map((j) => (
            <td key={j} className="px-4 py-3">
              <div className="h-3.5 bg-light-gray rounded w-20" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

export default function ManageAdminsPage() {
  const [admins, setAdmins] = useState<UserResponse[]>([]);
  const [customers, setCustomers] = useState<UserResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  // Promote section
  const [customerSearch, setCustomerSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<UserResponse | null>(
    null,
  );
  const [showDropdown, setShowDropdown] = useState(false);
  const [promoting, setPromoting] = useState(false);

  useEffect(() => {
    Promise.all([
      superAdminService.getAllAdmins(),
      customerServices.getAllCustomers(),
    ])
      .then(([adminList, customerList]) => {
        setAdmins(adminList);
        // Exclude existing admins from the promotable list
        const adminIds = new Set(adminList.map((a) => a.id));
        setCustomers(customerList.filter((c) => !adminIds.has(c.id)));
      })
      .catch(() => setError("Failed to load data. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const handleRevoke = async (id: string, name: string) => {
    setActionId(id);
    setError(null);
    try {
      await superAdminService.revokeAdminRole(id);
      setAdmins((prev) => prev.filter((a) => a.id !== id));
      setSuccess(`Admin role revoked for ${name}.`);
      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError("Failed to revoke admin role.");
    } finally {
      setActionId(null);
    }
  };

  const handlePromote = async () => {
    if (!selectedCustomer) return;
    setPromoting(true);
    setError(null);
    try {
      await superAdminService.assignAdminRole(selectedCustomer.id);
      const updated = await superAdminService.getAllAdmins();
      setAdmins(updated);
      setCustomers((prev) => prev.filter((c) => c.id !== selectedCustomer.id));
      setSelectedCustomer(null);
      setCustomerSearch("");
      setSuccess(
        `${selectedCustomer.firstName} ${selectedCustomer.lastName} promoted to admin.`,
      );
      setTimeout(() => setSuccess(null), 4000);
    } catch {
      setError("Failed to promote user. Please try again.");
    } finally {
      setPromoting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActionId(id + "-deact");
    try {
      await customerServices.deactivateUser(id);
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: false } : a)),
      );
    } catch {
      setError("Failed to deactivate admin.");
    } finally {
      setActionId(null);
    }
  };

  const handleActivate = async (id: string) => {
    setActionId(id + "-act");
    try {
      await customerServices.activateUser(id);
      setAdmins((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isActive: true } : a)),
      );
    } catch {
      setError("Failed to activate admin.");
    } finally {
      setActionId(null);
    }
  };

  const filtered = admins.filter((a) => {
    const q = search.toLowerCase();
    return `${a.firstName} ${a.lastName} ${a.email}`.toLowerCase().includes(q);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-navy">Manage Admins</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {loading
              ? "Loading..."
              : `${admins.length} admin account${admins.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search admins..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9 bg-white"
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-danger/10 border border-danger/20 text-danger text-sm rounded-xl px-4 py-3 mb-4">
          <XCircle className="h-4 w-4 shrink-0" /> {error}
          <button
            className="ml-auto text-xs underline"
            onClick={() => setError(null)}
          >
            Dismiss
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-3 bg-success/10 border border-success/20 text-success text-sm rounded-xl px-4 py-3 mb-4">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
        </div>
      )}

      {/* Promote section */}
      <div className="bg-white rounded-xl border border-light-gray p-5 shadow-sm mb-5">
        <h2 className="font-semibold text-navy text-sm mb-3 flex items-center gap-2">
          <Shield className="h-4 w-4 text-royal" /> Promote Customer to Admin
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Search for a customer by name or email to grant them admin privileges.
        </p>
        <div className="flex gap-3 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              value={customerSearch}
              onChange={(e) => {
                setCustomerSearch(e.target.value);
                setSelectedCustomer(null);
                setShowDropdown(true);
              }}
              onFocus={() => setShowDropdown(true)}
              placeholder="Search by name or email..."
              className="h-9 text-sm pl-9"
            />
            {showDropdown && customerSearch.trim() && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-light-gray rounded-xl shadow-lg max-h-52 overflow-y-auto">
                {customers
                  .filter((c) =>
                    `${c.firstName} ${c.lastName} ${c.email}`
                      .toLowerCase()
                      .includes(customerSearch.toLowerCase()),
                  )
                  .slice(0, 7)
                  .map((c) => (
                    <button
                      key={c.id}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => {
                        setSelectedCustomer(c);
                        setCustomerSearch(`${c.firstName} ${c.lastName}`);
                        setShowDropdown(false);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-off-white text-left transition-colors"
                    >
                      <div className="h-7 w-7 rounded-full bg-navy/10 flex items-center justify-center text-navy text-xs font-bold shrink-0">
                        {c.firstName?.[0]}
                        {c.lastName?.[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-navy truncate">
                          {c.firstName} {c.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {c.email}
                        </p>
                      </div>
                    </button>
                  ))}
                {customers.filter((c) =>
                  `${c.firstName} ${c.lastName} ${c.email}`
                    .toLowerCase()
                    .includes(customerSearch.toLowerCase()),
                ).length === 0 && (
                  <p className="px-4 py-3 text-xs text-muted-foreground">
                    No customers found.
                  </p>
                )}
              </div>
            )}
          </div>
          <Button
            onClick={handlePromote}
            disabled={promoting || !selectedCustomer}
            className="bg-navy hover:bg-royal h-9 px-4 text-sm shrink-0"
          >
            {promoting ? "Promoting..." : "Promote"}
          </Button>
        </div>
        {selectedCustomer && (
          <p className="text-xs text-success mt-2">
            Selected:{" "}
            <span className="font-medium">
              {selectedCustomer.firstName} {selectedCustomer.lastName}
            </span>{" "}
            — {selectedCustomer.email}
          </p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-light-gray shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-light-gray bg-off-white">
                {[
                  "Admin",
                  "Email",
                  "Phone",
                  "Role",
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
                    colSpan={7}
                    className="px-4 py-8 text-center text-muted-foreground text-sm"
                  >
                    {search
                      ? "No admins match your search."
                      : "No admin accounts yet."}
                  </td>
                </tr>
              ) : (
                filtered.map((a) => {
                  const revokeBusy = actionId === a.id;
                  const deactBusy = actionId === a.id + "-deact";
                  const actBusy = actionId === a.id + "-act";
                  return (
                    <tr key={a.id} className="hover:bg-off-white">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-royal flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {a.firstName?.[0]}
                            {a.lastName?.[0]}
                          </div>
                          <span className="font-medium text-navy">
                            {a.firstName} {a.lastName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {a.email}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {a.phoneNumber ?? "—"}
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-royal bg-royal/10 px-2 py-0.5 rounded-full border border-royal/20">
                          {a.role ?? "ADMIN"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            a.isActive
                              ? "bg-success/10 text-success"
                              : "bg-danger/10 text-danger"
                          }`}
                        >
                          {a.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {a.createdAt
                          ? new Date(a.createdAt).toLocaleDateString("en-KE", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          {a.isActive ? (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={deactBusy}
                              onClick={() => handleDeactivate(a.id)}
                              className="h-7 text-xs border-warning/30 text-warning"
                            >
                              {deactBusy ? "..." : "Deactivate"}
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={actBusy}
                              onClick={() => handleActivate(a.id)}
                              className="h-7 text-xs border-success/30 text-success"
                            >
                              {actBusy ? "..." : "Activate"}
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={revokeBusy}
                            onClick={() =>
                              handleRevoke(a.id, `${a.firstName} ${a.lastName}`)
                            }
                            className="h-7 text-xs border-danger/30 text-danger gap-1"
                          >
                            <UserMinus className="h-3 w-3" />
                            {revokeBusy ? "..." : "Revoke"}
                          </Button>
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
