import { Mail, Phone } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/sections/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BookingCalendar } from "@/components/sections/BookingCalendar";
import { ContactForm } from "./ContactForm";
import { founders, site } from "@/lib/site";
import { getBookableSlots, listBookableDays } from "@/lib/meetings-store";

export default async function ContactPage() {
  // Availability is computed per-request: booked slots must disappear as
  // soon as someone takes them.
  const days = await listBookableDays();
  const firstDay = days[0]?.iso ?? "";
  const firstDaySlots = firstDay ? await getBookableSlots(firstDay) : [];

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Talk to the people building it."
        lede="No intake queue, no account manager — every enquiry reaches one of the
        two founders directly."
      />

      <section className="py-24 md:py-28">
        <Container className="grid grid-cols-1 gap-16 lg:grid-cols-[1.1fr_1fr]">
          {/* Demo / contact-sales form ------------------------------------- */}
          <ContactForm />

          {/* Direct lines — one phone number per founder ------------------- */}
          <div className="flex flex-col gap-8">
            <SectionHeading eyebrow="Direct lines" title="Reach us directly." />
            <div className="flex flex-col gap-6">
              {founders.map((f) => (
                <div
                  key={f.name}
                  className="flex flex-col gap-3 rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-6"
                >
                  <div>
                    <h3 className="font-display text-lg text-chrome-100">{f.name}</h3>
                    <p className="mg-eyebrow mt-1">{f.role}</p>
                  </div>

                  <a
                    href={`tel:${f.phone.replace(/\s+/g, "")}`}
                    className="flex items-center gap-2 text-sm text-chrome-300 hover:text-chrome-100"
                  >
                    <Phone size={14} className="text-signal" /> {f.phone}
                  </a>
                  <a
                    href={`mailto:${f.email}`}
                    className="flex items-center gap-2 text-sm text-chrome-300 hover:text-chrome-100"
                  >
                    <Mail size={14} className="text-signal" /> {f.email}
                  </a>
                </div>
              ))}

              <div className="rounded-[var(--radius-mg-lg)] border border-hairline bg-graphite/50 p-6">
                <h3 className="font-display text-lg text-chrome-100">General enquiries</h3>
                <a
                  href={`mailto:${site.email}`}
                  className="mt-3 flex items-center gap-2 text-sm text-chrome-300 hover:text-chrome-100"
                >
                  <Mail size={14} className="text-signal" /> {site.email}
                </a>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* 15-minute slot booking -------------------------------------------- */}
      <section id="booking" className="border-t border-hairline bg-obsidian-soft py-24 md:py-28">
        <Container className="flex max-w-3xl flex-col gap-10">
          <SectionHeading
            eyebrow="Skip the email loop"
            title="Grab a 15-minute slot."
            lede="Pick an open slot on a founder's calendar — confirmations are instant, and the call is short by design."
          />
          {days.length > 0 ? (
            <BookingCalendar days={days} initialDay={firstDay} initialSlots={firstDaySlots} />
          ) : (
            <p className="text-sm text-chrome-500">
              The booking calendar is temporarily unavailable — email {site.email} and we&apos;ll
              set up a time.
            </p>
          )}
        </Container>
      </section>
    </>
  );
}
