import { notFound } from "next/navigation";
import { EmailComposer } from "@/components/marketing/EmailComposer";
import { getMarketingEmail } from "@/lib/marketing-emails-store";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Edit Email",
  robots: { index: false, follow: false },
};

export default async function MarketingEmailEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const email = await getMarketingEmail(id);

  if (!email) {
    notFound();
  }

  return (
    <EmailComposer
      id={email.id}
      initial={{
        name: email.name,
        subject: email.subject,
        html_body: email.html_body,
        text_body: email.text_body,
      }}
    />
  );
}
