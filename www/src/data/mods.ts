type ModCategory = "Tech" | "Worldgen" | "Utility" | "Library" | "Adventure";

export type Mod = {
  name: string;
  category: ModCategory;
  description: string;
  /** Route on this site, relative to the base URL. */
  docs?: string;
  /** CurseForge project slug under /minecraft/mc-mods/. */
  curseforge?: string;
};

export const CURSEFORGE_AUTHOR_URL =
  "https://www.curseforge.com/members/mcjty/projects";

export const MODS: Mod[] = [
  {
    name: "RFTools",
    category: "Tech",
    description:
      "The RF-based tech family: builder, storage, power, utility, and more.",
    docs: "/docs/mods/rftools",
    curseforge: "rftools-base",
  },
  {
    name: "RFTools Dimensions",
    category: "Worldgen",
    description: "Craft custom dimensions from dimlets and keep them powered.",
    docs: "/docs/mods/rftools-dimensions",
    curseforge: "rftools-dimensions",
  },
  {
    name: "RFTools Control",
    category: "Tech",
    description:
      "Visual programming for automation with processors and opcodes.",
    docs: "/docs/mods/rftools-control",
    curseforge: "rftools-control",
  },
  {
    name: "XNet",
    category: "Tech",
    description: "One cable network for items, fluids, energy, and logic.",
    docs: "/docs/mods/xnet",
    curseforge: "xnet",
  },
  {
    name: "Deep Resonance",
    category: "Tech",
    description: "Grow resonating crystals and turn them into serious power.",
    docs: "/docs/mods/deep-resonance",
    curseforge: "deep-resonance",
  },
  {
    name: "The Lost Cities",
    category: "Worldgen",
    description:
      "Explore ruined cities, highways, and railways in a lost world.",
    docs: "/docs/mods/lost-cities",
    curseforge: "the-lost-cities",
  },
  {
    name: "The One Probe",
    category: "Utility",
    description: "Look at any block or entity and learn what it is doing.",
    docs: "/docs/mods/the-one-probe",
    curseforge: "the-one-probe",
  },
  {
    name: "In Control",
    category: "Utility",
    description:
      "Rule files that control mob spawning, loot, and player effects.",
    docs: "/docs/mods/control-mods",
    curseforge: "in-control",
  },
  {
    name: "Fancy Trinkets",
    category: "Adventure",
    description: "Data-driven trinkets with configurable effects and recipes.",
    docs: "/docs/mods/fancy-trinkets",
    curseforge: "fancy-trinkets",
  },
  {
    name: "Enigma",
    category: "Adventure",
    description: "A scripted puzzle and adventure engine for map makers.",
    docs: "/docs/mods/enigma",
  },
  {
    name: "Interaction Wheel",
    category: "Utility",
    description: "A radial menu for quick actions on blocks and inventories.",
    docs: "/docs/mods/interaction-wheel",
    curseforge: "interaction-wheel",
  },
  {
    name: "Gear Swapper",
    category: "Utility",
    description: "Swap complete gear sets with a single click.",
    curseforge: "gear-swapper",
  },
  {
    name: "McJtyLib",
    category: "Library",
    description: "The shared library that powers the rest of these mods.",
    curseforge: "mcjtylib",
  },
  {
    name: "Elemental Dimensions",
    category: "Adventure",
    description: "Five elemental dimensions with their own bosses and loot.",
    docs: "/docs/mods/elemental-dimensions",
  },
  {
    name: "Ariente",
    category: "Adventure",
    description: "A futuristic dimension with cities, guards, and puzzles.",
    docs: "/docs/mods/ariente",
  },
  {
    name: "EFab",
    category: "Tech",
    description: "A multiblock fabricator with staged, gated crafting.",
    docs: "/docs/mods/efab",
  },
];
