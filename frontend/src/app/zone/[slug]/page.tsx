import { DashboardClient } from "@/components/DashboardClient";

export default async function ZonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DashboardClient defaultZoneSlug={slug} />;
}
