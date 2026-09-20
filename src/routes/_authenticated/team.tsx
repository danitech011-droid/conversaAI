import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Mail, Plus, Search, Send, Shield, Trash2, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SectionCard, StatusPill } from "@/components/dashboard/SectionCard";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { SelectInput, TextInput } from "@/components/knowledge/kb-ui";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import {
  MEMBER_ROLES,
  MEMBER_STATUSES,
  ROLE_DESCRIPTIONS,
  listMembers,
  removeMember,
  resendInvite,
  saveMember,
  updateMemberRole,
  type OrgMember,
} from "@/lib/workspace/api";

export const Route = createFileRoute("/_authenticated/team")({
  head: () => ({
    meta: [
      { title: "Team & roles — ConversaAI" },
      {
        name: "description",
        content: "Invite teammates, assign roles and control who can manage your AI assistant.",
      },
      { property: "og:title", content: "Team & roles — ConversaAI" },
      { property: "og:description", content: "Manage workspace members and permissions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: TeamPage,
});

const EMPTY = { email: "", full_name: "", role: "agent", status: "invited" };

function statusTone(status: string) {
  if (status === "active") return "success";
  if (status === "invited") return "warning";
  return "neutral";
}

function TeamPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<OrgMember | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [pendingDelete, setPendingDelete] = useState<OrgMember | null>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["workspace", "members"],
    queryFn: listMembers,
  });

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return members.filter((member) => {
      if (roleFilter !== "all" && member.role !== roleFilter) return false;
      if (statusFilter !== "all" && member.status !== statusFilter) return false;
      if (!needle) return true;
      return `${member.email} ${member.full_name ?? ""} ${member.role}`
        .toLowerCase()
        .includes(needle);
    });
  }, [members, query, roleFilter, statusFilter]);

  const save = useMutation({
    mutationFn: () => saveMember({ ...form, ...(editing ? { id: editing.id } : {}) }),
    onSuccess: () => {
      toast.success(editing ? "Member updated" : "Invitation recorded");
      setDialogOpen(false);
      setEditing(null);
      setForm(EMPTY);
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't save member", { description: error.message }),
  });

  const remove = useMutation({
    mutationFn: (member: OrgMember) => removeMember(member),
    onSuccess: () => {
      toast.success("Member removed");
      setPendingDelete(null);
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't remove member", { description: error.message }),
  });

  const changeRole = useMutation({
    mutationFn: (input: { member: OrgMember; role: string }) =>
      updateMemberRole(input.member, input.role),
    onSuccess: (_data, input) => {
      toast.success(`Role updated to ${input.role}`);
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't change role", { description: error.message }),
  });

  const resend = useMutation({
    mutationFn: (member: OrgMember) => resendInvite(member),
    onSuccess: () => {
      toast.success("Invitation re-sent");
      queryClient.invalidateQueries({ queryKey: ["workspace"] });
    },
    onError: (error: Error) => toast.error("Couldn't resend invite", { description: error.message }),
  });

  function openCreate() {
    setEditing(null);
    setForm(EMPTY);
    setDialogOpen(true);
  }

  function openEdit(member: OrgMember) {
    setEditing(member);
    setForm({
      email: member.email,
      full_name: member.full_name ?? "",
      role: member.role,
      status: member.status,
    });
    setDialogOpen(true);
  }

  return (
    <DashboardLayout title="Team" description="Members, roles and workspace access">
      <div className="space-y-6">
        <SectionCard
          icon={Users}
          title="Workspace members"
          description="Everyone who can see or manage this ConversaAI workspace."
          actions={
            <Button size="sm" className="gap-2" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Invite member
            </Button>
          }
        >
          <div className="mb-4 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, email or role"
                className="h-11 pl-9"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:w-72">
              <SelectInput
                label="Role"
                value={roleFilter}
                onChange={setRoleFilter}
                options={[
                  { value: "all", label: "All roles" },
                  ...MEMBER_ROLES.map((role) => ({ value: role.value, label: role.label })),
                ]}
              />
              <SelectInput
                label="Status"
                value={statusFilter}
                onChange={setStatusFilter}
                options={[
                  { value: "all", label: "All statuses" },
                  ...MEMBER_STATUSES.map((status) => ({
                    value: status.value,
                    label: status.label,
                  })),
                ]}
              />
            </div>
          </div>


          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            <div className="flex items-center gap-3 bg-surface px-4 py-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {(user?.email ?? "?").slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">{user?.email}</p>
                <p className="text-xs text-muted-foreground">You — workspace owner</p>
              </div>
              <StatusPill tone="info">Owner</StatusPill>
            </div>

            {isLoading && (
              <div className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Loading members…
              </div>
            )}

            {!isLoading &&
              filtered.map((member) => (
                <div key={member.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                    {(member.full_name ?? member.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {member.full_name || member.email}
                    </p>
                    <p className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {member.email}
                    </p>
                  </div>
                  <Select
                    value={member.role}
                    onValueChange={(value) => changeRole.mutate({ member, role: value })}
                  >
                    <SelectTrigger className="h-8 w-[120px] text-xs" aria-label="Member role">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MEMBER_ROLES.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <StatusPill tone={statusTone(member.status)}>{member.status}</StatusPill>
                  <div className="flex items-center gap-1">
                    {member.status !== "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-1.5"
                        disabled={resend.isPending}
                        onClick={() => resend.mutate(member)}
                      >
                        <Send className="h-3.5 w-3.5" />
                        Resend
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(member)}>
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label={`Remove ${member.email}`}
                      onClick={() => setPendingDelete(member)}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                </div>
              ))}

            {!isLoading && filtered.length === 0 && (
              <div className="p-4">
                <EmptyState
                  icon={UserPlus}
                  title={query ? "No members match that search" : "No teammates yet"}
                  description={
                    query
                      ? "Try a different name, email or role."
                      : "Invite colleagues so they can manage the knowledge base and conversations with you."
                  }
                  {...(query ? {} : { actionLabel: "Invite member", onAction: openCreate })}
                />
              </div>
            )}
          </div>
        </SectionCard>

        <SectionCard icon={Shield} title="What each role can do">
          <div className="grid gap-3 sm:grid-cols-2">
            {MEMBER_ROLES.map((role) => (
              <div key={role.value} className="rounded-xl border border-border bg-surface p-4">
                <p className="text-sm font-semibold text-foreground">{role.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {ROLE_DESCRIPTIONS[role.value]}
                </p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit member" : "Invite a teammate"}</DialogTitle>
            <DialogDescription>
              Members appear here immediately. Email delivery arrives with the shared inbox.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <TextInput
              label="Email"
              value={form.email}
              onChange={(value) => setForm({ ...form, email: value })}
              placeholder="teammate@yourbusiness.com"
            />
            <TextInput
              label="Full name"
              value={form.full_name}
              onChange={(value) => setForm({ ...form, full_name: value })}
              placeholder="Ada Lovelace"
            />
            <SelectInput
              label="Role"
              value={form.role}
              onChange={(value) => setForm({ ...form, role: value })}
              options={MEMBER_ROLES.map((role) => ({ value: role.value, label: role.label }))}
            />
            <SelectInput
              label="Status"
              value={form.status}
              onChange={(value) => setForm({ ...form, status: value })}
              options={MEMBER_STATUSES.map((status) => ({
                value: status.value,
                label: status.label,
              }))}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => save.mutate()} disabled={save.isPending} className="gap-2">
              {save.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {editing ? "Save changes" : "Send invite"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(pendingDelete)} onOpenChange={() => setPendingDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this member?</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingDelete?.email} will immediately lose access to this workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => pendingDelete && remove.mutate(pendingDelete)}>
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
