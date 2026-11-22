import ERPLayout from "@/components/ERPLayout";
import DataWorkspace from "@/components/DataWorkspace";
import RolesPermissionsManager from "@/components/RolesPermissionsManager";
import DashboardOverview from "@/components/DashboardOverview";
import { notFound } from "next/navigation";
import { pages } from "@/lib/pages";

export function generateStaticParams() {
  return pages
    .filter((p) => p.path !== "dashboard")
    .map((p) => ({ slug: p.path.split("/") }));
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = await params;
  const path = slug.join("/");

  if (path === "dashboard") {
    return <DashboardOverview />;
  }

  if (!pages.some((p) => p.path === path)) notFound();

  if (path === "settings/roles") {
    return (
      <ERPLayout>
        <RolesPermissionsManager />
      </ERPLayout>
    );
  }

  return (
    <ERPLayout>
      <DataWorkspace path={path} />
    </ERPLayout>
  );
}
