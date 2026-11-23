"use client";

// Notification bell + dropdown for the /app shell.
// Reads GET /api/notifications (demo: DEMO_NOTIFICATIONS), marks one read
// with PATCH /api/notifications/[id]/read when opened, and all read with
// POST /api/notifications. Links only follow internal paths.

import { Popover } from "@base-ui/react/popover";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/brand/icon";
import { DEMO_MODE, DEMO_NOTIFICATIONS } from "@/lib/demo-data";
import { cn } from "@/lib/utils";

type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

const KEY = ["notifications"];

/** Only same-origin, path-only URLs ("/app/card"), never "//evil" or "https:". */
export function safeInternalPath(url: string | null | undefined): string | null {
  if (!url || !url.startsWith("/") || url.startsWith("//") || url.startsWith("/\\")) return null;
  return url;
}

export function timeAgo(iso: string, now = Date.now()): string {
  const s = Math.max(0, Math.round((now - new Date(iso).getTime()) / 1000));
  if (s < 60) return "Just now";
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d === 1) return "Yesterday";
  if (d < 7) return `${d} days ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

let demoStore: Notification[] = DEMO_NOTIFICATIONS.map((n) => ({ ...n }));

function useNotifications() {
  return useQuery<Notification[]>({
    queryKey: KEY,
    queryFn: async () => {
      if (DEMO_MODE) return demoStore;
      const r = await fetch("/api/notifications");
      if (!r.ok) throw new Error("notifications");
      const j = await r.json();
      return j?.data?.data ?? [];
    },
    refetchInterval: DEMO_MODE ? false : 60_000,
  });
}

export function NotificationBell({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const qc = useQueryClient();
  const router = useRouter();
  const { data = [], isLoading, isError, refetch } = useNotifications();
  const unread = data.filter((n) => !n.readAt).length;

  const markAll = useMutation({
    mutationFn: async () => {
      if (DEMO_MODE) {
        demoStore = demoStore.map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }));
        return;
      }
      await fetch("/api/notifications", { method: "POST" });
    },
    onMutate: () =>
      qc.setQueryData<Notification[]>(KEY, (old) =>
        (old ?? []).map((n) => ({ ...n, readAt: n.readAt ?? new Date().toISOString() }))
      ),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  const markOne = useMutation({
    mutationFn: async (id: string) => {
      if (DEMO_MODE) {
        demoStore = demoStore.map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n));
        return;
      }
      await fetch(`/api/notifications/${encodeURIComponent(id)}/read`, { method: "PATCH" });
    },
    onMutate: (id) =>
      qc.setQueryData<Notification[]>(KEY, (old) =>
        (old ?? []).map((n) => (n.id === id ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n))
      ),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });

  return (
    <Popover.Root>
      <Popover.Trigger
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-[10px] transition outline-none",
          tone === "dark"
            ? "text-white/80 hover:bg-white/10 hover:text-white focus-visible:shadow-[0_0_0_2px_#122e2e,0_0_0_4px_#4ac280] data-[popup-open]:bg-white/10"
            : "text-forest/70 hover:bg-forest/[0.05] hover:text-forest focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
        )}
      >
        <Icon name="alerts" size={21} className="[--icon-signal:transparent]" />
        {unread > 0 && (
          <span
            aria-hidden
            className={cn(
              "absolute right-1 top-1 flex h-[16px] min-w-[16px] items-center justify-center rounded-full bg-turquoise px-1 text-[10px] font-bold leading-none text-forest-900 ring-2",
              tone === "dark" ? "ring-forest" : "ring-white"
            )}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="end" sideOffset={10} collisionPadding={12} className="z-50">
          <Popover.Popup className="w-[min(380px,calc(100vw-24px))] origin-[var(--transform-origin)] overflow-hidden rounded-[18px] bg-white text-forest shadow-[0_18px_50px_-18px_rgba(10,28,28,0.45)] ring-1 ring-forest/[0.08] outline-none transition-[transform,opacity] duration-150 data-[ending-style]:scale-95 data-[ending-style]:opacity-0 data-[starting-style]:scale-95 data-[starting-style]:opacity-0">
            <div className="flex items-center justify-between border-b border-forest/[0.07] px-4 py-3.5">
              <Popover.Title className="text-[15px] font-semibold">Notifications</Popover.Title>
              {unread > 0 && (
                <button
                  type="button"
                  onClick={() => markAll.mutate()}
                  className="rounded-md text-[13px] font-semibold text-turquoise-700 transition hover:text-forest outline-none focus-visible:shadow-[0_0_0_2px_#fff,0_0_0_4px_#4ac280]"
                >
                  Mark all as read
                </button>
              )}
            </div>
            <div className="max-h-[min(420px,70dvh)] overflow-y-auto overscroll-contain">
              {isLoading ? (
                <p role="status" className="px-4 py-8 text-center text-[13.5px] text-forest/55">
                  Loading…
                </p>
              ) : isError ? (
                <div className="px-4 py-8 text-center text-[13.5px] text-forest/60">
                  Couldn&apos;t load notifications.{" "}
                  <button type="button" onClick={() => refetch()} className="font-semibold text-turquoise-700 underline-offset-2 hover:underline">
                    Try again
                  </button>
                </div>
              ) : data.length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-[14.5px] font-semibold">You&apos;re all caught up</p>
                  <p className="mt-1 text-[13px] text-forest/55">Updates about your money and security show up here.</p>
                </div>
              ) : (
                <ul className="divide-y divide-forest/[0.06]">
                  {data.map((n) => {
                    const href = safeInternalPath(n.actionUrl);
                    return (
                      <li key={n.id}>
                        <Popover.Close
                          onClick={() => {
                            if (!n.readAt) markOne.mutate(n.id);
                            if (href) router.push(href);
                          }}
                          className={cn(
                            "flex w-full gap-3 px-4 py-3.5 text-left transition hover:bg-forest/[0.025] outline-none focus-visible:bg-turquoise-50/60",
                            !n.readAt && "bg-turquoise-50/40"
                          )}
                        >
                          <span
                            aria-hidden
                            className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", n.readAt ? "bg-transparent" : "bg-turquoise")}
                          />
                          <span className="min-w-0 flex-1">
                            <span className="flex items-baseline justify-between gap-3">
                              <span className={cn("truncate text-[14px]", n.readAt ? "font-medium" : "font-semibold")}>
                                {n.title}
                                {!n.readAt && <span className="sr-only"> (unread)</span>}
                              </span>
                              <span className="shrink-0 text-[11.5px] text-forest/45" suppressHydrationWarning>
                                {timeAgo(n.createdAt)}
                              </span>
                            </span>
                            {n.body && <span className="mt-0.5 line-clamp-2 block text-[13px] leading-snug text-forest/60">{n.body}</span>}
                          </span>
                        </Popover.Close>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </Popover.Popup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
}
