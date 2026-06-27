import type { Metadata } from "next";
import { ShieldCheck } from "lucide-react";

import { requireOwner } from "@/server/auth-context";
import { listTeamMembers, listPendingInvites } from "@/server/data/team";
import { PageWrapper } from "@/components/layout/page-wrapper";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { InviteForm } from "@/components/team/invite-form";
import { CancelInviteButton } from "@/components/team/cancel-invite-button";
import { RemoveMemberButton } from "@/components/team/remove-member-button";

export const metadata: Metadata = { title: "Team · Sarion" };

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}

export default async function TeamPage() {
  // Owner-only route — members are redirected to /dashboard.
  const { agencyId, userId } = await requireOwner();

  const [members, pending] = await Promise.all([
    listTeamMembers(agencyId),
    listPendingInvites(agencyId),
  ]);

  return (
    <PageWrapper
      title="Team"
      description="Invite teammates and manage who has access."
    >
      <div className="space-y-6">
        <InviteForm />

        {/* Team members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="pr-6 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="pl-6 font-medium">
                      {member.name}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={member.role === "owner" ? "info" : "secondary"}
                      >
                        {member.role === "owner" ? "Owner" : "Member"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(member.joinedAt)}
                    </TableCell>
                    <TableCell className="pr-6 text-right">
                      {member.role !== "owner" && member.id !== userId && (
                        <RemoveMemberButton
                          memberId={member.id}
                          memberName={member.name}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pending invites */}
        {pending.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Invites</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6">Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead className="pr-6 text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pending.map((invite) => (
                    <TableRow key={invite.id}>
                      <TableCell className="pl-6 font-medium">
                        {invite.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {invite.email}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(invite.expiresAt)}
                      </TableCell>
                      <TableCell className="pr-6 text-right">
                        <CancelInviteButton inviteId={invite.id} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Permission summary */}
        <Card>
          <CardHeader className="flex-row items-center gap-2 space-y-0">
            <ShieldCheck className="h-5 w-5 text-primary" />
            <CardTitle>Permissions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-sm font-semibold">Owner</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Invite and view team members</li>
                <li>Manage billing</li>
                <li>Edit agency branding</li>
                <li>Full access to clients, projects, invoices</li>
              </ul>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Member</p>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>Access clients, projects, invoices</li>
                <li>Cannot manage billing</li>
                <li>Cannot remove the workspace</li>
                <li>Cannot remove users</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
}
