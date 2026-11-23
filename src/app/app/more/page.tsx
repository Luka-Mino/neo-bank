"use client";

import {
  BarChart3,
  ClipboardCheck,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Users2,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { HubScreen } from "@/components/app/hub-list";
import { DEMO_MODE } from "@/lib/demo-data";

export default function AppMorePage() {
  return (
    <HubScreen
      title="More"
      groups={[
        {
          label: "Your money",
          items: [
            {
              name: "Transactions",
              hint: "Search and export your history",
              href: "/app/activity",
              icon: History,
            },
            {
              name: "Insights",
              hint: "Where your money goes each month",
              href: "/insights",
              icon: BarChart3,
            },
          ],
        },
        {
          label: "Team",
          items: [
            {
              name: "Team members",
              hint: "Invite people and set permissions",
              href: "/app/more/team",
              icon: Users2,
            },
            {
              name: "Approvals",
              hint: "Payments waiting for sign-off",
              href: "/app/more/approvals",
              icon: ClipboardCheck,
            },
          ],
        },
        {
          label: "Profile",
          items: [
            {
              name: "Settings",
              hint: "Profile, password, two-step sign-in",
              href: "/app/more/settings",
              icon: Settings,
            },
            {
              name: "Security",
              hint: "How Moneta protects your money",
              href: "/security",
              icon: ShieldCheck,
            },
            {
              name: "Desktop dashboard",
              hint: "Open the current full-screen view",
              href: "/dashboard",
              icon: LayoutDashboard,
            },
          ],
        },
      ]}
      footer={
        !DEMO_MODE && (
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="mx-4 mt-6 flex w-[calc(100%-2rem)] lg:mx-0 lg:mt-8 lg:w-auto lg:px-8 items-center justify-center gap-2 rounded-[18px] bg-white py-3.5 text-[14px] font-semibold text-destructive shadow-[0_1px_0_rgba(18,46,46,0.04),0_4px_14px_-8px_rgba(18,46,46,0.12)] transition hover:bg-destructive/5"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        )
      }
    />
  );
}
