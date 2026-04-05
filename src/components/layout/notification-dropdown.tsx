"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDate } from "@/lib/utils/format";

interface Notification {
  id: string;
  title: string;
  body: string | null;
  type: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
}

export function NotificationDropdown() {
  const queryClient = useQueryClient();

  const { data: allRes } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => fetch("/api/notifications").then((r) => r.json()),
  });

  const { data: unreadRes } = useQuery({
    queryKey: ["notifications", "unread"],
    queryFn: () =>
      fetch("/api/notifications?unread=true").then((r) => r.json()),
  });

  const markAllRead = useMutation({
    mutationFn: () => fetch("/api/notifications", { method: "POST" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const notifications: Notification[] = allRes?.data?.data || allRes?.data || [];
  const unreadCount =
    (unreadRes?.data?.data || unreadRes?.data || []).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator />
        {notifications.length > 0 ? (
          <div className="max-h-72 overflow-y-auto">
            {notifications.slice(0, 10).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-1 px-3 py-2">
                <div className="flex w-full items-center gap-2">
                  {!n.readAt && (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                  )}
                  <p className="text-sm font-medium">{n.title}</p>
                </div>
                {n.body && (
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {n.body}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  {formatDate(n.createdAt)}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        ) : (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            No notifications yet
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
