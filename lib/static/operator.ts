export type Attacker = {
  name: string;
  icon: string;
};

export const ATTACKERS = [
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

export type Defender = {
  name: string;
  icon: string;
  iconBW: string;
  gadget?: PrimaryGadget;
  secondaryGadgets?: DefenderSecondaryGadget[];
  tertiaryGadgets?: DefenderSecondaryGadget[];
  hasPrimaryShotgun?: boolean;
  hasSecondaryShotgun?: boolean;
};

export type PrimaryGadget = {
  id: DefenderPrimaryGadget;
  count?: number;
};

export const DEFENDERS = [
  {
    name: "Sentry",
    icon: "/ops/def/sentry.webp",
    iconBW: "/ops/def/sentry_bw.png",
    secondaryGadgets: [
      "deployable_shield",
      "bulletproof_camera",
      "barbed_wire",
      "observation_blocker",
      "impact_grenade",
      "c4",
      "proximity_alarm",
    ],
    tertiaryGadgets: [
      "deployable_shield",
      "bulletproof_camera",
      "barbed_wire",
      "observation_blocker",
      "impact_grenade",
      "c4",
      "proximity_alarm",
    ],
    hasSecondaryShotgun: true,
  },
  {
    name: "Smoke",
    icon: "/ops/def/smoke.webp",
    iconBW: "/ops/def/smoke_bw.png",
    gadget: "toxic_canister",
    secondaryGadgets: ["barbed_wire", "proximity_alarm", "deployable_shield"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mute",
    icon: "/ops/def/mute.webp",
    iconBW: "/ops/def/mute_bw.png",
    gadget: "jammer",
    secondaryGadgets: ["c4", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Castle",
    icon: "/ops/def/castle.webp",
    iconBW: "/ops/def/castle_bw.png",
    gadget: "armor_panel",
    secondaryGadgets: ["bulletproof_camera", "proximity_alarm"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Pulse",
    icon: "/ops/def/pulse.webp",
    iconBW: "/ops/def/pulse_bw.png",
    secondaryGadgets: ["c4", "deployable_shield", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Doc",
    icon: "/ops/def/doc.webp",
    iconBW: "/ops/def/doc_bw.png",
    secondaryGadgets: ["bulletproof_camera", "barbed_wire"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Rook",
    icon: "/ops/def/rook.webp",
    iconBW: "/ops/def/rook_bw.png",
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
    iconBW: "/ops/def/kapkan_bw.png",
    gadget: "entry_denial_device",
    secondaryGadgets: ["barbed_wire", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Tachanka",
    icon: "/ops/def/tachanka.webp",
    iconBW: "/ops/def/tachanka_bw.png",
    gadget: "shumikha_launcher",
    secondaryGadgets: ["deployable_shield", "barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Jäger",
    icon: "/ops/def/jager.webp",
    iconBW: "/ops/def/jager_bw.png",
    gadget: "active_defense_system",
    secondaryGadgets: ["bulletproof_camera", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Bandit",
    icon: "/ops/def/bandit.webp",
    iconBW: "/ops/def/bandit_bw.png",
    gadget: "shock_wire",
    secondaryGadgets: ["c4", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Frost",
    icon: "/ops/def/frost.webp",
    iconBW: "/ops/def/frost_bw.png",
    gadget: "welcome_mat",
    secondaryGadgets: ["deployable_shield", "bulletproof_camera"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Valkyrie",
    icon: "/ops/def/valkyrie.webp",
    iconBW: "/ops/def/valkyrie_bw.png",
    gadget: "black_eye",
    secondaryGadgets: ["c4", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Caveira",
    icon: "/ops/def/caveira.webp",
    iconBW: "/ops/def/caveira_bw.png",
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
    iconBW: "/ops/def/echo_bw.png",
    gadget: "yokai",
    secondaryGadgets: ["deployable_shield", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mira",
    icon: "/ops/def/mira.webp",
    iconBW: "/ops/def/mira_bw.png",
    gadget: "black_mirror",
    secondaryGadgets: ["c4", "proximity_alarm"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Lesion",
    icon: "/ops/def/lesion.webp",
    iconBW: "/ops/def/lesion_bw.png",
    gadget: "gu_mine",
    secondaryGadgets: ["observation_blocker", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Ela",
    icon: "/ops/def/ela.webp",
    iconBW: "/ops/def/ela_bw.png",
    gadget: "grzmot_mine",
    secondaryGadgets: ["deployable_shield", "barbed_wire", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Vigil",
    icon: "/ops/def/vigil.webp",
    iconBW: "/ops/def/vigil_bw.png",
    secondaryGadgets: ["impact_grenade", "bulletproof_camera"],
  },
  {
    name: "Maestro",
    icon: "/ops/def/maestro.webp",
    iconBW: "/ops/def/maestro_bw.png",
    gadget: "evil_eye",
    secondaryGadgets: ["barbed_wire", "impact_grenade", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Alibi",
    icon: "/ops/def/alibi.webp",
    iconBW: "/ops/def/alibi_bw.png",
    gadget: "prisma",
    secondaryGadgets: ["proximity_alarm", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Clash",
    icon: "/ops/def/clash.webp",
    iconBW: "/ops/def/clash_bw.png",
    gadget: "riot_shield",
    secondaryGadgets: ["barbed_wire", "impact_grenade"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Kaid",
    icon: "/ops/def/kaid.webp",
    iconBW: "/ops/def/kaid_bw.png",
    gadget: "electroclaw",
    secondaryGadgets: ["c4", "barbed_wire", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mozzie",
    icon: "/ops/def/mozzie.webp",
    iconBW: "/ops/def/mozzie_bw.png",
    gadget: "pest",
    secondaryGadgets: ["c4", "barbed_wire", "impact_grenade"],
  },
  {
    name: "Warden",
    icon: "/ops/def/warden.webp",
    iconBW: "/ops/def/warden_bw.png",
    secondaryGadgets: ["deployable_shield", "c4", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Goyo",
    icon: "/ops/def/goyo.webp",
    iconBW: "/ops/def/goyo_bw.png",
    gadget: "volcan_canister",
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
    iconBW: "/ops/def/wamai_bw.png",
    gadget: "magnet",
    secondaryGadgets: ["impact_grenade", "proximity_alarm"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Oryx",
    icon: "/ops/def/oryx.webp",
    iconBW: "/ops/def/oryx_bw.png",
    secondaryGadgets: ["barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Melusi",
    icon: "/ops/def/melusi.webp",
    iconBW: "/ops/def/melusi_bw.png",
    gadget: "banshee",
    secondaryGadgets: ["bulletproof_camera", "impact_grenade"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Aruni",
    icon: "/ops/def/aruni.webp",
    iconBW: "/ops/def/aruni_bw.png",
    gadget: "surya_gate",
    secondaryGadgets: ["barbed_wire", "bulletproof_camera"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Thunderbird",
    icon: "/ops/def/thunderbird.webp",
    iconBW: "/ops/def/thunderbird_bw.png",
    gadget: "kona_station",
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
    iconBW: "/ops/def/thorn_bw.png",
    gadget: "razorbloom_shell",
    secondaryGadgets: ["deployable_shield", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Azami",
    icon: "/ops/def/azami.webp",
    iconBW: "/ops/def/azami_bw.png",
    gadget: "kiba_barrier",
    secondaryGadgets: ["impact_grenade", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Solis",
    icon: "/ops/def/solis.webp",
    iconBW: "/ops/def/solis_bw.png",
    secondaryGadgets: ["proximity_alarm", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Fenrir",
    icon: "/ops/def/fenrir.webp",
    iconBW: "/ops/def/fenrir_bw.png",
    gadget: "fenrir",
    secondaryGadgets: ["bulletproof_camera", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Tubarão",
    icon: "/ops/def/tubarao.webp",
    iconBW: "/ops/def/tubarao_bw.png",
    gadget: "zoto_canister",
    secondaryGadgets: ["c4", "proximity_alarm"],
  },
  {
    name: "Skopós",
    icon: "/ops/def/skopos.webp",
    iconBW: "/ops/def/skopos_bw.png",
    gadget: "skopos",
    secondaryGadgets: ["impact_grenade", "proximity_alarm"],
  },
  {
    name: "Denari",
    icon: "/ops/def/denari.webp",
    iconBW: "/ops/def/denari_bw.png",
    gadget: "trip",
    secondaryGadgets: ["observation_blocker", "deployable_shield"],
    hasSecondaryShotgun: true,
  },
] as const;

export const DEFENDER_PRIMARY_GADGETS = [
  {
    id: "toxic_canister",
    name: "Toxic Canister",
    icon: ["/gadgets/toxicbabe.png"],
    count: 3,
  },
  {
    id: "jammer",
    name: "Signal Disruptor",
    icon: ["/gadgets/jammer.png"],
    count: 4,
  },
  {
    id: "armor_panel",
    name: "Armor Panel",
    icon: ["/gadgets/castle.png"],
    count: 4,
    aspectRatio: 0.5,
  },
  {
    id: "entry_denial_device",
    name: "Entry Denial Device",
    icon: ["/gadgets/edd.png"],
    count: 5,
    aspectRatio: 0.5,
  },
  {
    id: "shumikha_launcher",
    name: "Shumikha Launcher",
    icon: ["/gadgets/shumikha.png"],
    count: 20,
  },
  {
    id: "active_defense_system",
    name: "Active Defense System",
    icon: ["/gadgets/ads.png"],
    count: 3,
  },
  {
    id: "shock_wire",
    name: "Shock Wire",
    icon: ["/gadgets/ced.png"],
    count: 4,
  },
  {
    id: "welcome_mat",
    name: "Welcome Mat",
    icon: ["/gadgets/welcomemat.png"],
    count: 3,
  },
  {
    id: "black_eye",
    name: "Black Eye",
    icon: ["/gadgets/blackeye.png"],
    count: 3,
  },
  {
    id: "yokai",
    name: "Yokai",
    icon: ["/gadgets/yokai.png"],
    count: 2,
  },
  {
    id: "black_mirror",
    name: "Black Mirror",
    icon: ["/gadgets/mira.png"],
    count: 2,
    aspectRatio: 0.5,
  },
  {
    id: "gu_mine",
    name: "Gu Mine",
    icon: ["/gadgets/gu.png"],
    count: 7,
  },
  {
    id: "grzmot_mine",
    name: "Grzmot Mine",
    icon: ["/gadgets/grzmot.png"],
    count: 3,
  },
  {
    id: "evil_eye",
    name: "Evil Eye",
    icon: ["/gadgets/evileye.png"],
    count: 3,
  },
  {
    id: "prisma",
    name: "Prisma",
    icon: ["/gadgets/prisma.png"],
    count: 3,
  },
  {
    id: "riot_shield",
    name: "Riot Shield",
    icon: ["/gadgets/clash.png"],
    count: 1,
  },
  {
    id: "electroclaw",
    name: "Electroclaw",
    icon: ["/gadgets/rtilla.png"],
    count: 2,
  },
  {
    id: "pest",
    name: "Pest",
    icon: ["/gadgets/pest.png"],
    count: 4,
  },
  {
    id: "volcan_canister",
    name: "Volcan Canister",
    icon: ["/gadgets/volcan.png"],
    count: 4,
  },
  {
    id: "magnet",
    name: "Magnet",
    icon: ["/gadgets/magnet.png"],
    count: 6,
  },
  {
    id: "banshee",
    name: "Banshee",
    icon: ["/gadgets/wubwub.png"],
    count: 4,
  },
  {
    id: "surya_gate",
    name: "Surya Gate",
    icon: ["/gadgets/surya.png"],
    count: 3,
    aspectRatio: 0.5,
  },
  {
    id: "kona_station",
    name: "Kona Station",
    icon: ["/gadgets/kona.png"],
    count: 3,
  },
  {
    id: "razorbloom_shell",
    name: "Razorbloom Shell",
    icon: ["/gadgets/thorn.png"],
    count: 3,
  },
  {
    id: "kiba_barrier",
    name: "Kiba Barrier",
    icon: ["/gadgets/kiba.png"],
    count: 5,
    aspectRatio: 0.5,
  },
  {
    id: "fenrir",
    name: "Fenrir",
    icon: ["/gadgets/fnat.png"],
    count: 4,
  },
  {
    id: "zoto_canister",
    name: "Zoto Canister",
    icon: ["/gadgets/zoto.png"],
    count: 3,
  },
  {
    id: "skopos",
    name: "Skopós",
    icon: ["/gadgets/skopi.png"],
    count: 1,
  },
  {
    id: "trip",
    name: "T.R.I.P.-Connector",
    icon: ["/gadgets/denari.png"],
    count: 7,
  },
] satisfies readonly {
  id: DefenderPrimaryGadget;
  name: string;
  icon: string[];
  count?: number;
  aspectRatio?: number;
}[];

export type DefenderPrimaryGadget = Extract<
  (typeof DEFENDERS)[number],
  { gadget: any }
>["gadget"];

export const DEFENDER_SECONDARY_GADGETS = [
  {
    id: "deployable_shield" as const,
    name: "Deployable Shield",
    icon: ["/gadgets/shield.png"],
    count: 1,
  },
  {
    id: "bulletproof_camera" as const,
    name: "Bulletproof Camera",
    icon: ["/gadgets/bp.png"],
    count: 1,
  },
  {
    id: "barbed_wire" as const,
    name: "Barbed Wire",
    icon: ["/gadgets/barbed_wire.png"],
    count: 2,
  },
  {
    id: "observation_blocker" as const,
    name: "Observation Blocker",
    icon: ["/gadgets/obs_block.png"],
    count: 3,
    aspectRatio: 0.5,
  },
  {
    id: "impact_grenade" as const,
    name: "Impact Grenade",
    icon: ["/gadgets/impact.png"],
    count: 2,
  },
  {
    id: "c4" as const,
    name: "Nitro Cell",
    icon: ["/gadgets/c4.png"],
    count: 1,
  },
  {
    id: "proximity_alarm" as const,
    name: "Proximity Alarm",
    icon: ["/gadgets/proxy.png"],
    count: 2,
  },
] satisfies readonly {
  id: string;
  name: string;
  icon: string[];
  count?: number;
  aspectRatio?: number;
}[];

export type DefenderSecondaryGadget =
  (typeof DEFENDER_SECONDARY_GADGETS)[number]["id"];
