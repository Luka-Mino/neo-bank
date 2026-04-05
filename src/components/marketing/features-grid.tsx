import {
  ArrowDownToLine,
  Globe,
  BadgeDollarSign,
  Coins,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: ArrowDownToLine,
    title: "Instant Deposits",
    description: "Fund your account instantly via ACH or wire transfer",
  },
  {
    icon: Globe,
    title: "Global Transfers",
    description: "Send money anywhere across multiple blockchain networks",
  },
  {
    icon: BadgeDollarSign,
    title: "Zero Hidden Fees",
    description: "No monthly fees, no minimum balances, no surprises",
  },
  {
    icon: Coins,
    title: "Stablecoin-Powered",
    description: "Your dollars are backed by regulated stablecoins",
  },
] as const;

export function FeaturesGrid() {
  return (
    <section id="features" className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Everything you need, nothing you don&apos;t
          </h2>
          <p className="mt-4 text-muted-foreground">
            Built from the ground up for the way money should work.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => (
            <Card key={feature.title} className="border-0 bg-muted/40">
              <CardContent className="pt-2">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-base font-semibold">{feature.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
