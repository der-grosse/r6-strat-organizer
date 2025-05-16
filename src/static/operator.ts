const ATTACKERS = [
  {
    name: "Striker",
    icon: {
      small: "/ops/att/small/striker.webp",
      full: "/ops/att/full/striker.webp",
    },
  },
  {
    name: "Sledge",
    icon: {
      small: "/ops/att/small/sledge.webp",
      full: "/ops/att/full/sledge.webp",
    },
  },
  {
    name: "Thatcher",
    icon: {
      small: "/ops/att/small/thatcher.webp",
      full: "/ops/att/full/thatcher.webp",
    },
  },
  {
    name: "Ash",
    icon: {
      small: "/ops/att/ashsmall/.webp",
      full: "/ops/att/full/ash.webp",
    },
  },
  {
    name: "Thermite",
    icon: {
      small: "/ops/att/small/thermite.webp",
      full: "/ops/att/full/thermite.webp",
    },
  },
  {
    name: "Twitch",
    icon: {
      small: "/ops/att/small/twitch.webp",
      full: "/ops/att/full/twitch.webp",
    },
  },
  {
    name: "Montagne",
    icon: {
      small: "/ops/att/small/montagne.webp",
      full: "/ops/att/full/montagne.webp",
    },
  },
  {
    name: "Glaz",
    icon: {
      small: "/ops/att/small/glaz.webp",
      full: "/ops/att/full/glaz.webp",
    },
  },
  {
    name: "Fuze",
    icon: {
      small: "/ops/att/small/fuze.webp",
      full: "/ops/att/full/fuze.webp",
    },
  },
  {
    name: "Blitz",
    icon: {
      small: "/ops/att/small/blitz.webp",
      full: "/ops/att/full/blitz.webp",
    },
  },
  {
    name: "IQ",
    icon: {
      small: "/ops/att/iq.small/webp",
      full: "/ops/att/full/iq.webp",
    },
  },
  {
    name: "Buck",
    icon: {
      small: "/ops/att/small/buck.webp",
      full: "/ops/att/full/buck.webp",
    },
  },
  {
    name: "Blackbeard",
    icon: {
      small: "/ops/att/small/blackbeard.webp",
      full: "/ops/att/full/blackbeard.webp",
    },
  },
  {
    name: "Capitao",
    icon: {
      small: "/ops/att/small/capitao.webp",
      full: "/ops/att/full/capitao.webp",
    },
  },
  {
    name: "Hibana",
    icon: {
      small: "/ops/att/small/hibana.webp",
      full: "/ops/att/full/hibana.webp",
    },
  },
  {
    name: "Jackal",
    icon: {
      small: "/ops/att/small/jackal.webp",
      full: "/ops/att/full/jackal.webp",
    },
  },
  {
    name: "Ying",
    icon: {
      small: "/ops/att/small/ying.webp",
      full: "/ops/att/full/ying.webp",
    },
  },
  {
    name: "Zofia",
    icon: {
      small: "/ops/att/small/zofia.webp",
      full: "/ops/att/full/zofia.webp",
    },
  },
  {
    name: "Dokkaebi",
    icon: {
      small: "/ops/att/small/dokkaebi.webp",
      full: "/ops/att/full/dokkaebi.webp",
    },
  },
  {
    name: "Lion",
    icon: {
      small: "/ops/att/small/lion.webp",
      full: "/ops/att/full/lion.webp",
    },
  },
  {
    name: "Finka",
    icon: {
      small: "/ops/att/small/finka.webp",
      full: "/ops/att/full/finka.webp",
    },
  },
  {
    name: "Maverick",
    icon: {
      small: "/ops/att/small/maverick.webp",
      full: "/ops/att/full/maverick.webp",
    },
  },
  {
    name: "Nomad",
    icon: {
      small: "/ops/att/small/nomad.webp",
      full: "/ops/att/full/nomad.webp",
    },
  },
  {
    name: "Gridlock",
    icon: {
      small: "/ops/att/small/gridlock.webp",
      full: "/ops/att/full/gridlock.webp",
    },
  },
  {
    name: "Nøkk",
    icon: {
      small: "/ops/att/small/nokk.webp",
      full: "/ops/att/full/nokk.webp",
    },
  },
  {
    name: "Amaru",
    icon: {
      small: "/ops/att/small/amaru.webp",
      full: "/ops/att/full/amaru.webp",
    },
  },
  {
    name: "Kali",
    icon: {
      small: "/ops/att/small/kali.webp",
      full: "/ops/att/full/kali.webp",
    },
  },
  {
    name: "Iana",
    icon: {
      small: "/ops/att/small/iana.webp",
      full: "/ops/att/full/iana.webp",
    },
  },
  {
    name: "Ace",
    icon: {
      small: "/ops/att/acesmall/.webp",
      full: "/ops/att/full/ace.webp",
    },
  },
  {
    name: "Zero",
    icon: {
      small: "/ops/att/small/zero.webp",
      full: "/ops/att/full/zero.webp",
    },
  },
  {
    name: "Flores",
    icon: {
      small: "/ops/att/small/flores.webp",
      full: "/ops/att/full/flores.webp",
    },
  },
  {
    name: "Osa",
    icon: {
      small: "/ops/att/osasmall/.webp",
      full: "/ops/att/full/osa.webp",
    },
  },
  {
    name: "Sens",
    icon: {
      small: "/ops/att/small/sens.webp",
      full: "/ops/att/full/sens.webp",
    },
  },
  {
    name: "Grim",
    icon: {
      small: "/ops/att/small/grim.webp",
      full: "/ops/att/full/grim.webp",
    },
  },
  {
    name: "Brava",
    icon: {
      small: "/ops/att/small/brava.webp",
      full: "/ops/att/full/brava.webp",
    },
  },
  {
    name: "Ram",
    icon: {
      small: "/ops/att/ramsmall/.webp",
      full: "/ops/att/full/ram.webp",
    },
  },
  {
    name: "Deimos",
    icon: {
      small: "/ops/att/small/deimos.webp",
      full: "/ops/att/full/deimos.webp",
    },
  },
  {
    name: "Rauora",
    icon: {
      small: "/ops/att/small/rauora.webp",
      full: "/ops/att/full/rauora.webp",
    },
  },
];

const DEFENDERS = [
  {
    name: "Sentry",
    icon: {
      small: "/ops/def/small/sentry.webp",
      full: "/ops/def/full/sentry.webp",
    },
  },
  {
    name: "Smoke",
    icon: {
      small: "/ops/def/small/smoke.webp",
      full: "/ops/def/full/smoke.webp",
    },
  },
  {
    name: "Mute",
    icon: {
      small: "/ops/def/small/mute.webp",
      full: "/ops/def/full/mute.webp",
    },
  },
  {
    name: "Castle",
    icon: {
      small: "/ops/def/small/castle.webp",
      full: "/ops/def/full/castle.webp",
    },
  },
  {
    name: "Pulse",
    icon: {
      small: "/ops/def/small/pulse.webp",
      full: "/ops/def/full/pulse.webp",
    },
  },
  {
    name: "Doc",
    icon: {
      small: "/ops/def/small/doc.webp",
      full: "/ops/def/full/doc.webp",
    },
  },
  {
    name: "Rook",
    icon: {
      small: "/ops/def/small/rook.webp",
      full: "/ops/def/full/rook.webp",
    },
  },
  {
    name: "Kapkan",
    icon: {
      small: "/ops/def/small/kapkan.webp",
      full: "/ops/def/full/kapkan.webp",
    },
  },
  {
    name: "Tachanka",
    icon: {
      small: "/ops/def/small/tachanka.webp",
      full: "/ops/def/full/tachanka.webp",
    },
  },
  {
    name: "Jäger",
    icon: {
      small: "/ops/def/small/jager.webp",
      full: "/ops/def/full/jager.webp",
    },
  },
  {
    name: "Bandit",
    icon: {
      small: "/ops/def/small/bandit.webp",
      full: "/ops/def/full/bandit.webp",
    },
  },
  {
    name: "Frost",
    icon: {
      small: "/ops/def/small/frost.webp",
      full: "/ops/def/full/frost.webp",
    },
  },
  {
    name: "Valkyrie",
    icon: {
      small: "/ops/def/small/valkyrie.webp",
      full: "/ops/def/full/valkyrie.webp",
    },
  },
  {
    name: "Caveira",
    icon: {
      small: "/ops/def/small/caveira.webp",
      full: "/ops/def/full/caveira.webp",
    },
  },
  {
    name: "Echo",
    icon: {
      small: "/ops/def/small/echo.webp",
      full: "/ops/def/full/echo.webp",
    },
  },
  {
    name: "Mira",
    icon: {
      small: "/ops/def/small/mira.webp",
      full: "/ops/def/full/mira.webp",
    },
  },
  {
    name: "Lesion",
    icon: {
      small: "/ops/def/small/lesion.webp",
      full: "/ops/def/full/lesion.webp",
    },
  },
  {
    name: "Ela",
    icon: {
      small: "/ops/def/small/ela.webp",
      full: "/ops/def/full/ela.webp",
    },
  },
  {
    name: "Vigil",
    icon: {
      small: "/ops/def/small/vigil.webp",
      full: "/ops/def/full/vigil.webp",
    },
  },
  {
    name: "Maestro",
    icon: {
      small: "/ops/def/small/maestro.webp",
      full: "/ops/def/full/maestro.webp",
    },
  },
  {
    name: "Alibi",
    icon: {
      small: "/ops/def/small/alibi.webp",
      full: "/ops/def/full/alibi.webp",
    },
  },
  {
    name: "Clash",
    icon: {
      small: "/ops/def/small/clash.webp",
      full: "/ops/def/full/clash.webp",
    },
  },
  {
    name: "Kaid",
    icon: {
      small: "/ops/def/small/kaid.webp",
      full: "/ops/def/full/kaid.webp",
    },
  },
  {
    name: "Mozzie",
    icon: {
      small: "/ops/def/small/mozzie.webp",
      full: "/ops/def/full/mozzie.webp",
    },
  },
  {
    name: "Warden",
    icon: {
      small: "/ops/def/small/warden.webp",
      full: "/ops/def/full/warden.webp",
    },
  },
  {
    name: "Goyo",
    icon: {
      small: "/ops/def/small/goyo.webp",
      full: "/ops/def/full/goyo.webp",
    },
  },
  {
    name: "Wamai",
    icon: {
      small: "/ops/def/small/wamai.webp",
      full: "/ops/def/full/wamai.webp",
    },
  },
  {
    name: "Oryx",
    icon: {
      small: "/ops/def/small/oryx.webp",
      full: "/ops/def/full/oryx.webp",
    },
  },
  {
    name: "Melusi",
    icon: {
      small: "/ops/def/small/melusi.webp",
      full: "/ops/def/full/melusi.webp",
    },
  },
  {
    name: "Aruni",
    icon: {
      small: "/ops/def/small/aruni.webp",
      full: "/ops/def/full/aruni.webp",
    },
  },
  {
    name: "Thunderbird",
    icon: {
      small: "/ops/def/small/thunderbird.webp",
      full: "/ops/def/full/thunderbird.webp",
    },
  },
  {
    name: "Thorn",
    icon: {
      small: "/ops/def/small/thorn.webp",
      full: "/ops/def/full/thorn.webp",
    },
  },
  {
    name: "Azami",
    icon: {
      small: "/ops/def/small/azami.webp",
      full: "/ops/def/full/azami.webp",
    },
  },
  {
    name: "Solis",
    icon: {
      small: "/ops/def/small/solis.webp",
      full: "/ops/def/full/solis.webp",
    },
  },
  {
    name: "Fenrir",
    icon: {
      small: "/ops/def/small/fenrir.webp",
      full: "/ops/def/full/fenrir.webp",
    },
  },
  {
    name: "Tubarão",
    icon: {
      small: "/ops/def/small/tubarao.webp",
      full: "/ops/def/full/tubarao.webp",
    },
  },
  {
    name: "Skopós",
    icon: {
      small: "/ops/def/small/skopos.webp",
      full: "/ops/def/full/skopos.webp",
    },
  },
];

export type Operator = (typeof ATTACKERS)[number] | (typeof DEFENDERS)[number];

export { ATTACKERS, DEFENDERS };
