import Bank1F from "@/components/StratEditor/maps/bank/1f";
import Bank2F from "@/components/StratEditor/maps/bank/2f";
import BankB from "@/components/StratEditor/maps/bank/B";
import Chalet1F from "@/components/StratEditor/maps/chalet/1f";
import Chalet2F from "@/components/StratEditor/maps/chalet/2F";
import ChaletB from "@/components/StratEditor/maps/chalet/B";
import Clubhouse1F from "@/components/StratEditor/maps/clubhouse/1f";
import Clubhouse2F from "@/components/StratEditor/maps/clubhouse/2f";
import ClubhouseB from "@/components/StratEditor/maps/clubhouse/B";
import Consulate1F from "@/components/StratEditor/maps/consulate/1F";
import Consulate2F from "@/components/StratEditor/maps/consulate/2F";
import ConsulateB from "@/components/StratEditor/maps/consulate/B";
import LairB from "@/components/StratEditor/maps/lair/b";
import Lair1F from "@/components/StratEditor/maps/lair/1f";
import Lair2F from "@/components/StratEditor/maps/lair/2f";
import { R6Map } from "../types/strat.types";

const MAPS: R6Map[] = [
  {
    name: "Bank",
    sites: ["2F CEO", "B Lockers", "1F Open Area", "1F Teller's"],
    floors: [
      {
        floor: "B",
        src: "/map_blueprints/bank/b.png",
        clickables: BankB,
      },
      {
        floor: "1F",
        src: "/map_blueprints/bank/1f.png",
        clickables: Bank1F,
      },
      {
        floor: "2F",
        src: "/map_blueprints/bank/2f.png",
        clickables: Bank2F,
      },
    ],
  },
  {
    name: "Border",
    sites: ["2F Armory", "1F Bathroom", "1F Workshop", "1F Customs"],
    floors: [
      { floor: "1F", src: "/map_blueprints/border/1f.jpg" },
      { floor: "2F", src: "/map_blueprints/border/2f.jpg" },
    ],
  },
  {
    name: "Chalet",
    sites: ["2F Master", "1F Bar", "1F Kitchen", "B Snow"],
    floors: [
      {
        floor: "B",
        src: "/map_blueprints/chalet/b.png",
        clickables: ChaletB,
      },
      {
        floor: "1F",
        src: "/map_blueprints/chalet/1f.png",
        clickables: Chalet1F,
      },
      {
        floor: "2F",
        src: "/map_blueprints/chalet/2f.png",
        clickables: Chalet2F,
      },
    ],
  },
  {
    name: "Clubhouse",
    sites: ["2F Gym", "B Church", "2F CCTV", "1F Bar"],
    floors: [
      {
        floor: "B",
        src: "/map_blueprints/clubhouse/b.png",
        clickables: ClubhouseB,
      },
      {
        floor: "1F",
        src: "/map_blueprints/clubhouse/1f.png",
        clickables: Clubhouse1F,
      },
      {
        floor: "2F",
        src: "/map_blueprints/clubhouse/2f.png",
        clickables: Clubhouse2F,
      },
    ],
  },
  {
    name: "Consulate",
    sites: ["2F Consul", "B Garage", "1F Piano", "B/1F Server"],
    floors: [
      {
        floor: "B",
        src: "/map_blueprints/consulate/b.png",
        clickables: ConsulateB,
      },
      {
        floor: "1F",
        src: "/map_blueprints/consulate/1f.png",
        clickables: Consulate1F,
      },
      {
        floor: "2F",
        src: "/map_blueprints/consulate/2f.png",
        clickables: Consulate2F,
      },
    ],
  },
  {
    name: "Fortress",
    sites: ["2F Games", "2F Bathroom", "1F Cafeteria", "1F Sitting"],
    floors: [
      {
        floor: "1F",
        src: "/map_blueprints/fortress/1f.png",
      },
      {
        floor: "2F",
        src: "/map_blueprints/fortress/2f.png",
      },
    ],
  },
  {
    name: "Kafe",
    sites: ["3F Cocktail", "1F Kitchen", "2F Reading", "2F Mining"],
    floors: [
      { floor: "1F", src: "/map_blueprints/kafe/1f.jpg" },
      { floor: "2F", src: "/map_blueprints/kafe/2f.jpg" },
      { floor: "3F", src: "/map_blueprints/kafe/3f.jpg" },
    ],
  },
  {
    name: "Lair",
    sites: ["2F R6 Room", "1F Bunks", "1F Armory", "B Lab"],
    floors: [
      { floor: "B", src: "/map_blueprints/lair/b.png", clickables: LairB },
      { floor: "1F", src: "/map_blueprints/lair/1f.png", clickables: Lair1F },
      { floor: "2F", src: "/map_blueprints/lair/2f.png", clickables: Lair2F },
    ],
  },
  {
    name: "Nighthaven",
    sites: ["2F Server", "B Tank", "1F Storage", "1F Kitchen"],
    floors: [
      { floor: "B", src: "/map_blueprints/nighthaven/b.jpg" },
      { floor: "1F", src: "/map_blueprints/nighthaven/1f.jpg" },
      { floor: "2F", src: "/map_blueprints/nighthaven/2f.jpg" },
    ],
  },
  {
    name: "Skyscraper",
    sites: ["2F Tea", "2F Exhibition", "1F Kitchen", "1F Bedroom"],
    floors: [
      { floor: "1F", src: "/map_blueprints/skyscraper/1f.jpg" },
      { floor: "2F", src: "/map_blueprints/skyscraper/2f.jpg" },
    ],
  },
];

export default MAPS;
