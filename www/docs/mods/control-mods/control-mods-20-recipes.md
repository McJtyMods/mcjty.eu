---
sidebar_position: 4
title: Common In Control recipes
---

# Common In Control recipes

Start with the recipe closest to your goal. Copy the complete file, test it, and then change one value at a time. If JSON is unfamiliar, complete [Getting started](./control-mods-20-getting-started.md) first.

## Beginner recipes

### Disable one or more mobs

Use `onjoin` if the restriction must also cover spawn eggs and commands.

```json title="spawn.json"
[
  {
    "mob": ["minecraft:creeper", "minecraft:phantom"],
    "when": "onjoin",
    "result": "deny"
  }
]
```

Test: try both spawn eggs. Neither mob should enter the world.

### Disable natural hostile spawning but keep spawn eggs and commands

Omitting `when` uses the `position` stage. This restricts ordinary spawn-position checks without applying the stronger `onjoin` check.

```json title="spawn.json"
[
  {
    "hostile": true,
    "result": "deny"
  }
]
```

Test this by waiting in a dark area. A spawn egg is not a valid test for this particular rule.

### Permit only selected hostile mobs

Specific exceptions must come before the broad denial.

```json title="spawn.json"
[
  {
    "mob": ["minecraft:zombie", "minecraft:skeleton"],
    "when": "onjoin",
    "result": "default"
  },
  {
    "hostile": true,
    "when": "onjoin",
    "result": "deny"
  }
]
```

## Intermediate recipes

### Make zombies spawn more often

This adds extra attempts; it does not replace vanilla zombie spawning. The count and distance limits are important.

```json title="spawner.json"
[
  {
    "mob": "minecraft:zombie",
    "persecond": 0.25,
    "attempts": 20,
    "amount": {
      "minimum": 1,
      "maximum": 2
    },
    "conditions": {
      "dimension": "minecraft:overworld",
      "mindist": 25,
      "maxdist": 80,
      "minheight": -64,
      "maxheight": 320,
      "maxthis": 80
    }
  }
]
```

Expected behavior: once per second there is a 25% chance to start an operation that tries up to 20 positions and places one or two zombies. It stops adding zombies when 80 of that type are counted.

### Make newly spawned zombies stronger

Use `finalize` for equipment and attributes:

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
    "when": "finalize",
    "healthmultiply": 2.0,
    "damagemultiply": 1.5,
    "armorhelmet": "minecraft:iron_helmet"
  }
]
```

Test: spawn a zombie and verify that it has the helmet. The health and damage changes are easier to confirm in combat or with an entity-inspection tool.

### Keep a safe area around world spawn

This needs two files. First name the area:

```json title="areas.json"
[
  {
    "dimension": "minecraft:overworld",
    "name": "spawn_safe",
    "type": "box",
    "x": 0,
    "y": 64,
    "z": 0,
    "dimx": 50,
    "dimy": 64,
    "dimz": 50
  }
]
```

Then deny hostile mobs in it:

```json title="spawn.json"
[
  {
    "hostile": true,
    "area": "spawn_safe",
    "when": "onjoin",
    "result": "deny"
  }
]
```

Use `/incontrol area` to verify whether your current position is inside `spawn_safe`.

## Advanced projects

These examples combine several systems. Read [How rules work](./control-mods-20-concepts.md) before copying them.

- [Extra mobs in deserts](./control-mods-20-examples.md#spawner-advanced-example-extra-mobs-in-deserts)
- [A world that becomes dangerous after a wither appears](./control-mods-20-examples.md#making-a-dangerous-world-after-spawning-a-wither)
- [Change what a mob spawner produces](./control-mods-20-examples.md#changing-what-a-spawner-spawns)
- [Spawn wither skeletons after enough diamond ore is mined](./control-mods-20-examples.md#spawning-wither-skeletons-as-soon-as-too-many-diamond-ore-blocks-are-mined)
- [Complete zombie apocalypse scenario](./control-mods-20-examples.md#scenario-zombie-apocalypse-world)

The [full examples library](./control-mods-20-examples.md) also includes loot, effects, block interaction, event, phase, area, and custom spawner examples.
