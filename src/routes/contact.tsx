import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, MessageSquare } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { TextField } from "@/components/form/Fields";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact — ConversaAI" },
      {
        name: "description",
        content:
          "Talk to the ConversaAI team about automating customer conversations for your business.",
      },
      { property: "og:title", content: "Contact — ConversaAI" },
      {
        property: "og:description",
        content: "Questions about ConversaAI? Send the team a message.",
      },
    ],
  }),
  component: ContactPage,
});

const contactSchema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100, "Name is too long"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z
    .string()
    .trim()
    .min(10, "Tell us a little more (at least 10 characters)")
    .max(1000, "Message must be under 1000 characters"),
});

type Errors = Partial<Record<keyof z.infer<typeof contactSchema>, string>>;

function ContactPage() {
  const [values, setValues] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = contactSchema.safeParse(values);

    if (!parsed.success) {
      const next: Errors = {};
      for (const issue of parsed.error.issues) {
        next[issue.path[0] as keyof Errors] = issue.message;
      }
      setErrors(next);
      return;
    }

    setErrors({});
    setLoading(true);
    const { name, email, message } = parsed.data;
    const { error } = await supabase.from("website_leads").insert({
      name,
      email,
      message,
      source: "contact_page",
    });
    setLoading(false);

    if (error) {
      toast.error("Message could not be sent", {
        description: "Please try again or email us directly.",
      });
      return;
    }

    setValues({ name: "", email: "", message: "" });
    toast.success("Message sent", {
      description: "Our team will get back to you within one business day.",
    });
  }

  return (
    <PublicLayout>
      <section className="mx-auto grid w-full max-w-6xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Let's talk about your customers
          </h1>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Whether you're evaluating ConversaAI or ready to roll it out, we're happy to help.
          </p>

          <ul className="mt-8 space-y-4 text-sm">
            {[
              { icon: Mail, label: "hello@conversaai.app" },
              { icon: MessageSquare, label: "Average response time: under 4 hours" },
              { icon: MapPin, label: "Remote-first, supporting teams worldwide" },
            ].map((item) => (
              <li key={item.label} className="flex items-center gap-3 text-muted-foreground">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="animate-slide-up space-y-4 rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)] sm:p-8"
        >
          <TextField
            label="Your name"
            value={values.name}
            onChange={(e) => setValues((v) => ({ ...v, name: e.target.value }))}
            error={errors.name}
            autoComplete="name"
            maxLength={100}
          />
          <TextField
            label="Work email"
            type="email"
            value={values.email}
            onChange={(e) => setValues((v) => ({ ...v, email: e.target.value }))}
            error={errors.email}
            autoComplete="email"
            maxLength={255}
          />
          <div className="space-y-1.5">
            <Label htmlFor="contact-message">How can we help?</Label>
            <Textarea
              id="contact-message"
              rows={5}
              maxLength={1000}
              value={values.message}
              aria-invalid={Boolean(errors.message)}
              onChange={(e) => setValues((v) => ({ ...v, message: e.target.value }))}
            />
            {errors.message ? (
              <p className="text-xs font-medium text-destructive">{errors.message}</p>
            ) : null}
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? <Spinner className="h-4 w-4" /> : null}
            Send message
          </Button>
        </form>
      </section>
    </PublicLayout>
  );
}
