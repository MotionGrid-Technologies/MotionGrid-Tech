import { Phone, Mail } from "lucide-react";

export function ContactLine({ phone, email }: { phone: string; email: string }) {
  return (
    <div className="flex flex-col gap-2 border-t border-hairline pt-4">
      {/* TODO: confirm direct line is correct and reachable before launch */}
      <a
        href={`tel:${phone.replace(/\s+/g, "")}`}
        className="flex items-center gap-2 text-sm text-chrome-300 transition-colors hover:text-chrome-100"
      >
        <Phone size={14} className="text-signal" />
        {phone}
      </a>
      <a
        href={`mailto:${email}`}
        className="flex items-center gap-2 text-sm text-chrome-300 transition-colors hover:text-chrome-100"
      >
        <Mail size={14} className="text-signal" />
        {email}
      </a>
    </div>
  );
}
