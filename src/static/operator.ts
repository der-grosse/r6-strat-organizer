const ATTACKERS = [
  {
    name: "Striker",
    icon: "/ops/att/striker.webp",
  },
  {
    name: "Sledge",
    icon: "/ops/att/sledge.webp",
  },
  {
    name: "Thatcher",
    icon: "/ops/att/thatcher.webp",
  },
  {
    name: "Ash",
    icon: "/ops/att/ash.webp",
  },
  {
    name: "Thermite",
    icon: "/ops/att/thermite.webp",
  },
  {
    name: "Twitch",
    icon: "/ops/att/twitch.webp",
  },
  {
    name: "Montagne",
    icon: "/ops/att/montagne.webp",
  },
  {
    name: "Glaz",
    icon: "/ops/att/glaz.webp",
  },
  {
    name: "Fuze",
    icon: "/ops/att/fuze.webp",
  },
  {
    name: "Blitz",
    icon: "/ops/att/blitz.webp",
  },
  {
    name: "IQ",
    icon: "/ops/att/iq.webp",
  },
  {
    name: "Buck",
    icon: "/ops/att/buck.webp",
  },
  {
    name: "Blackbeard",
    icon: "/ops/att/blackbeard.webp",
  },
  {
    name: "Capitao",
    icon: "/ops/att/capitao.webp",
  },
  {
    name: "Hibana",
    icon: "/ops/att/hibana.webp",
  },
  {
    name: "Jackal",
    icon: "/ops/att/jackal.webp",
  },
  {
    name: "Ying",
    icon: "/ops/att/ying.webp",
  },
  {
    name: "Zofia",
    icon: "/ops/att/zofia.webp",
  },
  {
    name: "Dokkaebi",
    icon: "/ops/att/dokkaebi.webp",
  },
  {
    name: "Lion",
    icon: "/ops/att/lion.webp",
  },
  {
    name: "Finka",
    icon: "/ops/att/finka.webp",
  },
  {
    name: "Maverick",
    icon: "/ops/att/maverick.webp",
  },
  {
    name: "Nomad",
    icon: "/ops/att/nomad.webp",
  },
  {
    name: "Gridlock",
    icon: "/ops/att/gridlock.webp",
  },
  {
    name: "Nøkk",
    icon: "/ops/att/nokk.webp",
  },
  {
    name: "Amaru",
    icon: "/ops/att/amaru.webp",
  },
  {
    name: "Kali",
    icon: "/ops/att/kali.webp",
  },
  {
    name: "Iana",
    icon: "/ops/att/iana.webp",
  },
  {
    name: "Ace",
    icon: "/ops/att/ace.webp",
  },
  {
    name: "Zero",
    icon: "/ops/att/zero.webp",
  },
  {
    name: "Flores",
    icon: "/ops/att/flores.webp",
  },
  {
    name: "Osa",
    icon: "/ops/att/osa.webp",
  },
  {
    name: "Sens",
    icon: "/ops/att/sens.webp",
  },
  {
    name: "Grim",
    icon: "/ops/att/grim.webp",
  },
  {
    name: "Brava",
    icon: "/ops/att/brava.webp",
  },
  {
    name: "Ram",
    icon: "/ops/att/ram.webp",
  },
  {
    name: "Deimos",
    icon: "/ops/att/deimos.webp",
  },
  {
    name: "Rauora",
    icon: "/ops/att/rauora.webp",
  },
];

const DEFENDERS = [
  {
    name: "Sentry",
    icon: "/ops/def/sentry.webp",
    secondaryGadgets: [
      "deployable_shield",
      "bulletproof_camera",
      "barbed_wire",
      "observation_blocker",
      "impact_grenade",
      "c4",
      "proximity_alarm",
    ],
  },
  {
    name: "Smoke",
    icon: "/ops/def/smoke.webp",
    gadget: { id: "toxic_canister", count: 3 },
    secondaryGadgets: ["barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mute",
    icon: "/ops/def/mute.webp",
    gadget: { id: "jammer", count: 4 },
    secondaryGadgets: ["c4", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Castle",
    icon: "/ops/def/castle.webp",
    gadget: { id: "armor_panel", count: 4 },
    secondaryGadgets: ["bulletproof_camera", "barbed_wire"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Pulse",
    icon: "/ops/def/pulse.webp",
    secondaryGadgets: ["c4", "deployable_shield", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Doc",
    icon: "/ops/def/doc.webp",
    secondaryGadgets: ["bulletproof_camera", "barbed_wire"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Rook",
    icon: "/ops/def/rook.webp",
    secondaryGadgets: [
      "proximity_alarm",
      "impact_grenade",
      "observation_blocker",
    ],
    hasPrimaryShotgun: true,
  },
  {
    name: "Kapkan",
    icon: "/ops/def/kapkan.webp",
    gadget: {
      id: "entry_denial_device",
      count: 5,
    },
    secondaryGadgets: ["barbed_wire", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Tachanka",
    icon: "/ops/def/tachanka.webp",
    gadget: { id: "shumikha_launcher", count: 20 },
    secondaryGadgets: ["deployable_shield", "barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Jäger",
    icon: "/ops/def/jager.webp",
    gadget: { id: "active_defense_system", count: 3 },
    secondaryGadgets: ["bulletproof_camera", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Bandit",
    icon: "/ops/def/bandit.webp",
    gadget: { id: "shock_wire", count: 4 },
    secondaryGadgets: ["c4", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Frost",
    icon: "/ops/def/frost.webp",
    gadget: { id: "welcome_mat", count: 3 },
    secondaryGadgets: ["deployable_shield", "bulletproof_camera"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Valkyrie",
    icon: "/ops/def/valkyrie.webp",
    gadget: { id: "black_eye", count: 3 },
    secondaryGadgets: ["c4", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Caveira",
    icon: "/ops/def/caveira.webp",
    secondaryGadgets: [
      "impact_grenade",
      "proximity_alarm",
      "observation_blocker",
    ],
    hasPrimaryShotgun: true,
  },
  {
    name: "Echo",
    icon: "/ops/def/echo.webp",
    gadget: { id: "yokai", count: 2 },
    secondaryGadgets: ["deployable_shield", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mira",
    icon: "/ops/def/mira.webp",
    gadget: { id: "black_mirror", count: 2 },
    secondaryGadgets: ["c4", "proximity_alarm"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Lesion",
    icon: "/ops/def/lesion.webp",
    gadget: { id: "gu_mine", count: 7 },
    secondaryGadgets: ["observation_blocker", "bulletproof_camera"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Ela",
    icon: "/ops/def/ela.webp",
    gadget: { id: "grzmot_mine", count: 3 },
    secondaryGadgets: ["deployable_shield", "barbed_wire", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Vigil",
    icon: "/ops/def/vigil.webp",
    secondaryGadgets: ["impact_grenade", "bulletproof_camera"],
  },
  {
    name: "Maestro",
    icon: "/ops/def/maestro.webp",
    gadget: { id: "evil_eye", count: 3 },
    secondaryGadgets: ["barbed_wire", "impact_grenade", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Alibi",
    icon: "/ops/def/alibi.webp",
    gadget: { id: "prisma", count: 3 },
    secondaryGadgets: ["proximity_alarm", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Clash",
    icon: "/ops/def/clash.webp",
    secondaryGadgets: ["barbed_wire", "impact_grenade"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Kaid",
    icon: "/ops/def/kaid.webp",
    gadget: { id: "electroclaw", count: 2 },
    secondaryGadgets: ["c4", "barbed_wire", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mozzie",
    icon: "/ops/def/mozzie.webp",
    gadget: { id: "pest", count: 4 },
    secondaryGadgets: ["c4", "barbed_wire", "impact_grenade"],
  },
  {
    name: "Warden",
    icon: "/ops/def/warden.webp",
    secondaryGadgets: ["deployable_shield", "c4", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Goyo",
    icon: "/ops/def/goyo.webp",
    gadget: { id: "volcano", count: 4 },
    secondaryGadgets: [
      "proximity_alarm",
      "bulletproof_camera",
      "impact_grenade",
    ],
    hasPrimaryShotgun: true,
  },
  {
    name: "Wamai",
    icon: "/ops/def/wamai.webp",
    gadget: { id: "magnet", count: 6 },
    secondaryGadgets: ["impact_grenade", "proximity_alarm"],
  },
  {
    name: "Oryx",
    icon: "/ops/def/oryx.webp",
    secondaryGadgets: ["barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Melusi",
    icon: "/ops/def/melusi.webp",
    gadget: { id: "banshee", count: 4 },
    secondaryGadgets: ["bulletproof_camera", "impact_grenade"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Aruni",
    icon: "/ops/def/aruni.webp",
    gadget: { id: "surya_gate", count: 3 },
    secondaryGadgets: ["barbed_wire", "bulletproof_camera"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Thunderbird",
    icon: "/ops/def/thunderbird.webp",
    gadget: { id: "kona_station", count: 3 },
    secondaryGadgets: [
      "deployable_shield",
      "barbed_wire",
      "bulletproof_camera",
    ],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Thorn",
    icon: "/ops/def/thorn.webp",
    gadget: { id: "razorbloom_shell", count: 3 },
    secondaryGadgets: ["deployable_shield", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Azami",
    icon: "/ops/def/azami.webp",
    gadget: { id: "kiba_barrier", count: 5 },
    secondaryGadgets: ["impact_grenade", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Solis",
    icon: "/ops/def/solis.webp",
    secondaryGadgets: ["proximity_alarm", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Fenrir",
    icon: "/ops/def/fenrir.webp",
    gadget: { id: "fenrir", count: 4 },
    secondaryGadgets: ["bulletproof_camera", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Tubarão",
    icon: "/ops/def/tubarao.webp",
    gadget: { id: "tubarão", count: 3 },
    secondaryGadgets: ["c4", "proximity_alarm"],
  },
  {
    name: "Skopós",
    icon: "/ops/def/skopos.webp",
    gadget: { id: "skopos", count: 3 },
    secondaryGadgets: ["impact_grenade", "proximity_alarm"],
  },
] as const;

export const DEFENDER_SECONDARY_GADGETS = [
  {
    id: "deployable_shield",
    name: "Deployable Shield",
    icon: "/gadget/deployable_shield.webp",
    count: 1,
  },
  {
    id: "bulletproof_camera",
    name: "Bulletproof Camera",
    icon: "/gadget/bulletproof_camera.webp",
    count: 1,
  },
  {
    id: "barbed_wire",
    name: "Barbed Wire",
    icon: "/gadget/barbed_wire.webp",
    count: 2,
  },
  {
    id: "observation_blocker",
    name: "Observation Blocker",
    icon: "/gadget/observation_blocker.webp",
    count: 3,
  },
  {
    id: "impact_grenade",
    name: "Impact Grenade",
    icon: "/gadget/impact_grenade.webp",
    count: 2,
  },
  {
    id: "c4",
    name: "C4 Explosive Charge",
    icon: "/gadget/c4.webp",
    count: 1,
  },
  {
    id: "proximity_alarm",
    name: "Proximity Alarm",
    icon: "/gadget/proximity_alarm.webp",
    count: 2,
  },
] as const;

export const DEFENDER_PRIMARY_GADGETS = Array.from(
  new Set(
    DEFENDERS.flatMap((op) => ("gadget" in op ? op.gadget?.id ?? [] : []))
  )
);

export type Defender = {
  name: string;
  icon: string;
  gadget?: PrimaryGadget;
  secondaryGadgets?: DefenderSecondaryGadget[];
  hasPrimaryShotgun?: boolean;
  hasSecondaryShotgun?: boolean;
};

export type PrimaryGadget = {
  id: DefenderPrimaryGadget;
  count?: number;
};

export type Attacker = {
  name: string;
  icon: string;
};

export type Operator = Defender | Attacker;

export type DefenderSecondaryGadget =
  | "deployable_shield"
  | "bulletproof_camera"
  | "barbed_wire"
  | "observation_blocker"
  | "impact_grenade"
  | "c4"
  | "proximity_alarm";

export type DefenderPrimaryGadget = Extract<
  (typeof DEFENDERS)[number],
  { gadget: any }
>["gadget"]["id"];

export { ATTACKERS, DEFENDERS };
