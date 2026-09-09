import { redirect } from "next/navigation";

export default async function SignupPage({
  searchParams,
}: {
  searchParams?: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const role = params?.role;
  redirect(role ? `/login?mode=signup&role=${role}` : "/login?mode=signup");
}
