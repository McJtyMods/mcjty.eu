import * as z from "zod";

const mcid = z
  .string()
  .regex(
    /^[a-z0-9_.-]+:[a-z0-9_./-]+$/,
    "Invalid minecraft id. Format is <modid>:<id>",
  );
const modid = z
  .string()
  .regex(
    /^[a-z0-9_.-]+$/,
    "Invalid mod id. Use lowercase letters, numbers, underscores, dots, or hyphens",
  );

const stringOrStrings = z.string().or(z.array(z.string()));
const idOrIds = mcid.or(z.array(mcid));
const numberCondition = z
  .object({
    name: z.string(),
    expression: z.string(),
  })
  .strict();

const kubeJsNumericOperator = z.enum([
  "=",
  "==",
  "!=",
  "<>",
  ">",
  ">=",
  "<",
  "<=",
]);
const kubeJsVariableCheck = z.union([
  z
    .object({
      variable: z.string().min(1, "KubeJS variable name cannot be empty"),
      bool: z.boolean(),
    })
    .strict(),
  z
    .object({
      variable: z.string().min(1, "KubeJS variable name cannot be empty"),
      condition: z.optional(kubeJsNumericOperator),
      int: z.number().int(),
    })
    .strict(),
  z
    .object({
      variable: z.string().min(1, "KubeJS variable name cannot be empty"),
      condition: z.optional(kubeJsNumericOperator),
      double: z.number(),
    })
    .strict(),
]);
const kubeJsCondition = kubeJsVariableCheck.or(
  z
    .array(kubeJsVariableCheck)
    .min(1, "KubeJS condition needs at least one variable check"),
);

const counter = z
  .object({
    mob: z.optional(mcid.or(z.array(mcid))),
    amount: z.number().int(),
    perplayer: z.optional(z.boolean()),
    perchunk: z.optional(z.boolean()),
    mod: z.optional(modid),
    hostile: z.optional(z.boolean()),
    passive: z.optional(z.boolean()),
    all: z.optional(z.boolean()),
  })
  .strict();

const itemWeighted = z
  .object({
    factor: z.optional(z.number()),
    item: z.optional(mcid),
    damage: z.optional(z.number().int()),
    count: z.optional(z.number().int()),
    nbt: z.optional(z.string()),
  })
  .strict();

const testExpression = z
  .number()
  .int()
  .or(
    z.string().refine((v) => {
      if (v.startsWith(">=")) {
        return !Number.isNaN(Number.parseInt(v.slice(2), 10));
      }
      if (v.startsWith("<=")) {
        return !Number.isNaN(Number.parseInt(v.slice(2), 10));
      }
      if (v.startsWith(">")) {
        return !Number.isNaN(Number.parseInt(v.slice(1), 10));
      }
      if (v.startsWith("<")) {
        return !Number.isNaN(Number.parseInt(v.slice(1), 10));
      }
      if (v.startsWith("=")) {
        return !Number.isNaN(Number.parseInt(v.slice(1), 10));
      }
      if (v.startsWith("!=") || v.startsWith("<>")) {
        return !Number.isNaN(Number.parseInt(v.slice(2), 10));
      }
      if (v.includes("-")) {
        const range = v.split("-").map((v) => Number.parseInt(v.trim(), 10));
        return range.length === 2 && range[0] <= range[1];
      }
      return !Number.isNaN(Number.parseInt(v, 10));
    }),
  );

const itemTest = z
  .object({
    item: z.optional(mcid),
    empty: z.optional(z.boolean()),
    damage: z.optional(testExpression),
    count: z.optional(testExpression),
    energy: z.optional(testExpression),
    tag: z.optional(mcid),
    mod: z.optional(modid),
    nbt: z.optional(z.array(z.object({}))),
  })
  .strict();

const itemOrIdWeighted = z.string().or(itemWeighted);
const itemOrIdTest = z.string().or(itemTest);

const expression = z.string().refine((v) => {
  const val = v.toLowerCase();
  if (!val.endsWith(")")) return false;
  if (val.startsWith("range(")) {
    const range = val
      .slice(6, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 2 && range[0] <= range[1];
  }
  if (val.startsWith("outsiderange(")) {
    const range = val
      .slice(13, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 2 && range[0] <= range[1];
  }
  if (val.startsWith("greater(")) {
    const range = val
      .slice(8, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("gt(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("smaller(")) {
    const range = val
      .slice(8, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("lt(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("greaterorequal(")) {
    const range = val
      .slice(15, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("ge(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("smallerorequal(")) {
    const range = val
      .slice(15, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("le(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("equal(")) {
    const range = val
      .slice(6, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("eq(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("notequal(")) {
    const range = val
      .slice(9, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("ne(")) {
    const range = val
      .slice(3, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 1;
  }
  if (val.startsWith("repeat(")) {
    const range = val
      .slice(7, -1)
      .split(",")
      .map((v) => parseInt(v.trim(), 10));
    return range.length === 3;
  }
}, "Invalid range expression");

const blockSchema = z
  .object({
    tag: z.optional(mcid),
    block: z.optional(mcid),
    mod: z.optional(modid),
    energy: z.optional(z.string()),
    contains: z.optional(z.string()),
    side: z.optional(z.enum(["up", "down", "north", "south", "east", "west"])),
  })
  .or(z.string());

export const generalSpawnKeywords = z.object({
  result: z.optional(z.enum(["default", "allow", "deny", "deny_with_actions"])),
  continue: z.optional(z.boolean()),
  phase: z.optional(stringOrStrings),
  number: z.optional(numberCondition.or(z.array(numberCondition))),
  random: z.optional(z.number().gte(0).lte(1)),

  mob: z.optional(mcid.or(z.array(mcid))),
  mod: z.optional(modid.or(z.array(modid))),
  dimension: z.optional(mcid.or(z.array(mcid))),
  dimensionmod: z.optional(modid.or(z.array(modid))),

  hostile: z.optional(z.boolean()),
  passive: z.optional(z.boolean()),
  baby: z.optional(z.boolean()),
  canspawnhere: z.optional(z.boolean()),
  notcolliding: z.optional(z.boolean()),
  spawner: z.optional(z.boolean()),
  spawntype: z.optional(stringOrStrings),
  incontrol: z.optional(z.boolean()),
  eventspawn: z.optional(z.boolean()),
  seesky: z.optional(z.boolean()),
  slime: z.optional(z.boolean()),
  nodespawn: z.optional(z.boolean()),

  height: z.optional(expression),
  minheight: z.optional(z.number().int()),
  maxheight: z.optional(z.number().int()),

  time: z.optional(expression),
  mintime: z.optional(z.number().int()),
  maxtime: z.optional(z.number().int()),

  daycount: z.optional(z.number().int().or(expression)),
  mindaycount: z.optional(z.number().int()),
  maxdaycount: z.optional(z.number().int()),

  light: z.optional(expression),
  minlight: z.optional(z.number().int()),
  maxlight: z.optional(z.number().int()),
  minlight_full: z.optional(z.number().int()),
  maxlight_full: z.optional(z.number().int()),
  minlight_sky: z.optional(z.number().int()),
  maxlight_sky: z.optional(z.number().int()),

  weather: z.optional(z.enum(["rain", "thunder"])),
  difficulty: z.optional(z.enum(["peaceful", "easy", "normal", "hard"])),

  biome: z.optional(mcid.or(z.array(mcid))),
  biometags: z.optional(mcid.or(z.array(mcid))),
  biometype: z.optional(
    z.enum(["desert", "desert_legacy", "warm", "cool", "icy"]),
  ),

  mincount: z.optional(z.number().int().or(counter)),
  maxcount: z.optional(z.number().int().or(counter)),

  minspawndist: z.optional(z.number()),
  maxspawndist: z.optional(z.number()),

  mindifficulty: z.optional(z.number()),
  maxdifficulty: z.optional(z.number()),

  block: z.optional(blockSchema.or(z.array(blockSchema))),
  blockoffset: z.optional(z.object({})), // @TODO: add schema

  helmet: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  chestplate: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  leggings: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  boots: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  lackhelmet: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  lackchestplate: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  lackleggings: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  lackboots: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  playerhelditem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),
  helditem: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  lackhelditem: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  offhanditem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),
  lackoffhanditem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),
  bothhandsitem: z.optional(itemOrIdTest.or(z.array(itemOrIdTest))),

  structure: z.optional(idOrIds),
  hasstructure: z.optional(z.boolean()),
  structuretags: z.optional(idOrIds),
  scoreboardtags_all: z.optional(z.string().or(z.array(z.string()))),
  scoreboardtags_any: z.optional(z.string().or(z.array(z.string()))),

  state: z.optional(z.string()),
  pstate: z.optional(z.string()),

  summer: z.optional(z.boolean()),
  winter: z.optional(z.boolean()),
  spring: z.optional(z.boolean()),
  autumn: z.optional(z.boolean()),

  incity: z.optional(z.boolean()),
  instreet: z.optional(z.boolean()),
  insphere: z.optional(z.boolean()),
  inbuilding: z.optional(z.boolean()),
  inmultibuilding: z.optional(z.boolean()),
  building: z.optional(z.string().or(z.array(z.string()))),
  multibuilding: z.optional(z.string().or(z.array(z.string()))),

  gamestage: z.optional(z.string()),

  amulet: z.optional(mcid.or(z.array(mcid))),
  ring: z.optional(mcid.or(z.array(mcid))),
  belt: z.optional(mcid.or(z.array(mcid))),
  trinket: z.optional(mcid.or(z.array(mcid))),
  head: z.optional(mcid.or(z.array(mcid))),
  body: z.optional(mcid.or(z.array(mcid))),
  charm: z.optional(mcid.or(z.array(mcid))),

  message: z.optional(z.string()),
  addscoreboardtags: z.optional(z.string().or(z.array(z.string()))),
  healthset: z.optional(z.number()),
  healthmultiply: z.optional(z.number()),
  healthadd: z.optional(z.number()),
  armorset: z.optional(z.number()),
  armormultiply: z.optional(z.number()),
  armoradd: z.optional(z.number()),
  followrangeset: z.optional(z.number()),
  followrangemultiply: z.optional(z.number()),
  followrangeadd: z.optional(z.number()),
  knockbackset: z.optional(z.number()),
  knockbackmultiply: z.optional(z.number()),
  knockbackadd: z.optional(z.number()),
  knockbackresistanceset: z.optional(z.number()),
  knockbackresistancemultiply: z.optional(z.number()),
  knockbackresistanceadd: z.optional(z.number()),
  speedset: z.optional(z.number()),
  speedmultiply: z.optional(z.number()),
  speedadd: z.optional(z.number()),
  armortoughnessset: z.optional(z.number()),
  armortoughnessmultiply: z.optional(z.number()),
  armortoughnessadd: z.optional(z.number()),
  attackspeedset: z.optional(z.number()),
  attackspeedmultiply: z.optional(z.number()),
  attackspeedadd: z.optional(z.number()),
  damageset: z.optional(z.number()),
  damagemultiply: z.optional(z.number()),
  damageadd: z.optional(z.number()),
  sizemultiply: z.optional(z.number()),
  sizeadd: z.optional(z.number()),
  angry: z.optional(z.boolean()),
  customname: z.optional(z.string()),
  potion: z.optional(stringOrStrings),
  potionnoparticles: z.optional(stringOrStrings),
  ai: z.optional(z.object({}).loose()),
  armorhelmet: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  armorchest: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  armorlegs: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  armorboots: z.optional(itemOrIdWeighted.or(z.array(itemOrIdWeighted))),
  setphase: z.optional(z.string()),
  clearphase: z.optional(z.string()),
  togglephase: z.optional(z.string()),
  changenumber: z.optional(z.string()),
  customevent: z.optional(z.string()),

  nbt: z.optional(z.object({})),

  persecond: z
    .optional(z.any())
    .refine((v) => v === undefined, "'persecond' only works for spawner.json"),
  attempts: z
    .optional(z.any())
    .refine((v) => v === undefined, "'attempts' only works for spawner.json"),
  amount: z
    .optional(z.any())
    .refine((v) => v === undefined, "'amount' only works for spawner.json"),
  conditions: z
    .optional(z.any())
    .refine((v) => v === undefined, "'conditions' only works for spawner.json"),
});

type SpawnRefinementValue = {
  result?: "default" | "allow" | "deny" | "deny_with_actions";
  mincount?: number | z.infer<typeof counter>;
  maxcount?: number | z.infer<typeof counter>;
  minlight?: number;
  maxlight?: number;
};

function spawnRefinement<T extends z.ZodType<SpawnRefinementValue>>(schema: T) {
  return schema
    .refine(
      (v) => !((v.result === "allow" || v.result === "default") && v.mincount),
      "Warning: result=allow and mincount are probably not what you want",
    )
    .refine(
      (v) => !(v.result === "deny" && v.maxcount),
      "Warning: result=deny and maxcount are probably not what you want",
    )
    .refine(
      (v) => !((v.result === "allow" || v.result === "default") && v.minlight),
      "Warning: result=allow and minlight are probably not what you want",
    )
    .refine(
      (v) => !(v.result === "deny" && v.maxlight),
      "Warning: result=deny and maxlight are probably not what you want",
    );
}

export const spawnSchema1_20 = z.array(
  spawnRefinement(
    generalSpawnKeywords
      .omit({
        structure: true,
      })
      .extend({
        structure: z.optional(mcid.or(z.array(mcid))),
        when: z.optional(z.enum(["position", "onjoin", "finalize", "despawn"])),
        hasstructure: z.optional(z.boolean()),
        structuretags: z.optional(mcid.or(z.array(mcid))),
        cave: z.optional(z.boolean()),
        kubejs: z.optional(kubeJsCondition),
      })
      .strict(),
  ),
);

export const spawnSchema1_19 = z.array(
  spawnRefinement(
    generalSpawnKeywords
      .omit({
        structure: true,
      })
      .extend({
        structure: z.optional(mcid.or(z.array(mcid))),
        onjoin: z.optional(z.boolean()),
        hasstructure: z.optional(z.boolean()),
        structuretags: z.optional(mcid.or(z.array(mcid))),
      })
      .strict(),
  ),
);

export const spawnSchema1_18 = z.array(
  spawnRefinement(
    generalSpawnKeywords
      .extend({
        onjoin: z.optional(z.boolean()),
      })
      .strict(),
  ),
);

const spawnerPositionCheck = z
  .object({
    mintime: z.optional(z.number().int()),
    maxtime: z.optional(z.number().int()),
    minlight: z.optional(z.number().int().gte(0).lte(15)),
    maxlight: z.optional(z.number().int().gte(0).lte(15)),
    minlight_full: z.optional(z.number().int().gte(0).lte(15)),
    maxlight_full: z.optional(z.number().int().gte(0).lte(15)),
    minlight_sky: z.optional(z.number().int().gte(0).lte(15)),
    maxlight_sky: z.optional(z.number().int().gte(0).lte(15)),
    biome: z.optional(idOrIds),
    biometags: z.optional(idOrIds),
    seesky: z.optional(z.boolean()),
    cave: z.optional(z.boolean()),
    structure: z.optional(idOrIds),
    hasstructure: z.optional(z.boolean()),
    structuretags: z.optional(idOrIds),
    incity: z.optional(z.boolean()),
    inbuilding: z.optional(z.boolean()),
    inmultibuilding: z.optional(z.boolean()),
    building: z.optional(stringOrStrings),
    multibuilding: z.optional(stringOrStrings),
    instreet: z.optional(z.boolean()),
    insphere: z.optional(z.boolean()),
    gamestage: z.optional(z.string()),
    summer: z.optional(z.boolean()),
    winter: z.optional(z.boolean()),
    spring: z.optional(z.boolean()),
    autumn: z.optional(z.boolean()),
    kubejs: z.optional(kubeJsCondition),
  })
  .strict();

export const spawnerSchema = z.array(
  z
    .object({
      mob: z.optional(mcid.or(z.array(mcid))),
      weights: z.optional(z.array(z.number())),
      mobsfrombiome: z.optional(
        z.enum([
          "monster",
          "creature",
          "ambient",
          "water_creature",
          "water_ambient",
          "misc",
        ]),
      ),
      phase: z.optional(stringOrStrings),
      number: z.optional(numberCondition.or(z.array(numberCondition))),
      addscoreboardtags: z.optional(z.string().or(z.array(z.string()))),
      attempts: z.optional(z.number().int().positive()),
      persecond: z.optional(z.number().gte(0).lte(1)),
      result: z
        .optional(z.any())
        .refine((v) => v === undefined, "'result' only works for spawn.json"),
      amount: z.optional(
        z
          .object({
            minimum: z.optional(z.number().int().positive()),
            maximum: z.optional(z.number().int().positive()),
            groupdistance: z.optional(z.number().int().positive()),
          })
          .strict()
          .refine(
            (value) =>
              value.minimum === undefined ||
              value.maximum === undefined ||
              value.minimum <= value.maximum,
            "Minimum amount must not be greater than maximum amount",
          ),
      ),
      conditions: z
        .object({
          dimension: mcid.or(
            z
              .array(mcid)
              .refine((v) => v.length > 0, "Must have at least one dimension"),
          ),
          norestrictions: z.optional(z.boolean()),
          inliquid: z.optional(z.boolean()),
          inwater: z.optional(z.boolean()),
          inlava: z.optional(z.boolean()),
          inair: z.optional(z.boolean()),
          validspawn: z.optional(z.boolean()),
          sturdy: z.optional(z.boolean()),
          mindaycount: z.optional(z.number().int()),
          maxdaycount: z.optional(z.number().int()),
          mindist: z.optional(z.number()),
          maxdist: z.optional(z.number()),
          minheight: z.optional(z.number().int()),
          maxheight: z.optional(z.number().int()),
          minverticaldist: z.optional(z.number()),
          maxverticaldist: z.optional(z.number()),
          maxthis: z.optional(z.number().int()),
          maxtotal: z.optional(z.number().int()),
          maxpeaceful: z.optional(z.number().int()),
          maxhostile: z.optional(z.number().int()),
          maxneutral: z.optional(z.number().int()),
          maxlocal: z.optional(z.number().int()),
          and: z.optional(spawnerPositionCheck),
          not: z.optional(spawnerPositionCheck),
        })
        .strict()
        .refine(
          (value) =>
            value.mindist === undefined ||
            value.maxdist === undefined ||
            value.mindist < value.maxdist,
          "Minimum distance must be smaller than maximum distance",
        )
        .refine(
          (value) =>
            value.minheight === undefined ||
            value.maxheight === undefined ||
            value.minheight < value.maxheight,
          "Minimum height must be smaller than maximum height",
        ),
    })
    .strict()
    .refine(
      (value) => value.mob !== undefined || value.mobsfrombiome !== undefined,
      "Specify either 'mob' or 'mobsfrombiome'",
    )
    .refine(
      (value) =>
        !(value.mob !== undefined && value.mobsfrombiome !== undefined),
      "'mob' and 'mobsfrombiome' cannot be combined",
    ),
);

export const phasesSchema = z
  .array(
    z
      .object({
        name: z.string(),
        conditions: z
          .object({
            time: z.optional(expression),
            mintime: z.optional(z.number().int()),
            maxtime: z.optional(z.number().int()),

            daycount: z.optional(expression),
            mindaycount: z.optional(z.number().int()),
            maxdaycount: z.optional(z.number().int()),

            weather: z.optional(z.enum(["rain", "thunder"])),

            summer: z.optional(z.boolean()),
            winter: z.optional(z.boolean()),
            spring: z.optional(z.boolean()),
            autumn: z.optional(z.boolean()),

            state: z.optional(z.string()),
            kubejs: z.optional(kubeJsCondition),
          })
          .strict(),
      })
      .strict(),
  )
  .refine((v) => {
    const names = v.map((phase) => phase.name);
    return new Set(names).size === names.length;
  }, "Phase names must be unique");
