import { ShieldCheck, Lock, Scale } from "lucide-react";

const trustItems = [
  {
    icon: ShieldCheck,
    title: "FDIC Insured",
    description: "Deposits insured up to $250,000",
  },
  {
    icon: Lock,
    title: "Bank-grade Encryption",
    description: "256-bit AES encryption on all data",
  },
  {
    icon: Scale,
    title: "Regulated & Compliant",
    description: "Full KYC/AML compliance built in",
  },
] as const;

export function TrustSection() {
  return (
    <section className="bg-muted/30 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 flex max-w-md flex-col items-center text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
            <ShieldCheck className="h-7 w-7 text-primary" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Your money is safe
          </h2>
          <p className="mt-4 text-muted-foreground">
            Security and compliance are at the core of everything we build.
          </p>
        </div>

        <div className="grid gap-8 sm:grid-cols-3">
          {trustItems.map((item) => (
            <div key={item.title} className="flex flex-col items-center text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <item.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
