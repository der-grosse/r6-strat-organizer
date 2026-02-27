import VariableWidthIcon from "./variableWidthIcon";

const CastleBarricade = VariableWidthIcon({
  parts: {
    end: {
      src: "/gadgets/castle_end_left.png",
      alt: "Castle Barricade End Left",
    },
    between: {
      src: "/gadgets/castle_beam.png",
      alt: "Castle Barricade",
    },
    middle: {
      src: "/gadgets/castle_middle.png",
      alt: "Castle Barricade Middle",
    },
  },
});

export default CastleBarricade;
