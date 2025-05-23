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
  gadget?: PrimaryGadget;
  secondaryGadgets?: DefenderSecondaryGadget[];
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
    gadget: "toxic_canister",
    secondaryGadgets: ["barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mute",
    icon: "/ops/def/mute.webp",
    gadget: "jammer",
    secondaryGadgets: ["c4", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Castle",
    icon: "/ops/def/castle.webp",
    gadget: "armor_panel",
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
    gadget: "entry_denial_device",
    secondaryGadgets: ["barbed_wire", "bulletproof_camera"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Tachanka",
    icon: "/ops/def/tachanka.webp",
    gadget: "shumikha_launcher",
    secondaryGadgets: ["deployable_shield", "barbed_wire", "proximity_alarm"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Jäger",
    icon: "/ops/def/jager.webp",
    gadget: "active_defense_system",
    secondaryGadgets: ["bulletproof_camera", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Bandit",
    icon: "/ops/def/bandit.webp",
    gadget: "shock_wire",
    secondaryGadgets: ["c4", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Frost",
    icon: "/ops/def/frost.webp",
    gadget: "welcome_mat",
    secondaryGadgets: ["deployable_shield", "bulletproof_camera"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Valkyrie",
    icon: "/ops/def/valkyrie.webp",
    gadget: "black_eye",
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
    gadget: "yokai",
    secondaryGadgets: ["deployable_shield", "impact_grenade"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mira",
    icon: "/ops/def/mira.webp",
    gadget: "black_mirror",
    secondaryGadgets: ["c4", "proximity_alarm"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Lesion",
    icon: "/ops/def/lesion.webp",
    gadget: "gu_mine",
    secondaryGadgets: ["observation_blocker", "bulletproof_camera"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Ela",
    icon: "/ops/def/ela.webp",
    gadget: "grzmot_mine",
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
    gadget: "evil_eye",
    secondaryGadgets: ["barbed_wire", "impact_grenade", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Alibi",
    icon: "/ops/def/alibi.webp",
    gadget: "prisma",
    secondaryGadgets: ["proximity_alarm", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Clash",
    icon: "/ops/def/clash.webp",
    gadget: "riot_shield",
    secondaryGadgets: ["barbed_wire", "impact_grenade"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Kaid",
    icon: "/ops/def/kaid.webp",
    gadget: "electroclaw",
    secondaryGadgets: ["c4", "barbed_wire", "observation_blocker"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Mozzie",
    icon: "/ops/def/mozzie.webp",
    gadget: "pest",
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
    gadget: "vulcan_canister",
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
    gadget: "magnet",
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
    gadget: "banshee",
    secondaryGadgets: ["bulletproof_camera", "impact_grenade"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Aruni",
    icon: "/ops/def/aruni.webp",
    gadget: "surya_gate",
    secondaryGadgets: ["barbed_wire", "bulletproof_camera"],
    hasSecondaryShotgun: true,
  },
  {
    name: "Thunderbird",
    icon: "/ops/def/thunderbird.webp",
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
    gadget: "razorbloom_shell",
    secondaryGadgets: ["deployable_shield", "barbed_wire"],
    hasPrimaryShotgun: true,
  },
  {
    name: "Azami",
    icon: "/ops/def/azami.webp",
    gadget: "kiba_barrier",
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
    gadget: "fenrir",
    secondaryGadgets: ["bulletproof_camera", "observation_blocker"],
    hasPrimaryShotgun: true,
    hasSecondaryShotgun: true,
  },
  {
    name: "Tubarão",
    icon: "/ops/def/tubarao.webp",
    gadget: "zoto_canister",
    secondaryGadgets: ["c4", "proximity_alarm"],
  },
  {
    name: "Skopós",
    icon: "/ops/def/skopos.webp",
    gadget: "skopos",
    secondaryGadgets: ["impact_grenade", "proximity_alarm"],
  },
] as const;

export const DEFENDER_PRIMARY_GADGETS = [
  {
    id: "toxic_canister",
    name: "Toxic Canister",
    icon: ["/gadgets/ToxicBabe.png", "/gadgets/ToxicBabeSmoke.png"],
    count: 3,
  },
  {
    id: "jammer",
    name: "Signal Disruptor",
    icon: ["/gadgets/Mute.png"],
    count: 4,
  },
  {
    id: "armor_panel",
    name: "Armor Panel",
    icon: ["/gadgets/Castle.png"],
    count: 4,
  },
  {
    id: "entry_denial_device",
    name: "Entry Denial Device",
    icon: ["/gadgets/Kapkan.png"],
    count: 5,
  },
  {
    id: "shumikha_launcher",
    name: "Shumikha Launcher",
    icon: ["MISSING"],
    count: 20,
  },
  {
    id: "active_defense_system",
    name: "Active Defense System",
    icon: ["/gadgets/Jager.png"],
    count: 3,
  },
  {
    id: "shock_wire",
    name: "Shock Wire",
    icon: ["/gadgets/Bandit.png"],
    count: 4,
  },
  {
    id: "welcome_mat",
    name: "Welcome Mat",
    icon: ["/gadgets/Frost.png"],
    count: 3,
  },
  {
    id: "black_eye",
    name: "Black Eye",
    icon: ["/gadgets/Valkyrie.png"],
    count: 3,
  },
  {
    id: "yokai",
    name: "Yokai",
    icon: ["/gadgets/Echo.png"],
    count: 2,
  },
  {
    id: "black_mirror",
    name: "Black Mirror",
    icon: ["/gadgets/Mira.png"],
    count: 2,
  },
  {
    id: "gu_mine",
    name: "Gu Mine",
    icon: ["/gadgets/Lesion.png"],
    count: 7,
  },
  {
    id: "grzmot_mine",
    name: "Grzmot Mine",
    icon: ["/gadgets/Ela.png"],
    count: 3,
  },
  {
    id: "evil_eye",
    name: "Evil Eye",
    icon: ["/gadgets/Maestro.png", "/gadgets/MaestroCamTopDown.png"],
    count: 3,
  },
  {
    id: "prisma",
    name: "Prisma",
    icon: ["/gadgets/Alibi.png"],
    count: 3,
  },
  {
    id: "riot_shield",
    name: "Riot Shield",
    icon: ["MISSING"],
    count: 1,
  },
  {
    id: "electroclaw",
    name: "Electroclaw",
    icon: ["/gadgets/Kaid.png"],
    count: 2,
  },
  {
    id: "pest",
    name: "Pest",
    icon: ["/gadgets/Mozzie.png"],
    count: 4,
  },
  {
    id: "vulcan_canister",
    name: "Vulcan Canister",
    icon: ["/gadgets/Goyo.png"],
    count: 4,
  },
  {
    id: "magnet",
    name: "Magnet",
    icon: ["/gadgets/Wamai.png"],
    count: 6,
  },
  {
    id: "banshee",
    name: "Banshee",
    icon: ["/gadgets/Melusi.png"],
    count: 4,
  },
  {
    id: "surya_gate",
    name: "Surya Gate",
    icon: ["/gadgets/Aruni.png"],
    count: 3,
  },
  {
    id: "kona_station",
    name: "Kona Station",
    icon: ["/gadgets/Thunderbird.png"],
    count: 3,
  },
  {
    id: "razorbloom_shell",
    name: "Razorbloom Shell",
    icon: ["/gadgets/Thorn.png"],
    count: 3,
  },
  {
    id: "kiba_barrier",
    name: "Kiba Barrier",
    icon: ["/gadgets/Azami.png", "/gadgets/AzamiTopDown.png"],
    count: 5,
  },
  {
    id: "fenrir",
    name: "Fenrir",
    icon: ["/gadgets/Fenrir.png"],
    count: 4,
  },
  {
    id: "zoto_canister",
    name: "Zoto Canister",
    icon: ["MISSING"],
    count: 3,
  },
  {
    id: "skopos",
    name: "Skopós",
    icon: ["/gadgets/Skopos.png"],
    count: 1,
  },
] as const;

export type DefenderPrimaryGadget = Extract<
  (typeof DEFENDERS)[number],
  { gadget: any }
>["gadget"];

export const DEFENDER_SECONDARY_GADGETS = [
  {
    id: "deployable_shield",
    name: "Deployable Shield",
    icon: ["/gadgets/Shield.png"],
    count: 1,
  },
  {
    id: "bulletproof_camera",
    name: "Bulletproof Camera",
    icon: ["/gadgets/BulletProofCam.png", "/gadgets/BulletProofCamArrow.png"],
    count: 1,
  },
  {
    id: "barbed_wire",
    name: "Barbed Wire",
    icon: ["/gadgets/Barb.png"],
    count: 2,
  },
  {
    id: "observation_blocker",
    name: "Observation Blocker",
    icon: ["MISSING"],
    count: 3,
  },
  {
    id: "impact_grenade",
    name: "Impact Grenade",
    icon: ["/gadgets/ImpactGrenade.png"],
    count: 2,
  },
  {
    id: "c4",
    name: "Nitro Cell",
    icon: ["/gadgets/NitroCell.png"],
    count: 1,
  },
  {
    id: "proximity_alarm",
    name: "Proximity Alarm",
    icon: ["/gadgets/ProximityMine.png"],
    count: 2,
  },
] as const;

export type DefenderSecondaryGadget =
  (typeof DEFENDER_SECONDARY_GADGETS)[number]["id"];
