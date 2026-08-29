import { DraftNavTabs } from "@/components/draft/draft-nav-tabs";

export default async function DraftLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ seasonYear: string }>;
}) {
  const { seasonYear } = await params;
  const year = Number(seasonYear);

  return (
    <div className="flex flex-col gap-4">
      <DraftNavTabs year={year} />
      {children}
    </div>
  );
}
