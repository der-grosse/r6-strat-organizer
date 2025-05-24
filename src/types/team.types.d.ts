interface Team {
  id: number;
  name: string;
  createdAt: string;
  playerPositions: PlayerPosition[];
  members: TeamMember[];
}

interface PlayerPosition {
  id: number;
  playerID: number | null;
  positionName: string | null;
}

interface TeamMember {
  isAdmin: boolean;
  id: number;
  name: string;
  defaultColor: string | null;
  createdAt: string;
  positionID: number | null;
}

interface JWTPayload {
  id: number;
  name: string;
  teamID: number;
  isAdmin: boolean;
}

interface InviteKey {
  inviteKey: string;
  teamID: number;
  usedBy: number | null;
  usedAt: string | null;
}
