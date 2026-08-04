"use client";

import { Badge, Button, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@narau/ui";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useTransition } from "react";
import { adminRejectCandidate } from "@/server/actions/admin/candidates";

export interface CandidateRow {
  id: string;
  title: string;
  canonicalUrl: string;
  candidateScore: number;
  qualityScore: number;
  status: "CANDIDATE" | "SELECTED" | "REJECTED" | "USED";
}

export function CandidatesTable({ candidates }: { candidates: CandidateRow[] }): React.ReactElement {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState<string | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      <p className="mono-meta text-muted-foreground">
        {candidates.length} CANDIDATE{candidates.length === 1 ? "" : "S"} IN THE POOL
      </p>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Candidate</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Moderate</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {candidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell>
                <a
                  href={candidate.canonicalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="font-medium underline-offset-2 hover:underline"
                >
                  {candidate.title}
                </a>
              </TableCell>
              <TableCell>
                <span className="mono-meta text-muted-foreground">
                  {Math.round(candidate.candidateScore)} / {Math.round(candidate.qualityScore)}
                </span>
              </TableCell>
              <TableCell>
                <Badge variant={candidate.status === "CANDIDATE" ? "secondary" : "muted"}>
                  {candidate.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                {candidate.status === "CANDIDATE" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={pendingId === candidate.id}
                    onClick={() => {
                      setPendingId(candidate.id);
                      startTransition(async () => {
                        const result = await adminRejectCandidate(candidate.id);
                        setPendingId(null);
                        if (result.ok) router.refresh();
                      });
                    }}
                  >
                    Reject
                  </Button>
                ) : (
                  <span className="mono-meta text-muted-foreground">—</span>
                )}
              </TableCell>
            </TableRow>
          ))}
          {candidates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="py-8 text-center font-mono text-xs text-muted-foreground">
                NO CANDIDATES FOR THIS AREA AND DATE. RUN <span className="font-bold">pnpm job:ingest</span>.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </div>
  );
}
