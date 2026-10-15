# Tutorial 6 Multiblocks and color coded teleportation

This chapter adds two multiblocks to the Minecraft 1.21.1 project.
A **multiblock** is a group of ordinary blocks that together act as one
machine. Our teleporter forms when the player right-clicks a completed pattern.
Our receiver forms automatically when its last construction block is placed.
Both use three colors to identify a destination, with all interaction happening
in the world.

The examples deliberately use fixed patterns and small helper classes. Start
with `Multiblocks`, follow the two block callbacks into it, and then follow the
teleporter ticker into `ReceiverSavedData`.

## Build and try the two structures

Get **17 Teleporter Bases** and **9 Receiver Bases** from the **Tutorial Mod**
creative tab, and **9 vanilla glass blocks** from Minecraft's creative inventory.
The mod tab also contains the Tutorial Block, Generator, and Pig Spawner from
the earlier chapters. Survival recipes produce eight base blocks from eight
iron ingots around an ender pearl or redstone. The construction roof uses
ordinary glass blocks.

Build the teleporter in four layers. Each diagram is a top view, and each cell
is one block position. `B` is a Teleporter Base, `G` is a vanilla glass block, and
`.` is air.

```text
Layer y+3       Layers y+1 and y+2       Layer y
  G G G              B . B              B B B
  G G G              . . .              B B B
  G G G              B . B              B B B
```

The platform contains nine blocks. The four corner pillars contain another
eight blocks, two above each corner. Use vanilla glass blocks for the nine roof
positions and leave both interior layers empty. Right-click any of the 17
Teleporter Bases with an **empty main hand** to form the machine. Holding a block
item lets you place it normally against a base without sneaking.

An invalid pattern produces a chat message and leaves the blocks intact. A valid
pattern changes every construction position to a state with `formed=true`,
removes the nine glass blocks, replaces the center with a Teleporter, and
replaces one of the four directly adjacent platform blocks with a Destination
Controller. The controller occupies the position closest to the player and
faces outward. Stand on the side where you want its controls before forming.

Build a separate 3×3 platform of Receiver Bases. On the next server tick after
the last placement, its center becomes a Receiver and its other eight blocks
become formed platform pieces. Leave a gap between separate platforms so each
3×3 pattern is unambiguous. A larger solid area can contain several possible
patterns; the first complete unformed square found wins.

The controller has three small color squares on its outward face. The receiver
has three squares **on top**, where they are accessible even though it is the
center of a low platform. Aim at a square and right-click with a dye or a piece
of vanilla colored wool. The corresponding color changes without consuming the
dye or wool, in both survival and creative. These are color indicators, not
inventory slots.

The first color square has a gold frame on both blocks; the other two frames
are dark. The controller's code reads left to right when facing its controls.
Read the code from the gold-framed square toward the opposite end,
even when viewing the receiver from the other side. The gold frame stays the
same when the square's dye color changes.

All three squares initially show white. The order matters: red / blue / white
and white / blue / red are different destinations. Set the same ordered colors
on the controller and receiver, then walk onto the center of the teleporter.
Players, mobs, and other entities can travel. A receiver in another dimension
works too; arrival uses its actual coordinates without Nether coordinate
scaling. Several receivers with the same code provide random destinations.

Breaking any of the teleporter's 17 structural blocks restores all surviving
members to unformed Teleporter Bases. Breaking any of the receiver's nine
blocks similarly restores Receiver Bases and removes that receiver from the
saved directory. The removed block stays removed. Special blocks drop their
original base item, so players never need to craft the internal blocks.
The nine glass roof blocks are restored when a teleporter is dismantled. If a
roof position is occupied, its glass is dropped as an item instead, preserving
the block there. To rebuild a teleporter, replace the missing block, clear any
roof obstructions and replace their glass, then right-click again. Forming a new
structure creates new color data, starting at white / white / white.

## Register construction blocks and internal blocks

`ModBlocks` registers the two construction bases and three internal blocks:
Teleporter, Destination Controller, and Receiver. Only the construction bases
get block items and creative-tab entries. The roof uses `Blocks.GLASS`.
`ModBlockEntities` registers a Teleporter BE type and one shared color-controller
BE type, valid for both Destination Controller and Receiver.

Every structural block extends `MultiblockBlock` and shares these properties:

| Property | Meaning |
| --- | --- |
| `formed` | Whether this position belongs to a formed structure |
| `part` | Platform, beveled corner, lower pillar, or upper pillar |
| `facing` | Rotation of the local model; on the teleporter, the direction of its controller |

The boolean is the important gameplay state. The other properties let a normal
block model draw a different piece at each position. A construction base starts
as a full cube with `formed=false`. Formation retains the original base block
at ordinary member positions and assigns its visual role. The center and
controller positions become different block types because they need block
entities and additional behavior.

## Put all tutorial items in one creative tab

`ModCreativeTabs` registers a `CreativeModeTab` through a deferred register on
the mod event bus. Its builder supplies the translated title **Tutorial Mod**,
a Teleporter Base icon, and a `displayItems` callback listing the five mod block
items. The callback includes the earlier Tutorial Block, Generator, and Pig
Spawner alongside both multiblock construction bases. Internal formed blocks
have no item form and stay out of the tab.

`TutorialMod` registers this helper with the other deferred registers. The old
listener that populated Minecraft's Building Blocks tab is replaced by the
custom tab's contents callback. The title translation comes from
`ModLanguageProvider`. [NeoForge's creative tab
guide](https://docs.neoforged.net/docs/1.21.1/items/#creative-tabs) describes the
builder and registration hooks.

## Compare manual and automatic formation

The manual path begins in `MultiblockBlock.useWithoutItem`. The server calls
`Multiblocks.formTeleporter` only for an unformed Teleporter Base when the
player's main hand is empty. Despite its name, Minecraft can call
`useWithoutItem` while the player holds an item, so the empty-hand check is
explicit. `useItemOn` returns `SKIP_DEFAULT_BLOCK_INTERACTION` for a held item,
allowing its normal use or placement to proceed. An empty stack returns
`PASS_TO_DEFAULT_BLOCK_INTERACTION` to reach the formation callback. Building
against the bases therefore requires no sneaking.

A clicked base may be on the platform or either pillar level. The helper tries
candidate centers within one block horizontally and zero to two blocks below
the clicked position. Each candidate must have exactly the required 17
unformed base blocks, nine vanilla glass blocks, and a clear interior.
Validation completes **before any block changes**. This avoids partially
forming a machine when the final checked position is wrong.

The controller direction is the closest of north, east, south, and west,
measured from the player's position to each adjacent block's center. Candidate
order provides a consistent tie-break. Once a candidate passes validation,
`form` assigns states, consumes the roof, places the controller, and places the
teleporter center.

The automatic path starts in `MultiblockBlock.onPlace`. An unformed Receiver
Base schedules a block tick one tick later. Its `tick` callback calls
`Multiblocks.formReceiver`, which tries nearby centers for a full 3×3 square of
unformed Receiver Bases. It uses the same `form` helper with the receiver flag.
The delay keeps pattern changes out of the block-placement callback and lets
the last placement finish first. No player interaction or failure message is
needed; an incomplete receiver simply waits for another placement.

These are two different **triggers** for the same idea: find a candidate,
validate all members, then change the structure together. There is no need for
a general pattern language to explain a pair of fixed tutorial structures.

## Dismantle without recursive removal

`MultiblockBlock.onRemove` watches formed members. Replacing one formed member
with another formed member is permitted because formation itself replaces the
center and controller. Removing a formed member, or restoring it to an
unformed state, calls `Multiblocks.memberRemoved`.

The helper looks for the relevant center and checks that the removed position
belongs to its pattern. If the removed block was the center itself, its old
state identifies which structure to dismantle. The receiver's `GlobalPos` is
removed from the directory first, and the surviving center is reset before the
other members are restored.

Restoring blocks also calls `onRemove`. A small set of centers currently being
dismantled prevents those callbacks from starting the same operation again;
`try/finally` always clears the guard. The removed position is skipped so
teardown does not recreate the broken block. This works for block destruction,
explosions, and ordinary replacement through the world's block-change API.

After restoring the teleporter's members, teardown restores its nine glass roof
blocks. Only air is replaced; occupied roof positions refund their glass as
items. Receivers have no roof to restore.

The pattern searches and teardown read a small fixed area, including nearby
chunks when necessary. That keeps structures crossing a chunk boundary
consistent. A large multiblock system might instead store explicit ownership
links for each member; here the bounded search keeps the example easier to
follow.

## Set three colors through world interactions

`ColorControllerBlockEntity` stores three fields of type `DyeColor`: `color1`,
`color2`, and `color3`. They all start at `DyeColor.WHITE`. The three getters
expose the fields directly, while `getColor(slot)` selects a field for the
renderer and `setColor(slot, color)` updates the chosen field. The slot indices
are 0, 1, and 2, corresponding to fields 1, 2, and 3.

`ColorControllerBlock.useItemOn` accepts a `DyeItem` or a vanilla wool block
item. Dyes expose their color directly. For wool, `colorFromItem` checks
`ItemTags.WOOL`, reads the block's registry name, and extracts the color from
the vanilla `<color>_wool` naming pattern. `DyeColor.byName` resolves that name;
the `minecraft` namespace check keeps this limited to vanilla wool.

`ColorControllerBlock.hitSlot` converts the world hit point into coordinates
relative to the clicked block and undoes its facing rotation. For each clockwise
quarter turn of the model, it transforms `(x, z)` to `(z, 1 - x)` to return the
click to the default north-facing coordinates. The renderer rotates the wool
cubes by `-90 * turns` degrees around Y to match the baked model. The same three
horizontal centers are used for every orientation: 12, 8, and 4 pixels across
the default model's 16-pixel x axis, so the controls read left to right when
viewed from north. Front controls also check the clicked face and vertical band;
receiver controls check the top face and their depth band. Clicking elsewhere
does not paint a slot.

`ColorControllerBlockEntity.setColor` ignores invalid slot indices and colors
that already match the chosen slot. On the server, a change updates one field,
calls `setChanged`, updates the saved directory if this is a receiver, and sends
a block update to nearby clients. The held item stays unchanged.
The BE saves each color's numeric ID under `color1`, `color2`, and `color3` in
`saveAdditional`. `DyeColor.getId()` supplies a value from 0 to 15, so each
field fits in one NBT byte. `loadAdditional` reads the bytes with `DyeColor.byId`,
defaulting to white for missing or invalid IDs.
`getUpdateTag` supplies colors when a client loads the chunk, while
`getUpdatePacket` supplies later changes.

`ColorControllerRenderer` draws three tiny wool cubes using the existing block
renderer. Their positions match the hit-test coordinates and the dark frames
in the baked models. The receiver cubes sit on top of the platform; controller
cubes face outward. The renderer is registered in the existing client-only
subscriber, keeping rendering classes away from a dedicated server. This is
world BE synchronization, as in the pig preview from tutorial 5; there is no
menu or screen.

## Save a directory shared by all dimensions

`ReceiverSavedData` holds a map from `GlobalPos` to a `ReceiverColors` record.
The record stores three `DyeColor` values as an immutable snapshot, so it stays
independent of the receiver block entity. Record equality compares all three
colors in order. `GlobalPos`
combines a dimension key with a block position. We keep one directory in the
Overworld's data storage so every dimension uses the same object. Minecraft
loads or creates it through `computeIfAbsent`; changes call `setDirty` so they
will be written to disk. This follows the [NeoForge SavedData
API](https://docs.neoforged.net/docs/1.21.1/datastorage/saveddata/).

Each saved entry contains the dimension identifier, packed block position, and
the three color IDs as bytes. The full `GlobalPos` is the map key, so the same
coordinates in different dimensions identify separate receivers. Recoloring
replaces a receiver's color snapshot instead of leaving its old destination
behind. Different positions may store the same three colors. Formation registers three white
colors, and `onLoad` registers the BE's saved colors when its chunk loads again.
Unloading a chunk does **not** remove the entry. Dismantling does.

`randomReceiver` collects matching positions and randomly selects a candidate.
It loads the selected receiver's chunk and checks that the receiver BE and its
three colors still match. A stale location is removed; a mismatched color
snapshot is repaired.
If a candidate is stale, the method tries another matching position. Valid
receivers therefore remain usable even when their chunks were unloaded before
the request, without keeping all receiver chunks permanently loaded.

## Detect arrivals and teleport on the server

`TeleporterBlock` supplies a BE ticker only on the logical server.
`TeleporterBlockEntity.serverTick` finds its controller through the teleporter's
`facing`, reads its three colors, and looks for entities intersecting the small region
just above the center platform. Checking the entity's feet excludes entities
high above the pad. Passengers travel through their root vehicle's dimension
transition rather than independently starting another teleport.

The platform is half a block high, so arrival is the receiver position plus
`(0.5, 0.5, 0.5)`. Before moving an entity, the ticker checks the destination
world border, collision, and liquid. A blocked receiver gives players a message
and leaves the entity at the source. Selection chooses a receiver before this
space check; a later retry may choose another matching receiver.

`Entity.changeDimension` with a `DimensionTransition` handles both local moves
and transfers between dimensions, including the special server-player path.
The transition preserves look direction, resets movement, and adds the vanilla
portal chunk ticket. After success, fall distance is cleared and the receiver
plays `SoundEvents.PORTAL_TRAVEL`, the same sound event used for Nether travel.
A cross-dimension mob may be recreated as a new Java object, so code after the
transition uses the returned entity.

If there is no matching receiver, a player sees a message containing the three
colors; other entities remain silently at the source. Attempts are limited to
once per second per entity while it stays on the pad. The retry map discards
entities that leave, preventing unbounded memory growth and messages every
tick.

## Generate the platform and roof models

`ModMultiblockModelProvider` creates the new blockstates and models. It has a
unique provider name so it can run alongside the earlier model provider.
Construction bases are full cubes with different top textures. Formed bases
select a model from their `part` and rotate it with `facing`.

The full structure follows the supplied sketch: a low platform with beveled
corners, a colored center pad, slim corner pillars, a roof, and three controls
on one side. Four small cuboid steps approximate each diagonal corner of the
octagonal footprint. `MultiblockShapes` uses the same dimensions for selection
and collision, so the platform is half height and the pillars are narrow. The
teleporter uses a separate corner model with a short 4×4-pixel support from platform height to the top of the corner block.
This bridges the gap between the half-height base and the pillar above; its
collision shape includes the same support. Receiver corners use the plain
beveled model. Existing formed teleporter corner states also select the new
support model, so they connect correctly after reloading the client.

Each upper pillar model extends above its block and inward to draw one quarter
of the roof. Four quarters make a complete 3×3 roof after the glass construction
blocks disappear. Each quarter is split into pieces no wider than 16 pixels,
with explicit UV coordinates between 0 and 16. This keeps the iron texture at
its normal scale and prevents the overhanging geometry from sampling neighboring
textures in the atlas. This roof is decorative and has no separate collision or
block position to break. Its supporting pillars remain real, breakable member
blocks. Models use vanilla textures, so this chapter needs no new bitmap art.

Loot generation maps each internal block back to its construction item.
Recipe, translation, and pickaxe-tag providers are extended alongside the new
model provider. Run data generation after changing these providers; generated
JSON files are included in the mod resources.

## Run the checks and record the demonstration

From this project, run:

```bash
./gradlew runData
./gradlew build
./gradlew runGameTestServer -Pexclude_optional_mods
./gradlew runClient
```

On Windows, use `gradlew.bat`. The headless suite includes the five existing
machine tests and fourteen multiblock tests. The new tests cover invalid patterns,
closest controller selection, roof removal and restoration, occupied roof refunds,
pillar support collision, held-item placement without sneaking, empty-hand formation, all 17 teleporter
removal positions, automatic receiver formation, coloring with dyes and wool, rotated
hit coordinates, BE synchronization and serialization, duplicate receiver
selection, directory serialization, recoloring and removal, blocked arrivals,
player messages, server-player teleportation, and mob travel between dimensions.

The cross-dimension mob test observes `EntityJoinLevelEvent` to capture the
recreated entity, then checks its type, UUID, destination position, and removal
of the original. A newly loaded destination chunk may not yet expose entities
through `getEntity`, so an immediate lookup would make the check depend on chunk
timing. The listener is always unregistered in `finally`. Both versions use
this approach.

The larger `multiblocks.snbt` arena lives in `src/gameTest/resources` and stays
out of the published jar.

For an in-game demonstration, build an incomplete teleporter first and show its
failure message. Add the missing roof glass block, stand on your preferred
control side, and form it. Show the changed platform, pillars, roof, and controller.
Build a receiver by placing its ninth block and point out that it forms without
a click. Paint matching codes and teleport a player, a pig, and a dropped item.
Then demonstrate two receivers with the same code, a code with no receivers,
a blocked destination, and dismantling by breaking a pillar or receiver edge.
Save and reload the world to demonstrate retained colors and destination data.

Inspect the iron-textured roof and its UVs, the pillar supports, control
alignment, all four controller orientations, and the portal sound in the client.
The construction glass disappears on formation and returns on teardown.
Server GameTests verify the behavior, while the client makes the appearance and
sound visible and audible.

## Minecraft 26.2 differences

The 26.2 companion project implements the same structures, three-color codes,
formation rules, and teleportation behavior with **Minecraft 26.2, NeoForge
26.2.0.75, and Java 25**. Tutorials 1–5 already cover many of the shared API
changes. This section applies them to the multiblocks and explains the new
receiver-directory and teleportation APIs. These are differences between the
two projects; they did not all first appear in 26.2.

| Area | 1.21.1 tutorial | 26.2 companion |
| --- | --- | --- |
| Block registration | Prebuilt `BlockBehaviour.Properties`; `BlockEntityType.Builder.of(...).build(null)` | Transform the supplied properties; `new BlockEntityType<>(factory, blocks...)` |
| Facing and common names | `DirectionProperty`, `ResourceLocation`, `ResourceKey.location()`, `level.isClientSide` | `EnumProperty<Direction>`, `Identifier`, `ResourceKey.identifier()`, `level.isClientSide()` |
| Item interaction | `ItemInteractionResult`; `PASS_TO_DEFAULT_BLOCK_INTERACTION` / `SKIP_DEFAULT_BLOCK_INTERACTION` | `InteractionResult`; `TRY_WITH_EMPTY_HAND` / `PASS` |
| Dye and messages | `DyeItem.getDyeColor()`; `displayClientMessage` | Stack `DataComponents.DYE`; `sendOverlayMessage` / `sendSystemMessage` |
| Member removal | `onRemove` receives the replacement state | `affectNeighborsAfterRemoval` reads the replacement from the level |
| Color BE persistence | `CompoundTag` and registry access | `ValueOutput` / `ValueInput` |
| Receiver directory | `SavedData.Factory`, manual tag loading/saving | `Codec<ReceiverSavedData>`, `SavedDataType`, `computeIfAbsent(TYPE)` |
| Teleportation | `changeDimension(new DimensionTransition(...))` | `teleport(new TeleportTransition(...))` |
| Color renderer | Immediate BER `render` with a buffer source | `createRenderState`, `extractRenderState`, and `submit` with `BlockModelRenderState` |
| Model generation | Separate NeoForge `BlockStateProvider` for multiblocks | Helper sharing the main `ModelProvider` collectors |
| GameTests | Annotations and `multiblocks.snbt` | Explicit test/function registration and `data/tutorialmod/structure/multiblocks.nbt` |

### Registration, empty-hand formation, and coloring

`ModBlocks.multiblockProperties` now takes a `BlockBehaviour.Properties` argument
and returns that same object after setting map color, strength, sound, and
`noOcclusion`. Pass it to `registerBlock` as
`ModBlocks::multiblockProperties`. This follows Tutorial 2's registration
pattern and lets registration assign the block's registry ID. Both new BE types
use direct `BlockEntityType` construction; the color-controller type still lists
both Destination Controller and Receiver as valid blocks. The custom creative
tab uses the same deferred registration and `displayItems` callback in both
versions.

`MultiblockBlock.useItemOn` now returns `InteractionResult`:

```java
return stack.isEmpty() ? InteractionResult.TRY_WITH_EMPTY_HAND
        : InteractionResult.PASS;
```

`TRY_WITH_EMPTY_HAND` reaches the block's empty-hand interaction, while `PASS`
lets the held item continue its normal use or placement. Keep the explicit
`player.getMainHandItem().isEmpty()` check in `useWithoutItem`. Together these
preserve formation with an empty main hand and ordinary block placement against
bases without sneaking. For a handled formation or color click, return
`InteractionResult.SUCCESS` on the client and `SUCCESS_SERVER` on the server;
the old `sidedSuccess` helper is gone.

`ColorControllerBlock.colorFromItem` reads a dye with
`stack.has(DataComponents.DYE)` and `stack.get(DataComponents.DYE)` instead of
calling `DyeItem.getDyeColor()`. Vanilla wool still uses its tag and
`minecraft:<color>_wool` registry name. When resolving wool for rendering,
`BuiltInRegistries.BLOCK.getValue(identifier)` returns the actual block;
`get(identifier)` now returns an optional holder. Formation success and
missing/blocked-destination messages use `sendOverlayMessage`, replacing
`displayClientMessage(..., true)`. Invalid-pattern messages use
`sendSystemMessage`, replacing `displayClientMessage(..., false)`, and appear in
chat.

Other small substitutions are `level.getRandom()` for the random source and
`Vec3.atCenterOf(pos)` for a block position's center. Horizontal facing now has
type `EnumProperty<Direction>` because `DirectionProperty` was removed.

### Move teardown to the removal callback

The old `Block.onRemove(state, level, pos, nextState, moving)` override is gone.
The 26.2 member block overrides a server-only callback and obtains the
replacement state from the world:

```java
@Override
protected void affectNeighborsAfterRemoval(BlockState state, ServerLevel level,
                                           BlockPos pos, boolean moving) {
    super.affectNeighborsAfterRemoval(state, level, pos, moving);
    BlockState next = level.getBlockState(pos);
    if (state.getValue(FORMED)
            && !(next.getBlock() instanceof MultiblockBlock && next.getValue(FORMED))) {
        Multiblocks.memberRemoved(level, pos, state);
    }
}
```

The formed-to-formed check remains essential: formation replaces bases with
different block types at the center and controller. Treating those replacements
as destruction would dismantle the structure while building it. Keep the
center-first restoration and recursive teardown guard in `Multiblocks`, along
with skipping the removed position and restoring or refunding the roof glass.
Breaking any structural member still dismantles the whole machine.

### Save colors and the shared receiver directory

`ColorControllerBlockEntity.saveAdditional(ValueOutput)` writes the same three
byte fields with `putByte`. `loadAdditional(ValueInput)` reads them with
`getByteOr`, defaulting missing values to white before applying `DyeColor.byId`.
The three field names remain `color1`, `color2`, and `color3`. `getUpdateTag`
still uses `saveWithoutMetadata(registries)`, and `getUpdatePacket` still creates
a `ClientboundBlockEntityDataPacket`, so nearby clients receive all three colors
without a menu.

`ReceiverSavedData` needs a larger change. Replace its `SavedData.Factory` and
manual tag-loading/saving methods with a codec and a namespaced type:

```java
private static final SavedDataType<ReceiverSavedData> TYPE = new SavedDataType<>(
        Identifier.fromNamespaceAndPath("tutorialmod", "receivers"),
        ReceiverSavedData::new, CODEC);
```

Retrieve it with
`level.getServer().overworld().getDataStorage().computeIfAbsent(TYPE)`. Storage
still belongs to the Overworld, so all dimensions share one directory, and
changes still call `setDirty`.

The codec converts the map to a `receivers` list. Each entry stores a dimension
key through `ResourceKey.codec(Registries.DIMENSION)`, a packed position through
`Codec.LONG`, and three dye IDs through `DyeColor.LEGACY_ID_CODEC`. The color
fields use `optionalFieldOf(..., DyeColor.WHITE)`, so white values may be omitted
on disk. Entries remain separate locations: two receivers with the same code
must survive a save/load round trip as two possible destinations.

The namespaced ID changes the file from `data/tutorialmod_receivers.dat` to
`data/tutorialmod/receivers.dat` inside the Overworld's dimension directory.
**This companion port does not migrate 1.21.1 world saves.** The matching color
field names alone do not provide directory migration.

### Teleport with a transition and use the returned entity

Replace `Entity.changeDimension(DimensionTransition)` with
`Entity.teleport(TeleportTransition)`:

```java
Entity moved = entity.teleport(new TeleportTransition(target, arrival, Vec3.ZERO,
        entity.getYRot(), entity.getXRot(), TeleportTransition.PLACE_PORTAL_TICKET));
if (moved != null) {
    moved.resetFallDistance();
    target.playSound(null, destination.pos(), SoundEvents.PORTAL_TRAVEL,
            SoundSource.BLOCKS, 0.25F, 1.0F);
}
```

The transition still supplies the receiver's actual coordinates, zero velocity,
the entity's look direction, and the portal-ticket callback. This API handles
local moves, server players, and cross-dimension entity recreation. Continue
using the returned entity after success, since a mob may have become a new
object. Use `resetFallDistance()` to clear fall distance. Keep the border,
collision, and liquid checks before teleporting, and keep the per-entity retry
throttle and portal-travel sound.

### Extract the three wool models before submitting them

`ColorControllerRenderer` now implements
`BlockEntityRenderer<ColorControllerBlockEntity, ColorControllerRenderer.State>`.
Its `State` extends `BlockEntityRenderState` and holds the facing rotation,
receiver flag, and three `BlockModelRenderState` objects.

`createRenderState` creates this snapshot. During `extractRenderState`, call the
super implementation to populate shared data such as light, read the BE's
facing and colors, and use the `BlockModelResolver` from
`context.blockModelResolver()` to fill each wool model state. The subsequent
`submit` callback reads only that snapshot. It applies the original rotation,
cube positions, and scale, then calls each model state's `submit` with the
`SubmitNodeCollector`, extracted `lightCoords`, and `OverlayTexture.NO_OVERLAY`.

This follows Tutorial 5's renderer-state pattern, with block model states in
place of the pig's entity render state. Keeping the original transforms keeps
the visible cubes aligned with the clickable slots on the controller's front
and the receiver's top in all four orientations.

### Share model collectors and regenerate the resources

The 26.2 `ModMultiblockModelProvider` is a helper called from
`ModBlockStateProvider.registerModels`, rather than a separate data provider.
It receives the main provider's `BlockModelGenerators` and `ItemModelGenerators`.
Sharing these collectors lets `ModelProvider` validate every mod block and item
together, avoiding missing or duplicate definitions across the tutorial models.

Replace `BlockModelBuilder`, `ConfiguredModel`, `ModelFile`, and the
`ExistingFileHelper` workflow with `ExtendedModelTemplateBuilder` cuboids,
`TextureSlot` references, and `TextureMapping` values containing `Material`s.
`PropertyDispatch` selects the formed/part/facing combinations; vanilla rotation
mutators rotate their models. Preserve the roof's explicit UVs, the corner
supports, and the gold first-slot frame when translating the geometry.

The two construction items get `assets/tutorialmod/items/*.json` definitions
through `ItemModelUtils.plainModel`, replacing their old `models/item` parent
files. Extend the existing recipe runner with `shaped(...).save(output)`, add
pickaxe tags using `ResourceKey<Block>` entries, and extend the existing loot and
language providers. Keep the separate `GatherDataEvent.Client` and `.Server`
listeners introduced in the earlier 26.2 chapters.

### Register and run the ported GameTests

All fourteen multiblock tests remain. Replace `@GameTest`/`@GameTestHolder`
discovery with `RegisterGameTestsEvent`, `TestData`, and
`FunctionGameTestInstance`, matching Tutorial 5. Register each test function in
`Registries.TEST_FUNCTION` and reference its key from the test instance; registry
paths use lowercase snake_case. The 13×6×9 arena is now compressed binary NBT at
`src/gameTest/resources/data/tutorialmod/structure/multiblocks.nbt`, using the
26.2 data version. It remains outside the published mod jar.

`GameTestHelper.getBlockEntity` now takes the expected entity class. Tests use
`EntityTypes`, typed/optional NBT accessors, and `TagValueInput` when reloading a
BE. Colored item constants become collections such as
`Items.DYE.pick(DyeColor.RED)` and `Items.WOOL.pick(DyeColor.BLUE)`. The test
player takes level/profile in its constructor, implements `gameMode()`, and
captures messages through `sendSystemMessage` and `sendOverlayMessage`. The directory
round-trip test encodes and decodes the actual `ReceiverSavedData.CODEC`.

From the **26.2 companion project**, run:

```bash
./gradlew runClientData runServerData
./gradlew build
./gradlew runGameTestServer -Pexclude_optional_mods
./gradlew runClient
```

Use `gradlew.bat` on Windows. The separate data tasks replace `runData`. The
porting notes record successful data generation and a build with all **21
required tests** passing: fourteen multiblock tests, six existing machine tests,
and NeoForge's default test. They also record successful client startup with
JEI and The One Probe. In-world appearance and sound still need the manual
demonstration above, especially roof UVs, control alignment, and the arrival
sound.

Continue with the [block entity chapter](03-block-entity-and-state.md) for
persistence and the [energy machine chapter](05-energy-machines.md) for the
previous world-rendering example. The [NeoForge block entity
guide](https://docs.neoforged.net/docs/1.21.1/blockentities/) explains the save,
ticker, and update hooks used here.
