import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const next = (await searchParams).next ?? "/adminj2-v1/autofield";
  return <LoginForm next={next} />;
}
