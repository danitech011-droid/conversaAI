import { supabase } from "@/integrations/supabase/client";

/** Workspace data-access layer: members, channels and the audit trail. */

export type MemberRole = "owner" | "admin" | "agent" | "viewer";
export type MemberStatus = "active" | "invited" | "disabled";

export interface OrgMember {
  id: string;
  owner_id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  invited_at: string;
  created_at: string;
  updated_at: string;
}

export interface Channel {
  id: string;
  owner_id: string;
  channel_type: string;
  display_name: string;
  status: string;
  config: Record<string, string>;
  created_at: string;
  updated_at: string;
}

export interface AuditEntry {
  id: string;
  owner_id: string;
  actor_email: string | null;
  action: string;
  area: string;
  summary: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export const MEMBER_ROLES = [
  { value: "owner", label: "Owner" },
  { value: "admin", label: "Admin" },
  { value: "agent", label: "Agent" },
  { value: "viewer", label: "Viewer" },
] as const;

export const MEMBER_STATUSES = [
  { value: "active", label: "Active" },
  { value: "invited", label: "Invited" },
  { value: "disabled", label: "Disabled" },
] as const;

export const ROLE_DESCRIPTIONS: Record<string, string> = {
  owner: "Full access, including billing and workspace deletion.",
  admin: "Manage knowledge base, channels and team members.",
  agent: "Handle conversations and edit knowledge base entries.",
  viewer: "Read-only access to the dashboard and analytics.",
};

async function requireUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) throw new Error("You need to be signed in.");
  return data.user;
}

/* ------------------------------- Audit ---------------------------------- */

export async function logAudit(input: {
  action: string;
  area: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    const user = await requireUser();
    await supabase.from("audit_logs").insert({
      owner_id: user.id,
      actor_email: user.email ?? null,
      action: input.action,
      area: input.area,
      summary: input.summary,
      metadata: (input.metadata ?? {}) as never,
    });
  } catch {
    /* auditing must never break the user flow */
  }
}

export async function listAuditEntries(limit = 200): Promise<AuditEntry[]> {
  const { data, error } = await supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as AuditEntry[];
}

export async function clearAuditEntries(): Promise<void> {
  const user = await requireUser();
  const { error } = await supabase.from("audit_logs").delete().eq("owner_id", user.id);
  if (error) throw new Error(error.message);
}

/* ------------------------------ Members --------------------------------- */

export async function listMembers(): Promise<OrgMember[]> {
  const { data, error } = await supabase
    .from("org_members")
    .select("*")
    .order("created_at", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as OrgMember[];
}

export async function saveMember(
  input: { id?: string; email: string; full_name: string; role: string; status: string },
): Promise<void> {
  const user = await requireUser();
  const email = input.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Enter a valid email address.");

  const payload = {
    owner_id: user.id,
    email,
    full_name: input.full_name.trim() || null,
    role: input.role,
    status: input.status,
  };

  const { error } = input.id
    ? await supabase.from("org_members").update(payload).eq("id", input.id)
    : await supabase.from("org_members").insert(payload);
  if (error) {
    throw new Error(
      error.message.includes("duplicate") ? "That email is already in the workspace." : error.message,
    );
  }

  await logAudit({
    action: input.id ? "member.updated" : "member.invited",
    area: "team",
    summary: `${input.id ? "Updated" : "Invited"} ${email} as ${input.role}`,
    metadata: { email, role: input.role, status: input.status },
  });
}

export async function removeMember(member: OrgMember): Promise<void> {
  const { error } = await supabase.from("org_members").delete().eq("id", member.id);
  if (error) throw new Error(error.message);
  await logAudit({
    action: "member.removed",
    area: "team",
    summary: `Removed ${member.email} from the workspace`,
    metadata: { email: member.email },
  });
}

/* ------------------------------ Channels -------------------------------- */

export interface ChannelField {
  key: string;
  label: string;
  placeholder: string;
  secret?: boolean;
  textarea?: boolean;
}

export interface ChannelDefinition {
  type: string;
  name: string;
  tagline: string;
  fields: ChannelField[];
}

export const CHANNEL_DEFINITIONS: ChannelDefinition[] = [
  {
    type: "whatsapp",
    name: "WhatsApp Business",
    tagline: "Answer customers on the app they already use.",
    fields: [
      { key: "phone_number", label: "Business phone number", placeholder: "+234 800 000 0000" },
      { key: "phone_number_id", label: "Phone number ID", placeholder: "1029384756" },
      { key: "access_token", label: "Access token", placeholder: "EAAG…", secret: true },
    ],
  },
  {
    type: "web",
    name: "Website widget",
    tagline: "Embed the assistant on any page of your site.",
    fields: [
      { key: "site_url", label: "Website URL", placeholder: "https://yourbusiness.com" },
      { key: "greeting", label: "Welcome message", placeholder: "Hi! How can we help?", textarea: true },
    ],
  },
  {
    type: "instagram",
    name: "Instagram DMs",
    tagline: "Reply to direct messages and story replies.",
    fields: [
      { key: "handle", label: "Instagram handle", placeholder: "@yourbusiness" },
      { key: "page_token", label: "Page access token", placeholder: "IGQV…", secret: true },
    ],
  },
  {
    type: "messenger",
    name: "Facebook Messenger",
    tagline: "Handle Page conversations automatically.",
    fields: [
      { key: "page_id", label: "Facebook Page ID", placeholder: "1029384756" },
      { key: "page_token", label: "Page access token", placeholder: "EAAG…", secret: true },
    ],
  },
  {
    type: "telegram",
    name: "Telegram",
    tagline: "Run a branded support bot on Telegram.",
    fields: [
      { key: "bot_username", label: "Bot username", placeholder: "@yourbusiness_bot" },
      { key: "bot_token", label: "Bot token", placeholder: "123456:ABC…", secret: true },
    ],
  },
  {
    type: "email",
    name: "Email inbox",
    tagline: "Turn support emails into assisted replies.",
    fields: [
      { key: "inbox", label: "Support inbox", placeholder: "support@yourbusiness.com" },
      { key: "forwarding", label: "Forwarding address", placeholder: "inbox@conversaai.app" },
    ],
  },
];

export async function listChannels(): Promise<Channel[]> {
  const { data, error } = await supabase.from("channels").select("*");
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as Channel[];
}

export async function saveChannel(input: {
  id?: string;
  channel_type: string;
  display_name: string;
  status: string;
  config: Record<string, string>;
}): Promise<void> {
  const user = await requireUser();
  const payload = {
    owner_id: user.id,
    channel_type: input.channel_type,
    display_name: input.display_name,
    status: input.status,
    config: input.config as never,
  };
  const { error } = input.id
    ? await supabase.from("channels").update(payload).eq("id", input.id)
    : await supabase.from("channels").insert(payload);
  if (error) throw new Error(error.message);

  await logAudit({
    action: input.status === "connected" ? "channel.connected" : "channel.updated",
    area: "channels",
    summary: `${input.display_name} marked ${input.status}`,
    metadata: { channel: input.channel_type, status: input.status },
  });
}

export async function disconnectChannel(channel: Channel): Promise<void> {
  const { error } = await supabase
    .from("channels")
    .update({ status: "disconnected" })
    .eq("id", channel.id);
  if (error) throw new Error(error.message);
  await logAudit({
    action: "channel.disconnected",
    area: "channels",
    summary: `${channel.display_name} disconnected`,
    metadata: { channel: channel.channel_type },
  });
}

/* --------------------------- Channel diagnostics ------------------------- */

export type CheckStatus = "pass" | "warn" | "fail";

export interface ChannelCheck {
  label: string;
  status: CheckStatus;
  detail: string;
}

export interface ChannelTestResult {
  ok: boolean;
  checks: ChannelCheck[];
  latencyMs: number;
  testedAt: string;
}

const URL_RE = /^https?:\/\/[^\s.]+\.[^\s]{2,}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

function checkField(field: ChannelField, raw: string): ChannelCheck {
  const value = raw.trim();
  if (!value) {
    return { label: field.label, status: "fail", detail: "This value is missing." };
  }
  if (field.key.includes("url") || field.key === "site_url") {
    return URL_RE.test(value)
      ? { label: field.label, status: "pass", detail: "Valid URL." }
      : { label: field.label, status: "fail", detail: "Use a full URL, e.g. https://example.com" };
  }
  if (field.key.includes("inbox") || field.key === "forwarding") {
    return EMAIL_RE.test(value)
      ? { label: field.label, status: "pass", detail: "Valid email address." }
      : { label: field.label, status: "fail", detail: "This doesn't look like an email address." };
  }
  if (field.key.includes("phone_number") && !field.key.includes("id")) {
    return PHONE_RE.test(value)
      ? { label: field.label, status: "pass", detail: "Valid phone number." }
      : { label: field.label, status: "fail", detail: "Include the country code, e.g. +234…" };
  }
  if (field.secret) {
    return value.length >= 16
      ? { label: field.label, status: "pass", detail: "Credential looks well-formed." }
      : { label: field.label, status: "warn", detail: "This token looks unusually short." };
  }
  if (field.key.includes("handle") || field.key.includes("username")) {
    return value.startsWith("@")
      ? { label: field.label, status: "pass", detail: "Handle looks right." }
      : { label: field.label, status: "warn", detail: "Handles usually start with @." };
  }
  return { label: field.label, status: "pass", detail: "Looks good." };
}

/**
 * Runs configuration diagnostics for a channel. Credentials are validated locally —
 * live delivery checks arrive with the messaging engine.
 */
export async function testChannel(
  definition: ChannelDefinition,
  config: Record<string, string>,
): Promise<ChannelTestResult> {
  const started = Date.now();
  const checks = definition.fields.map((field) => checkField(field, config[field.key] ?? ""));
  await new Promise((resolve) => setTimeout(resolve, 550));

  checks.push({
    label: "Delivery endpoint",
    status: "warn",
    detail: "Live message delivery activates when the messaging engine ships.",
  });

  const ok = checks.every((check) => check.status !== "fail");
  const result: ChannelTestResult = {
    ok,
    checks,
    latencyMs: Date.now() - started,
    testedAt: new Date().toISOString(),
  };

  await logAudit({
    action: ok ? "channel.test_passed" : "channel.test_failed",
    area: "channels",
    summary: `${definition.name} configuration test ${ok ? "passed" : "failed"}`,
    metadata: {
      channel: definition.type,
      failures: checks.filter((check) => check.status === "fail").map((check) => check.label),
    },
  });

  return result;
}

/* ---------------------------- Member helpers ----------------------------- */

export async function updateMemberRole(member: OrgMember, role: string): Promise<void> {
  const { error } = await supabase.from("org_members").update({ role }).eq("id", member.id);
  if (error) throw new Error(error.message);
  await logAudit({
    action: "member.role_changed",
    area: "team",
    summary: `${member.email} is now ${role}`,
    metadata: { email: member.email, from: member.role, to: role },
  });
}

export async function resendInvite(member: OrgMember): Promise<void> {
  const { error } = await supabase
    .from("org_members")
    .update({ status: "invited", invited_at: new Date().toISOString() })
    .eq("id", member.id);
  if (error) throw new Error(error.message);
  await logAudit({
    action: "member.invite_resent",
    area: "team",
    summary: `Invitation re-sent to ${member.email}`,
    metadata: { email: member.email },
  });
}
