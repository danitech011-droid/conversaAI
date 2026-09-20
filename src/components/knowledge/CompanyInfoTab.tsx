import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { TextAreaInput, TextInput } from "@/components/knowledge/kb-ui";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanyInfo, saveCompanyInfo } from "@/lib/knowledge/api";
import type { CompanyInfo } from "@/lib/knowledge/types";

const EMPTY = {
  company_name: "",
  description: "",
  mission: "",
  business_hours: "",
  phone: "",
  business_email: "",
  website: "",
  address: "",
  social_facebook: "",
  social_instagram: "",
  social_twitter: "",
  social_linkedin: "",
  social_tiktok: "",
};

type FormState = typeof EMPTY;

function toForm(info: CompanyInfo | null): FormState {
  if (!info) return EMPTY;
  return {
    company_name: info.company_name ?? "",
    description: info.description ?? "",
    mission: info.mission ?? "",
    business_hours: info.business_hours ?? "",
    phone: info.phone ?? "",
    business_email: info.business_email ?? "",
    website: info.website ?? "",
    address: info.address ?? "",
    social_facebook: info.social_facebook ?? "",
    social_instagram: info.social_instagram ?? "",
    social_twitter: info.social_twitter ?? "",
    social_linkedin: info.social_linkedin ?? "",
    social_tiktok: info.social_tiktok ?? "",
  };
}

export function CompanyInfoTab() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<FormState>(EMPTY);

  const { data, isLoading } = useQuery({ queryKey: ["kb", "company"], queryFn: getCompanyInfo });

  useEffect(() => {
    if (data !== undefined) setForm(toForm(data));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      saveCompanyInfo({
        ...(data?.id ? { id: data.id } : {}),
        ...form,
      }),
    onSuccess: () => {
      toast.success("Company information saved");
      queryClient.invalidateQueries({ queryKey: ["kb"] });
    },
    onError: (error: Error) => toast.error("Couldn't save", { description: error.message }),
  });

  const set = (key: keyof FormState) => (value: string) =>
    setForm((current) => ({ ...current, [key]: value }));

  if (isLoading) return <Skeleton className="h-96 w-full rounded-2xl" />;

  return (
    <div className="animate-fade-in space-y-6">
      <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-sm font-semibold text-foreground">Company profile</h3>
        <div className="mt-4 space-y-4">
          <TextInput label="Company name" value={form.company_name} onChange={set("company_name")} />
          <TextAreaInput label="Description" value={form.description} onChange={set("description")} />
          <TextAreaInput label="Mission" value={form.mission} onChange={set("mission")} rows={3} />
          <TextInput
            label="Business hours"
            value={form.business_hours}
            onChange={set("business_hours")}
            placeholder="Mon–Fri, 9:00–18:00"
          />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-sm font-semibold text-foreground">Contact</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextInput label="Phone" value={form.phone} onChange={set("phone")} />
          <TextInput label="Email" value={form.business_email} onChange={set("business_email")} />
          <TextInput label="Website" value={form.website} onChange={set("website")} />
          <TextInput label="Address" value={form.address} onChange={set("address")} />
        </div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
        <h3 className="text-sm font-semibold text-foreground">Social links</h3>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextInput label="Facebook" value={form.social_facebook} onChange={set("social_facebook")} />
          <TextInput
            label="Instagram"
            value={form.social_instagram}
            onChange={set("social_instagram")}
          />
          <TextInput label="X / Twitter" value={form.social_twitter} onChange={set("social_twitter")} />
          <TextInput label="LinkedIn" value={form.social_linkedin} onChange={set("social_linkedin")} />
          <TextInput label="TikTok" value={form.social_tiktok} onChange={set("social_tiktok")} />
        </div>
      </section>

      <div className="flex justify-end">
        <Button
          className="h-11 gap-2"
          disabled={saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Save company information
        </Button>
      </div>
    </div>
  );
}
