import { supabase } from "@/integrations/supabase/client";
import { logAudit } from "@/lib/workspace/api";

export type InstallationStatus = "draft" | "active" | "disabled" | "verification_pending";

export interface WebsiteInstallation {
  id: string;
  owner_id: string;
  agent_id: string | null;
  public_installation_id: string;
  website_url: string;
  domain: string;
  status: InstallationStatus;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
}

function getDomain(websiteUrl: string): string {
  try {
    return new URL(websiteUrl).hostname.toLowerCase();
  } catch {
    throw new Error("Enter a valid website URL, including https://.");
  }
}

export async function listWebsiteInstallations(): Promise<WebsiteInstallation[]> {
  const { data, error } = await supabase
    .from("website_installations")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as WebsiteInstallation[];
}

export async function createWebsiteInstallation(input: {
  websiteUrl: string;
}): Promise<WebsiteInstallation> {
  const websiteUrl = input.websiteUrl.trim().replace(/\/$/, "");
  const domain = getDomain(websiteUrl);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError || !userData.user) throw new Error("You need to be signed in.");
  const { data, error } = await supabase
    .from("website_installations")
    .insert({
      owner_id: userData.user.id,
      website_url: websiteUrl,
      domain,
      status: "active",
      is_active: true,
    })
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  await logAudit({
    action: "website_installation.created",
    area: "channels",
    summary: `Connected website ${domain}`,
    metadata: { domain },
  });
  return data as WebsiteInstallation;
}

export async function setWebsiteInstallationActive(
  installation: WebsiteInstallation,
  isActive: boolean,
): Promise<void> {
  const status: InstallationStatus = isActive ? "active" : "disabled";
  const { error } = await supabase
    .from("website_installations")
    .update({ is_active: isActive, status })
    .eq("id", installation.id);
  if (error) throw new Error(error.message);
}

export function getWidgetScriptUrl(): string {
  const configured = import.meta.env["VITE_PUBLIC_APP_URL"] as string | undefined;
  return `${(configured || window.location.origin).replace(/\/$/, "")}/widget.js`;
}

export function getEmbedCode(installation: WebsiteInstallation): string {
  return `<script src="${getWidgetScriptUrl()}" data-conversa-installation="${installation.public_installation_id}" async></script>`;
}