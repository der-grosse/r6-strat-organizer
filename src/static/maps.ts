const MAPS: R6Map[] = [
  {
    name: "Bank",
    sites: ["2F CEO", "B Lockers", "1F Open Area", "1F Teller's"],
    floors: [
      { floor: "B", src: "/map_blueprints/bank/B.jpg" },
      { floor: "1F", src: "/map_blueprints/bank/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/bank/2F.jpg" },
    ],
  },
  {
    name: "Border",
    sites: ["2F Armory", "1F Bathroom", "1F Workshop"],
    floors: [
      { floor: "1F", src: "/map_blueprints/border/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/border/2F.jpg" },
    ],
  },
  {
    name: "Chalet",
    sites: ["1F Bar", "2F Master", "B Snow", "1F Kitchen"],
    floors: [
      {
        floor: "B",
        src: "/map_blueprints/chalet/B.jpg",
      },
      { floor: "1F", src: "/map_blueprints/chalet/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/chalet/2F.jpg" },
    ],
  },
  {
    name: "Clubhouse",
    sites: ["2F Gym", "B Church", "2F CCTV"],
    floors: [
      { floor: "B", src: "/map_blueprints/clubhouse/B.png" },
      { floor: "1F", src: "/map_blueprints/clubhouse/1F.png" },
      { floor: "2F", src: "/map_blueprints/clubhouse/2F.png" },
    ],
  },
  {
    name: "Consulate",
    sites: ["2F Consul", "B Garage", "1F Piano", "B/1F Server"],
    floors: [
      { floor: "B", src: "/map_blueprints/consulate/B.jpg" },
      { floor: "1F", src: "/map_blueprints/consulate/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/consulate/2F.jpg" },
    ],
  },
  {
    name: "Kafe",
    sites: ["3F Cocktail", "1F Kitchen", "2F Reading"],
    floors: [
      { floor: "1F", src: "/map_blueprints/kafe/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/kafe/2F.jpg" },
      { floor: "3F", src: "/map_blueprints/kafe/3F.jpg" },
    ],
  },
  {
    name: "Lair",
    sites: ["2F R6 Room", "1F Bunks", "B Lab"],
    floors: [
      { floor: "B", src: "/map_blueprints/lair/B.png" },
      { floor: "1F", src: "/map_blueprints/lair/1F.png" },
      { floor: "2F", src: "/map_blueprints/lair/2F.png" },
    ],
  },
  {
    name: "Nighthaven",
    sites: ["2F Server", "B Tank", "1F Storage", "1F Kitchen"],
    floors: [
      { floor: "B", src: "/map_blueprints/nighthaven/B.jpg" },
      { floor: "1F", src: "/map_blueprints/nighthaven/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/nighthaven/2F.jpg" },
    ],
  },
  {
    name: "Skyscraper",
    sites: ["2F Tea", "2F Exhibition", "1F Kitchen"],
    floors: [
      { floor: "1F", src: "/map_blueprints/skyscraper/1F.jpg" },
      { floor: "2F", src: "/map_blueprints/skyscraper/2F.jpg" },
    ],
  },
];

export default MAPS;
