---
sidebar_position: 3
title: Getting started with In Control
---

# Getting started with In Control

This guide assumes that you have never written JSON. By the end, you will have made one rule, reloaded it without restarting Minecraft, and tested that it works.

These instructions are for Minecraft 1.20.1 and newer. Individual settings can differ between versions, so check the version notes in the [technical reference](./control-mods-20.md#version-notes) when copying an advanced rule.

## First: choose the right file

In Control uses several files because they react to different things. For a first configuration, this is the important distinction:

| I want to… | Start with |
|---|---|
| Stop or limit a mob that already spawns | `spawn.json` |
| Make a mob spawn more often | `spawner.json` |
| Add a mob somewhere it does not normally spawn | `spawner.json` |
| Change a spawned mob's health, damage, speed, equipment, or AI | `spawn.json` with `"when": "finalize"` |
| Change drops or experience | `loot.json` or `experience.json` |
| React when a mob dies or a block breaks | `events.json` |
| Prevent breaking, placing, or clicking a block | `breakevents.json`, `placeevents.json`, `leftclicks.json`, or `rightclicks.json` |
| Give a reusable name to a time or world condition | `phases.json` |
| Give a name to a region | `areas.json` |

:::info The most important distinction
`spawn.json` checks spawn attempts that are already happening. It does not create more spawn attempts.

`spawner.json` creates additional spawn attempts. Those mobs can still be checked by `spawn.json`.
:::

```text
Vanilla or another mod tries to spawn a mob
                    ↓
             spawn.json checks it

spawner.json creates an extra spawn attempt
                    ↓
             spawn.json may check it too
```

## Your first rule

We will prevent creepers from entering the world. Using `onjoin` makes this example easy to test with a spawn egg.

1. Open the `config/incontrol` directory of the Minecraft instance or server.
2. Create a plain-text file named `spawn.json` if it does not already exist.
3. Copy the **entire** example below, including the square brackets.

```json title="spawn.json"
[
  {
    "mob": "minecraft:creeper",
    "when": "onjoin",
    "result": "deny"
  }
]
```

4. Save the file.
5. In Minecraft, run `/incontrol reload`.
6. Try to use a creeper spawn egg.

Expected result: the creeper does not appear. To undo the test, replace the file contents with `[]`, save it, and run `/incontrol reload` again.

### What the rule says

- `[` and `]` contain the complete list of rules in this file.
- `{` and `}` contain one rule.
- `"mob": "minecraft:creeper"` is a condition: this rule only matches creepers.
- `"when": "onjoin"` checks an entity as it enters the world. This includes spawn eggs.
- `"result": "deny"` is the action: prevent the matching entity from entering the world.

## JSON survival guide

You only need a few JSON rules to begin using In Control.

### Text needs double quotes

```json
{ "mob": "minecraft:zombie" }
```

Do not use single quotes. Numbers and `true` or `false` do not use quotes:

```json
{
  "maxcount": 20,
  "hostile": true
}
```

### Separate settings with commas

Every setting is followed by a comma except the last setting in the same object:

```json
{
  "mob": "minecraft:zombie",
  "result": "deny"
}
```

### Square brackets mean a list

A file contains a list of rules:

```json
[
  { "mob": "minecraft:creeper", "result": "deny" },
  { "mob": "minecraft:phantom", "result": "deny" }
]
```

Some settings also accept a list. This condition matches either a creeper or a phantom:

```json
{ "mob": ["minecraft:creeper", "minecraft:phantom"] }
```

### Conditions in one rule are combined

This rule matches only zombies that are both in the Overworld **and** above height 100:

```json
{
  "mob": "minecraft:zombie",
  "dimension": "minecraft:overworld",
  "minheight": 100,
  "result": "deny"
}
```

### JSON does not support comments

Do not put `// explanation` or `# explanation` in a rule file. Explanations shown next to examples belong in the documentation, not in the copied JSON.

### Use full Minecraft identifiers

Use identifiers such as `minecraft:zombie`, not just `zombie`. Modded identifiers use the mod id, for example `examplemod:scary_mob`.

## A safe editing routine

Use this loop whenever you change a configuration:

1. Keep a backup of the last working file.
2. Change one small thing.
3. Paste the file into the [Control Validator](/control-validator).
4. Save it in `config/incontrol`.
5. Run `/incontrol reload`.
6. Read any red In Control error message. The log contains more detail.
7. Test the exact situation the rule is meant to affect.

The validator catches many common mistakes, but it does not yet cover every rule file or every version-specific setting. A successful validation is helpful, not a guarantee that the rule expresses what you intended.

## What to read next

- Choose a copyable solution from [Common recipes](./control-mods-20-recipes.md).
- Learn why rule order and spawn timing matter in [How rules work](./control-mods-20-concepts.md).
- If a rule does nothing, follow the [Troubleshooting guide](./control-mods-20-troubleshooting.md).
- Look up every available setting in the [technical reference](./control-mods-20.md) and [condition table](./control-mods-20-table.md).
