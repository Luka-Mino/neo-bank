"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Send,
  ArrowLeftRight,
  Search,
  Inbox,
} from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const txTypeIcons: Record<string, React.ReactNode> = {
  onramp: <ArrowDownToLine className="h-4 w-4 text-emerald-500" />,
  offramp: <ArrowUpFromLine className="h-4 w-4 text-red-500" />,
  send: <Send className="h-4 w-4 text-blue-500" />,
  swap: <ArrowLeftRight className="h-4 w-4 text-purple-500" />,
};

export default function TransactionsPage() {
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
  });
  const data = res?.data || res;
  const transactions = data?.data || [];

  const filtered = useMemo(() => {
    return transactions.filter((tx: any) => {
      if (typeFilter !== "all" && tx.txType !== typeFilter) return false;
      if (statusFilter !== "all" && tx.status !== statusFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const matchesType = tx.txType?.toLowerCase().includes(q);
        const matchesAsset = tx.sourceAsset?.toLowerCase().includes(q);
        const matchesAmount = tx.sourceAmount?.includes(q);
        const matchesId = tx.id?.toLowerCase().includes(q);
        if (!matchesType && !matchesAsset && !matchesAmount && !matchesId) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, statusFilter, searchQuery]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Your complete transaction history</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="onramp">Deposits</SelectItem>
            <SelectItem value="offramp">Withdrawals</SelectItem>
            <SelectItem value="send">Transfers</SelectItem>
            <SelectItem value="swap">Swaps</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v ?? "all")}>
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="processing">Processing</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="canceled">Canceled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Asset</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((tx: any) => (
                  <TableRow key={tx.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <Link
                        href={`/transactions/${tx.id}`}
                        className="flex items-center gap-2"
                      >
                        {txTypeIcons[tx.txType] || txTypeIcons.send}
                        <span className="capitalize">{tx.txType}</span>
                      </Link>
                    </TableCell>
                    <TableCell className="font-medium">
                      {tx.sourceAmount ? formatCurrency(tx.sourceAmount) : "—"}
                    </TableCell>
                    <TableCell>{tx.sourceAsset || "—"}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className={getStatusColor(tx.status)}>
                        {tx.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(tx.createdAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">
                  {transactions.length > 0
                    ? "No matching transactions"
                    : "No transactions yet"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {transactions.length > 0
                    ? "Try adjusting your filters"
                    : "Your transaction history will appear here"}
                </p>
              </div>
              {transactions.length > 0 && (typeFilter !== "all" || statusFilter !== "all" || searchQuery) && (
                <button
                  onClick={() => {
                    setTypeFilter("all");
                    setStatusFilter("all");
                    setSearchQuery("");
                  }}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Clear filters
                </button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
