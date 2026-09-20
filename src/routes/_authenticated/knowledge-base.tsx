import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Building2 } from "lucide-react";

import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { CompanyInfoTab } from "@/components/knowledge/CompanyInfoTab";
import { FaqsTab } from "@/components/knowledge/FaqsTab";
import { GeneralTab } from "@/components/knowledge/GeneralTab";
import { ImagesTab } from "@/components/knowledge/ImagesTab";
import { KbTransfer } from "@/components/knowledge/KbTransfer";
import { KbUnifiedHub } from "@/components/knowledge/KbUnifiedHub";
import { ProductsTab } from "@/components/knowledge/ProductsTab";
import { PropertiesTab } from "@/components/knowledge/PropertiesTab";
import { ServicesTab } from "@/components/knowledge/ServicesTab";
import type { KnowledgeFilter, KnowledgeListItem } from "@/lib/knowledge/types";

type KbSearch = { tab: string; new: boolean };

export const Route = createFileRoute("/_authenticated/knowledge-base")({
  validateSearch: (search: Record<string, unknown>): KbSearch => ({
    tab: typeof search["tab"] === "string" ? search["tab"] : "all",
    new: search["new"] === true || search["new"] === "true",
  }),
  head: () => ({
    meta: [
      { title: "Knowledge Base — ConversaAI" },
      {
        name: "description",
        content:
          "Manage the information your AI assistant uses to answer customers accurately.",
      },
      { property: "og:title", content: "Knowledge Base — ConversaAI" },
      {
        property: "og:description",
        content: "Everything ConversaAI knows about your organization lives here.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: KnowledgeBasePage,
});

const MANAGE_TAB: Record<KnowledgeListItem["entity"], KnowledgeFilter> = {
  general: "general",
  faqs: "faqs",
  products: "products",
  services: "services",
  images: "images",
  properties: "properties",
};

function KnowledgeBasePage() {
  const { tab, new: autoCreate } = Route.useSearch();
  const navigate = useNavigate();
  const active = isKnowledgeFilter(tab) ? tab : "all";

  const setTab = (value: KnowledgeFilter, create = false) => {
    navigate({
      to: "/knowledge-base",
      search: { tab: value, new: create },
      replace: true,
    });
  };

  function handleManage(item: KnowledgeListItem) {
    setTab(MANAGE_TAB[item.entity], false);
  }

  return (
    <DashboardLayout
      title="Knowledge Base"
      description="Teach ConversaAI about your organization"
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Everything your AI knows about this organization lives here.
        </p>
        <KbTransfer />
      </div>

      <KbUnifiedHub
        filter={active === "company" ? "all" : active}
        onFilterChange={setTab}
        onManage={handleManage}
        onAddType={(type) => setTab(type, true)}
      />

      {active !== "all" ? (
        <div className="mt-8 border-t border-border pt-8">
          {active === "general" ? <GeneralTab autoCreate={autoCreate} /> : null}
          {active === "faqs" ? <FaqsTab autoCreate={autoCreate} /> : null}
          {active === "products" ? <ProductsTab autoCreate={autoCreate} /> : null}
          {active === "services" ? <ServicesTab autoCreate={autoCreate} /> : null}
          {active === "images" ? <ImagesTab autoCreate={autoCreate} /> : null}
          {active === "properties" ? <PropertiesTab autoCreate={autoCreate} /> : null}
          {active === "company" ? <CompanyInfoTab /> : null}
        </div>
      ) : (
        <details className="mt-8 rounded-xl border border-border bg-card p-4">
          <summary className="flex cursor-pointer list-none items-center gap-2 text-sm font-medium text-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            Company profile & properties
          </summary>
          <div className="mt-4 space-y-8 border-t border-border pt-6">
            <CompanyInfoTab />
            <PropertiesTab />
          </div>
        </details>
      )}
    </DashboardLayout>
  );
}

function isKnowledgeFilter(value: string): value is KnowledgeFilter {
  return [
    "all",
    "general",
    "faqs",
    "products",
    "services",
    "images",
    "properties",
    "company",
  ].includes(value);
}
