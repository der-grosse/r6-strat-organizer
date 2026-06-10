import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import TeamMemberItem from "./TeamMemberItem";
import { useUser } from "@/components/context/UserContext";
import { TeamMember } from "@/lib/types/team.types";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

export interface TeamMemberListProps {
  teamID: Id<"teams">;
  members: TeamMember[];
  onChangeColor: (member: TeamMember) => void;
  onChangeUbisoftID?: (member: TeamMember) => void;
}

export default function TeamMemberList(props: TeamMemberListProps) {
  const self = useQuery(api.self.get, {});
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead></TableHead>
          <TableHead>Username</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined at</TableHead>
          {self?.team?.isAdmin && <TableHead>Actions</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.members
          .toSorted((a, b) => (a.memberSince < b.memberSince ? -1 : 1))
          .map((member) => (
            <TeamMemberItem
              key={member._id}
              teamID={props.teamID}
              member={member}
              onChangeColor={props.onChangeColor.bind(null, member)}
              onChangeUbisoftID={
                props.onChangeUbisoftID ? props.onChangeUbisoftID.bind(null, member) : undefined
              }
            />
          ))}
      </TableBody>
    </Table>
  );
}
