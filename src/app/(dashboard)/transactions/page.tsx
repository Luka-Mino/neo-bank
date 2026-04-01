"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCurrency, formatDate, getStatusColor } from "@/lib/utils/format";
import { ArrowDownToLine, ArrowUpFromLine, Send, ArrowLeftRight } from "lucide-react";

const txTypeIcons: Record<string, React.ReactNode> = {
  onramp: <ArrowDownToLine className="h-4 w-4 text-green-500" />,
  offramp: <ArrowUpFromLine className="h-4 w-4 text-red-500" />,
  send: <Send className="h-4 w-4 text-blue-500" />,
  swap: <ArrowLeftRight className="h-4 w-4 text-purple-500" />,
};

export default function TransactionsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => fetch("/api/transactions").then((r) => r.json()),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground">Your complete transaction history</p>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-3 p-6">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : data?.data?.length > 0 ? (
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
                {data.data.map((tx: any) => (
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
            <div className="py-12 text-center text-sm text-muted-foreground">
              No transactions yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
