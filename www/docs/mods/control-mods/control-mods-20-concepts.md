---
sidebar_position: 5
title: How In Control rules work
---

# How In Control rules work

Read this after completing the [getting started guide](./control-mods-20-getting-started.md). It explains the few ideas that make larger configurations predictable.

## A rule has conditions and actions

A condition asks a question, such as “is this a zombie?” or “is the position in the Overworld?” An action says what to do when every condition matches.

```json
{
  "mob": "minecraft:zombie",
  "dimension": "minecraft:overworld",
  "result": "deny"
}
```

In ordinary language: “When an Overworld spawn attempt is a zombie, deny it.”

All conditions in the same rule must match. If you want to match one of several mobs or dimensions, many fields accept a list:

```json
{
  "mob": ["minecraft:zombie", "minecraft:skeleton"],
  "result": "deny"
}
```

## Rules are checked from top to bottom

For most rule files, the first matching rule is used and later rules are skipped. Put narrow exceptions before broad rules.

```json title="spawn.json"
[
  {
    "mob": "minecraft:zombie",
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

For a zombie, evaluation looks like this:

```text
Rule 1: Is it a zombie?       yes → preserve the spawn and stop
Rule 2: Is it hostile?        not evaluated
```

For a skeleton:

```text
Rule 1: Is it a zombie?       no  → continue
Rule 2: Is it hostile?        yes → deny and stop
```

If the broad hostile denial came first, the zombie exception would never be reached.

The `continue` field is an advanced exception. When it is `true`, the actions of a matching rule run and evaluation continues. `spawner.json` and `loot.json` also differ because all matching rules can contribute. Check the reference for the file you are editing.

## `spawn.json` and `spawner.json` solve different problems

`spawn.json` reacts to an attempt. An `allow` rule does not cause Minecraft to make more attempts, so a file containing only an allow rule often changes nothing.

`spawner.json` actively makes extra attempts. A typical “more zombies” configuration therefore begins in `spawner.json`. Use `spawn.json` as well only when the extra attempts need filtering or the spawned mobs need modification.

## The spawn lifecycle

The `when` field selects the moment at which a `spawn.json` rule is evaluated:

```text
position ─────→ onjoin ─────→ finalize ─────→ mob exists
   │               │              │
spawn location   entity enters   equipment, AI,
is checked       the world       and stats finish

                                         despawn
                                            ↑
                                    checked much later
```

| `when` value | Best used for | Important behavior |
|---|---|---|
| `position` | Ordinary natural-spawn restrictions | Default when `when` is omitted; does not cover every way an entity can enter the world |
| `onjoin` | Strong allow/deny checks, spawn eggs, commands, and difficult modded mobs | Also runs when an entity enters a dimension; use conditions carefully |
| `finalize` | Health, damage, speed, equipment, NBT, and AI changes | Runs at the final spawn setup stage |
| `despawn` | Preventing or allowing despawning | Not a spawn check |

Rules are ordered separately within each lifecycle category. Matching an `onjoin` rule does not prevent a later `finalize` category from being evaluated unless the entity itself was denied.

## Results

| Result | Meaning | Do other actions run? |
|---|---|---:|
| `default` | Preserve the normal Minecraft decision and restrictions | Yes |
| `allow` | Explicitly allow, bypassing applicable normal restrictions | Yes |
| `deny` | Cancel the spawn | No |
| `deny_with_actions` | Run actions, then cancel the spawn | Yes |

At `finalize`, `default` lets normal finalization continue—for example, a skeleton can receive its normal bow. An explicit `allow` takes over that decision, so use it only when that is intended.

## `norestrictions` is powerful

In `spawner.json`, `norestrictions` bypasses mob-specific restrictions such as light rules. On 1.20.1 it also bypasses the `position` stage of `spawn.json` for that spawn attempt.

If a `spawner.json` rule uses `norestrictions` and a related `spawn.json` rule appears to do nothing, either:

- remove `norestrictions` and handle the normal restrictions deliberately; or
- evaluate the `spawn.json` rule with `"when": "onjoin"`.

## Chance and attempts are not the same thing

In `spawner.json`:

- `persecond` is the chance, once per second, that the rule starts a spawn operation. `0.5` means a 50% chance each second.
- `attempts` is how many positions In Control may try while looking for a usable spawn location.
- `amount` is how many mobs it tries to place when the operation runs.
- count limits such as `maxthis` prevent unlimited accumulation.

Always give an active spawner rule sensible distance, height, dimension, and count limits. Start conservatively and adjust one value at a time.

## Internal days are not the Minecraft day number

In Control counts night-to-day transitions. Use `/incontrol days` to see or change its counter. Changing time with the vanilla `/time` command does not directly set this counter.
