import {
  ArrowDownToLine,
  ArrowLeftRight,
  ArrowUpFromLine,
  Send,
  Users,
} from "lucide-react";
import { HubScreen } from "@/components/app/hub-list";

export default function AppMovePage() {
  return (
    <HubScreen
      title="Move money"
      groups={[
        {
          items: [
            { name: "Send money", hint: "Pay someone you know", href: "/app/move/send", icon: Send },
            { name: "Transfer between accounts", hint: "Move money between your Moneta accounts", href: "/transfer-internal", icon: ArrowLeftRight },
          ],
        },
        {
          label: "Your bank",
          items: [
            { name: "Deposit", hint: "Add money from another bank", href: "/deposit", icon: ArrowDownToLine },
            { name: "Withdraw", hint: "Send money to a linked bank account", href: "/transfer-out", icon: ArrowUpFromLine },
          ],
        },
        {
          label: "Manage",
          items: [
            { name: "Recipients", hint: "People and accounts you pay", href: "/recipients", icon: Users },
          ],
        },
      ]}
    />
  );
}
