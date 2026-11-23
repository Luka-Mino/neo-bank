import { CreditCard, History, Snowflake } from "lucide-react";
import { HubScreen } from "@/components/app/hub-list";

export default function AppCardPage() {
  return (
    <HubScreen
      title="Card"
      groups={[
        {
          items: [
            { name: "Manage your cards", hint: "View card details, add a virtual card", href: "/card", icon: CreditCard },
            { name: "Freeze or unfreeze", hint: "Pause a card if it's lost or misplaced", href: "/card", icon: Snowflake },
            { name: "Card activity", hint: "Recent purchases and payments", href: "/transactions", icon: History },
          ],
        },
      ]}
    />
  );
}
