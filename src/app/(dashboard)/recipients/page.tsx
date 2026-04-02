"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Plus, Users, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export default function RecipientsPage() {
  const { data: res, isLoading } = useQuery({
    queryKey: ["recipients"],
    queryFn: () => fetch("/api/recipients").then((r) => r.json()),
  });
  const data = res?.data || res;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipients</h1>
          <p className="text-muted-foreground">Manage your payment contacts</p>
        </div>
        <Link href="/recipients/new" className={cn(buttonVariants())}>
          <Plus className="mr-2 h-4 w-4" />
          Add Recipient
        </Link>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : data?.data?.length > 0 ? (
            <div className="divide-y">
              {data.data.map((recipient: any) => (
                <div
                  key={recipient.id}
                  className="flex items-center justify-between p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>
                        {recipient.name
                          .split(" ")
                          .map((n: string) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{recipient.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {formatDate(recipient.createdAt)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <p className="mt-4 text-sm text-muted-foreground">
                No recipients yet. Add one to start sending funds.
              </p>
              <Link href="/recipients/new" className={cn(buttonVariants(), "mt-4")}>
                Add Recipient
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
