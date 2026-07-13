"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, ChevronRight, Send } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";
import { DEMO_MODE, DEMO_RECIPIENTS } from "@/lib/demo-data";

const stripPalette = [
  "strip-emerald",
  "strip-blue",
  "strip-purple",
  "strip-orange",
  "strip-cyan",
  "strip-red",
];

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function RecipientsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: () => fetch("/api/recipients").then((r) => r.json()),
    enabled: !DEMO_MODE,
  });
  const data = DEMO_MODE ? { data: DEMO_RECIPIENTS } : res?.data || res;
  const recipients: any[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Recipients
          </h1>
          <p className="text-muted-foreground">
            Quick access to people you pay
          </p>
        </div>
        <Link href="/recipients/new" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />
          Add recipient
        </Link>
      </div>

      {/* Avatar strip */}
      {recipients.length > 0 && (
        <Card>
          <CardContent>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Frequent
            </p>
            <div className="mt-3 flex gap-4 overflow-x-auto pb-1">
              {recipients.slice(0, 8).map((r, i) => (
                <Link
                  key={r.id}
                  href={`/send?to=${r.dakotaRecipientId}`}
                  className="flex shrink-0 flex-col items-center gap-1.5"
                >
                  <Avatar className="h-12 w-12 ring-2 ring-transparent transition group-hover:ring-primary">
                    <AvatarFallback
                      className={cn(
                        "text-xs font-semibold text-white",
                        [
                          "bg-[#4ac280]",
                          "bg-[#2f80ed]",
                          "bg-[#8b5cf6]",
                          "bg-[#ff9500]",
                          "bg-[#22d3ee]",
                          "bg-[#ff3b30]",
                        ][i % 6]
                      )}
                    >
                      {initialsOf(r.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="max-w-[80px] truncate text-[11px] text-muted-foreground">
                    {r.name.split(" ")[0]}
                  </p>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : recipients.length > 0 ? (
            <div className="divide-y divide-border">
              {recipients.map((recipient: any, i) => (
                <Link
                  key={recipient.id}
                  href={`/send?to=${recipient.dakotaRecipientId}`}
                  className={cn(
                    "flex items-center gap-4 px-4 py-3 transition hover:bg-muted/40",
                    stripPalette[i % stripPalette.length]
                  )}
                >
                  <Avatar>
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {initialsOf(recipient.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {recipient.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Added {formatDate(recipient.createdAt)}
                    </p>
                  </div>
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No recipients yet. Add one to start sending funds.
              </p>
              <Link
                href="/recipients/new"
                className={cn(buttonVariants(), "mt-4")}
              >
                Add recipient
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
