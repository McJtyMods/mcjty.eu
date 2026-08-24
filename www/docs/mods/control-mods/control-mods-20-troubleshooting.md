---
sidebar_position: 6
title: Troubleshooting In Control rules
---

# Troubleshooting In Control rules

When a rule does not work, first determine whether the file failed to load or whether it loaded but does not match the event you are testing.

## The basic checklist

1. Confirm the file is in `config/incontrol` and has the exact expected name.
2. Check that the outermost JSON value is a list: `[` at the start and `]` at the end.
3. Paste the complete file into the [Control Validator](/control-validator).
4. Run `/incontrol reload` after saving.
5. Read any red In Control message in chat.
6. Check the Minecraft server or client log for the detailed parsing error.
7. Temporarily reduce the file to one small rule and test again.
8. Add conditions back one at a time.

The validator currently covers `spawn.json`, `spawner.json`, and `phases.json`. The game and log remain the source of truth for the exact installed mod version.

## “My `spawn.json` allow rule does nothing”

`spawn.json` does not create spawn attempts. Allowing a zombie in a biome does not make Minecraft try to spawn more zombies there.

- To increase or add spawns, create a `spawner.json` rule.
- Use `spawn.json` to reject attempts or modify mobs that are already spawning.

## “My `spawner.json` rule does nothing”

Check these points:

- `dimension` is present inside `conditions`.
- The mob identifier is valid and includes its namespace.
- `mindist` is lower than `maxdist`.
- `minheight` is lower than `maxheight` and covers the player's area.
- A count limit such as `maxthis` has not already been reached. Use `/incontrol list` to inspect current mobs.
- The chosen mob can normally spawn at the attempted position, or you have deliberately configured the needed restrictions.
- The required phase is actually active. Use `/incontrol phases`.

Use `attempts: 20` while testing so In Control has enough chances to find a position. Do not remove all count limits on a production server.

## “Spawn eggs or `/summon` ignore my rule”

The default `spawn.json` stage is `position`, which is aimed at spawn-position checks. Use `"when": "onjoin"` when the rule must also cover entities entering through spawn eggs or commands.

Be aware that `onjoin` is broad: it can also run when an entity enters a dimension.

## “`spawn.json` stopped working after I added `norestrictions`”

On 1.20.1, `norestrictions` in `spawner.json` bypasses the `position` stage. Remove `norestrictions`, or use `"when": "onjoin"` for the related `spawn.json` rule.

## “My specific exception never works”

Rules are usually checked from top to bottom, and evaluation stops at the first match. Put the specific exception before the broad rule:

```json
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

## “Changing `/time` does not activate my day rule”

In Control maintains its own day counter. Run `/incontrol days` to inspect or set it. The counter advances on night-to-day transitions rather than simply mirroring the vanilla world time.

## “The rule loaded, but the result is unexpected”

Turn on `/incontrol debug`, reproduce the problem briefly, and turn it off again. Debug output can be large, so search the log for the mob identifier and the In Control messages around the attempted spawn.

Also verify the value being tested:

- `minlight` and `maxlight` use block light.
- `minlight_sky` and `maxlight_sky` use sky light.
- `minlight_full` and `maxlight_full` use combined light.
- Height is the spawn position, not necessarily the block the player stands on.
- A phase can remain active together with later phases unless its conditions stop matching.

## Useful diagnostic commands

| Command | Use |
|---|---|
| `/incontrol reload` | Reload saved rule files and report parsing errors |
| `/incontrol debug` | Toggle detailed spawn debugging in the log |
| `/incontrol showmobs` | Write registered entity identifiers to the log |
| `/incontrol info` | Show light, time, day, and structure information at your position |
| `/incontrol list` | Count mobs currently present in the dimension |
| `/incontrol days` | Inspect or change the internal day counter |
| `/incontrol phases` | Show active phases |
| `/incontrol numbers` | Show stored named numbers |
| `/incontrol area` | Show the named area at the current position |

If the reduced one-rule test works but the full file does not, rule order or an earlier broad match is usually the next thing to inspect. See [How In Control rules work](./control-mods-20-concepts.md).
