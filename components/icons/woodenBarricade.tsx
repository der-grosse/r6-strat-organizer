import VariableWidthIcon from "./variableWidthIcon";

const WoodenBarricade = VariableWidthIcon({
  parts: {
    left: {
      src: "/gadgets/barricade_end_left.png",
      alt: "Wooden Barricade End Left",
    },
    right: {
      src: "/gadgets/barricade_end_right.png",
      alt: "Wooden Barricade End Right",
    },
    between: {
      src: "/gadgets/barricade_middle.png",
      alt: "Wooden Barricade",
    },
    middle: {
      src: "/gadgets/barricade_x.png",
      alt: "Wooden Barricade Middle",
    },
  },
});

export default WoodenBarricade;
