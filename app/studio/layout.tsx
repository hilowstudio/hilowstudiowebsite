import { redirect } from "next/navigation";
import { isAuthenticated } from "@/lib/admin-auth";
import { StudioShell } from "@/components/studio/studio-shell";

export const metadata = {
  title: "Studio | Hi Low Studio",
  robots: { index: false, follow: false },
};

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAuthenticated();

  if (!authed) {
    redirect("/login");
  }

  return <StudioShell>{children}</StudioShell>;
}
