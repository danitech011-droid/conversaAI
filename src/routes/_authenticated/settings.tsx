import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, KeyRound, Loader2, Monitor, Moon, Palette, Sun, UserCog } from "lucide-react";
import { toast } from "sonner";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { SelectInput, TextInput } from "@/components/knowledge/kb-ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { INDUSTRIES } from "@/lib/onboarding-options";
import { useTheme } from "@/lib/theme";
import { useUiMode } from "@/lib/ui-mode";

export const Route = createFileRoute("/_authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings — ConversaAI" },
      {
        name: "description",
        content:
          "Manage your ConversaAI profile, organisation details, password and appearance preferences.",
      },
      { property: "og:title", content: "Settings — ConversaAI" },
      { property: "og:description", content: "Profile, organisation and appearance settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SettingsPage,
});

const INDUSTRY_OPTIONS = INDUSTRIES.map((industry) => ({ value: industry, label: industry }));

function SettingsPage() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const { mode: uiMode, setMode: setUiMode } = useUiMode();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [org, setOrg] = useState({ company_name: "", industry: INDUSTRIES[0] as string });
  const [password, setPassword] = useState({ next: "", confirm: "" });

  const { data: profile } = useQuery({
    queryKey: ["settings", "profile", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  const { data: business } = useQuery({
    queryKey: ["settings", "business", user?.id],
    enabled: Boolean(user?.id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, company_name, industry")
        .eq("owner_id", user!.id)
        .maybeSingle();
      if (error) throw new Error(error.message);
      return data;
    },
  });

  useEffect(() => {
    if (profile?.full_name) setName(profile.full_name);
  }, [profile?.full_name]);

  useEffect(() => {
    if (business) {
      setOrg({
        company_name: business.company_name ?? "",
        industry: business.industry ?? (INDUSTRIES[0] as string),
      });
    }
  }, [business]);

  const saveProfile = useMutation({
    mutationFn: async () => {
      const fullName = name.trim();
      if (!fullName) throw new Error("Please enter your name.");
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName })
        .eq("id", user!.id);
      if (error) throw new Error(error.message);
      await supabase.auth.updateUser({ data: { full_name: fullName } });
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["settings", "profile"] });
    },
    onError: (error: Error) => toast.error("Couldn't save profile", { description: error.message }),
  });

  const saveOrg = useMutation({
    mutationFn: async () => {
      const companyName = org.company_name.trim();
      if (!companyName) throw new Error("Company name is required.");
      const payload = { company_name: companyName, industry: org.industry };
      const { error } = business?.id
        ? await supabase.from("businesses").update(payload).eq("id", business.id)
        : await supabase.from("businesses").insert({ ...payload, owner_id: user!.id });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Organisation updated");
      queryClient.invalidateQueries({ queryKey: ["settings", "business"] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
      queryClient.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (error: Error) =>
      toast.error("Couldn't save organisation", { description: error.message }),
  });

  const changePassword = useMutation({
    mutationFn: async () => {
      if (password.next.length < 8) throw new Error("Use at least 8 characters.");
      if (password.next !== password.confirm) throw new Error("Passwords don't match.");
      const { error } = await supabase.auth.updateUser({ password: password.next });
      if (error) throw new Error(error.message);
    },
    onSuccess: () => {
      toast.success("Password updated");
      setPassword({ next: "", confirm: "" });
    },
    onError: (error: Error) =>
      toast.error("Couldn't update password", { description: error.message }),
  });

  return (
    <DashboardLayout title="Settings" description="Profile, organisation and appearance">
      <div className="grid gap-6 lg:grid-cols-2">
        <SettingsCard icon={UserCog} title="Your profile">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Email</Label>
            <Input value={user?.email ?? ""} readOnly className="bg-surface" />
          </div>
          <TextInput label="Full name" value={name} onChange={setName} placeholder="Ada Lovelace" />
          <Button onClick={() => saveProfile.mutate()} disabled={saveProfile.isPending} className="gap-2">
            {saveProfile.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save profile
          </Button>
        </SettingsCard>

        <SettingsCard icon={Building2} title="Organisation">
          <TextInput
            label="Company name"
            value={org.company_name}
            onChange={(value) => setOrg({ ...org, company_name: value })}
            placeholder="ConversaAI Ltd"
          />
          <SelectInput
            label="Industry"
            value={org.industry}
            onChange={(value) => setOrg({ ...org, industry: value })}
            options={INDUSTRY_OPTIONS}
          />
          <p className="text-xs text-muted-foreground">
            You are the owner of this workspace. Team members and roles arrive with the shared inbox.
          </p>
          <Button onClick={() => saveOrg.mutate()} disabled={saveOrg.isPending} className="gap-2">
            {saveOrg.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Save organisation
          </Button>
        </SettingsCard>

        <SettingsCard icon={KeyRound} title="Password">
          <TextInput
            label="New password"
            type="password"
            value={password.next}
            onChange={(value) => setPassword({ ...password, next: value })}
            placeholder="At least 8 characters"
          />
          <TextInput
            label="Confirm new password"
            type="password"
            value={password.confirm}
            onChange={(value) => setPassword({ ...password, confirm: value })}
          />
          <Button
            variant="outline"
            onClick={() => changePassword.mutate()}
            disabled={changePassword.isPending}
            className="gap-2"
          >
            {changePassword.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            Update password
          </Button>
        </SettingsCard>

        <SettingsCard icon={Palette} title="Appearance">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-[18px] w-[18px] text-muted-foreground" />
              ) : (
                <Sun className="h-[18px] w-[18px] text-muted-foreground" />
              )}
              <div>
                <p className="text-sm font-medium text-foreground">
                  {theme === "dark" ? "Dark" : "Light"} mode
                </p>
                <p className="text-xs text-muted-foreground">Applies across your workspace</p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              aria-label="Toggle dark mode"
            />
          </div>
          <div className="mt-3 rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm font-medium text-foreground">Interface style</p>
            <p className="mb-3 text-xs text-muted-foreground">
              Premium adds depth, gradients and glass surfaces. Standard is flat and compact.
            </p>
            <div className="grid grid-cols-2 gap-2">
              {(["premium", "standard"] as const).map((option) => (
                <Button
                  key={option}
                  variant={uiMode === option ? "default" : "outline"}
                  onClick={() => setUiMode(option)}
                  className="capitalize"
                >
                  {option}
                </Button>
              ))}
            </div>
          </div>
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <Monitor className="h-3.5 w-3.5" />
            More workspace settings arrive alongside channels and billing.
          </p>
        </SettingsCard>
      </div>
    </DashboardLayout>
  );
}

function SettingsCard({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserCog;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-[18px] w-[18px]" />
        </span>
        <h2 className="text-base font-semibold text-foreground">{title}</h2>
      </div>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}
