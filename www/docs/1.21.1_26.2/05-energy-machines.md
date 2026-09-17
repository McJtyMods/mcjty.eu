# Tutorial 5: Energy machines, menus, screens, and a pig preview

This chapter builds on the block entity and data generation work from the
earlier tutorials. The main project targets **Minecraft 1.21.1 and NeoForge
21.1.249**. We will make a fueled generator and a pig spawner. The generator
pushes FE (Forge Energy) to neighboring machines; the spawner needs **4,000 FE
and one pig-food item** for each pig. We also add a shared inventory screen and
a translucent preview pig while the spawner is preparing to spawn.

Try the result first: place a generator against a spawner, put furnace fuel in
the generator, and put a carrot, potato, or beetroot in the spawner. Watch the
generator's front animate, the energy bar fill, the preview appear, and finally
a real pig stand on the half-height platform. Keeping several food items in the
slot makes repeated cycles easier to observe. Move real pigs away because
another entity occupying the spawn area prevents the next spawn.

## Start with the energy model

Energy is an amount in a machine's buffer, measured here in FE. A **capacity**
is how much the buffer holds; a **transfer rate** is how much one operation can
move. The generator produces 20 FE per server tick (normally 20 ticks per
second) and holds up to 10,000 FE. The spawner holds 4,000 FE and accepts up to
20 FE **per call to `receiveEnergy`**. It cannot export energy. One successful
spawn consumes its entire 4,000 FE buffer and one food item.

```text
4,000 FE / 20 FE per tick = 200 ticks = 10 seconds at 20 TPS
```

That ten-second example assumes one continuously fueled generator, one spawner,
an empty starting buffer, and uninterrupted transfer. It is game time, so a
lagging server takes longer in real time. A stored charge can shorten the first
wait. Several generators can push into different faces of one spawner, so it can
charge faster. The same face can also accept separate pushes in one tick: the 20
FE limit is **per call**, not a shared tick quota.

For example, two fueled generators pushing 20 FE each can deliver 40 FE per
tick to one spawner. With no interruptions, 4,000 / 40 = 100 ticks, about five
seconds. That extra throughput comes from two producers, not from the spawner
pulling power.

Energy uses a **push system**. An energy capability says what a machine
*can* receive or extract; it does not move power by itself. A producer (like our
generator), or a battery in a larger mod, finds adjacent consumers and offers
power. Consumers do not poll their neighbors to pull it. In
`GeneratorBlockEntity.serverTick`, the generator visits all six directions, asks
for `Capabilities.EnergyStorage.BLOCK` on the neighbor's face pointing back
toward it, and calls `receiveEnergy`. It then removes exactly the amount the
neighbor accepted. It skips unloaded positions and rotates the first direction
so the same neighbor is not always visited first.

```java
var target = level.getCapability(
        Capabilities.EnergyStorage.BLOCK,
        worldPosition.relative(side),
        side.getOpposite()
);
if (target != null && target.canReceive()) {
    int offered = energy.extractEnergy(GENERATION_RATE, true);
    int accepted = target.receiveEnergy(offered, false);
    energy.extractEnergy(accepted, false);
}
```

The simulated extraction checks what the generator can offer without changing
its buffer. The real extraction follows the receiver's answer. Each adjacent
neighbor may receive one push of up to 20 FE during a generator tick. If the
generator has stored energy, several neighbors can each receive 20 FE in the
same tick; its **production rate** remains 20 FE per tick. A nearly empty buffer
can therefore supply fewer neighbors. Nothing in this example implements wires,
distance transfer, or a battery, but the same push principle works for those
later.

`ModBlockEntities.registerCapabilities` exposes the generator's energy handler
and the spawner's input handler on every face. The spawner exposes a single
`IEnergyStorage` receiver that forwards each call to its buffer with the 20 FE
cap. Its `extractEnergy` returns zero. This prevents other machines from taking
power back out, while compatible external generators can push into it. We also
expose each machine's item-handler capability so hoppers or other automation can
supply valid fuel and food. [NeoForge's capability
guide](https://docs.neoforged.net/docs/1.21.1/inventories/capabilities/) gives
the wider API context.

## Separate machine rules from shared plumbing

`ModBlocks`, `ModItems`, and `ModBlockEntities` register the two blocks, their
block items, and their block entity types. `ModMenus` registers one menu type
used by both machines. The main mod class registers these deferred registers and
the capability listener. The common `MachineBlock` opens the menu on empty-hand
interaction, runs the block entity ticker **only on the logical server**, and
drops the inventory when the machine is removed. Switching the generator's `on`
blockstate is not removal, so it does not drop its contents.

`MachineBlockEntity` owns the one-slot inventory, energy amount, save/load
hooks, menu provider, and the three values the menu displays. Its inline
`IEnergyStorage` keeps stored energy between zero and capacity, limits each
receive/extract call, supports simulation, and calls `setChanged()` after a real
change. `setChanged()` matters: it tells the world that this block entity's new
energy or inventory must be saved. A generator tick and an energy transfer
through a capability both need that notification.

The concrete block entities supply the rules:

- `GeneratorBlockEntity` accepts items with a smelting burn time. It consumes
  one fuel item to start a burn, handles a crafting remainder such as an empty
  bucket, increments stored energy while decrementing burn time, and pushes to
  neighbors. It pauses burning if another full 20 FE tick would overflow its
  buffer.
- `PigSpawnerBlockEntity` accepts the vanilla `ItemTags.PIG_FOOD` tag. Once it
  has a full buffer and food, it creates a pig on the platform at block Y + 0.5.
  It checks collision, liquids, and other entities before adding the pig. Only a
  successful addition consumes food and energy; otherwise it tries again later.

World saves include energy, the input inventory, and the generator's remaining
burn time. Breaking a machine drops its inventory separately and copies its
energy onto the dropped block item. Remaining burn time is not copied to the
item, so a partly burned fuel item cannot be resumed after breaking and
replacing the generator.

## Follow one menu from the server to the client

A menu is the **interaction and synchronization layer** for an open inventory. A
screen is its client-only drawing layer. The block entity remains the
authoritative data holder. Understanding their separate jobs prevents a common
mistake: reading the client block entity directly to draw changing server
values.

`MachineBlockEntity` implements `MenuProvider`: `getDisplayName` supplies the
title, and `createMenu` constructs the **server** `MachineMenu` around the real
machine. In `MachineBlock.useWithoutItem`, the server calls
`player.openMenu(machine, pos)`. The opening message identifies the registered
menu type and includes the block position. `ModMenus` creates that menu type
with `IMenuTypeExtension.create(MachineMenu::new)` because the client
constructor needs the extra position. The client reads it from
`RegistryFriendlyByteBuf` and finds its local block entity. That local block
entity identifies the machine and supplies a matching slot holder; the server's
block entity is still the source of truth.

The two public constructors make the difference visible:

```java
// Opening on the client: locate its local machine, but mirror the server data.
public MachineMenu(int id, Inventory inventory, RegistryFriendlyByteBuf buffer) {
    this(id, inventory,
            (MachineBlockEntity) inventory.player.level()
                    .getBlockEntity(buffer.readBlockPos()),
            new SimpleContainerData(3));
}

// Opening on the server: read values from the real machine.
public MachineMenu(int id, Inventory inventory, MachineBlockEntity machine) {
    this(id, inventory, machine, machine.data);
}
```

```text
Player opens machine
  -> server MachineMenu uses the real block entity and machine.data
  -> opening message includes the menu type, title, and block position
  -> client MachineMenu reads the position and creates SimpleContainerData(3)
  -> vanilla menu updates mirror slots and data values while it stays open
  -> MachineScreen draws the client's mirrored menu values
```

There are **two `MachineMenu` instances**, one on each side. The server
constructor receives `machine.data`, a `ContainerData` view of three live
integers. The client constructor supplies `new SimpleContainerData(3)`, an
initially empty three-integer mirror. Both constructors then call
`addDataSlots(data)`. Minecraft's menu synchronization copies changes from the
server view into the client mirror while the player has that menu open. The
screen calls `menu.getEnergy()`, `getCapacity()`, and `getBurnTicks()`: it does
not need a custom packet or a client-side energy simulation.

| Data index | Server source | Screen use |
| --- | --- | --- |
| 0 | Current FE | Bar width and numeric label |
| 1 | Machine capacity | Bar denominator and numeric label |
| 2 | Generator burn ticks, or zero for the spawner | Available to display fuel progress later |

This data-sync path is **server to the viewer's open client menu**. It is
separate from world block-entity updates and does not make the whole block
entity's inventory or energy automatically available to every nearby client.
Menu data slots transmit only 16 bits of each integer; this example's 4,000 and
10,000 FE capacities fit. If you add larger values or unusually long modded fuel
burn times, split them into multiple slots or use another synchronization
method. The [NeoForge menu
guide](https://docs.neoforged.net/docs/1.21.1/gui/menus/) explains menu
providers and extra opening data.

The server also synchronizes the machine slot and the player's slots through the
normal menu protocol. `MachineMenu` adds machine slot **0** with
`SlotItemHandler`, player inventory slots **1–27**, and hotbar slots **28–36**.
The menu decides whether a shift-click should target the machine or move between
the player's inventory and hotbar. Its `quickMoveStack` calls
`machine.accepts(stack)` before inserting into the machine; an invalid item
stays in the player's inventory. `stillValid` closes access when the block is
gone or the player is too far away. Keep all slot coordinates identical on both
menu instances, or clicks and drawn items will disagree.

## Draw the shared screen

`TutorialModClient` registers `MachineScreen` for the shared menu in a
client-only `RegisterMenuScreensEvent` listener. Dedicated servers must not load screen
or rendering classes. `MachineScreen` extends
`AbstractContainerScreen<MachineMenu>`, so Minecraft already draws and handles
the menu's item slots and their normal interactions. We only draw a background,
an energy bar, labels, and tooltips.

The screen's background is a **256×256 PNG** at
`assets/tutorialmod/textures/gui/machine.png`. Only its upper-left **176×166**
region is the visible panel. `renderBg` blits that region using the full 256×256
texture size, then fills a changing 80-pixel bar from the menu's synchronized FE
values:

```java
int width = menu.getCapacity() == 0
        ? 0
        : 80 * menu.getEnergy() / menu.getCapacity();
graphics.fill(x + 80, y + 35, x + 80 + width, y + 47, ENERGY_BAR_COLOR);
```

The zero-capacity guard prevents division by zero while a client menu is first
opening. The screen's `renderLabels` method uses translated `Fuel` or `Food`
text according to the machine type, plus a translated current/max FE label. Its
`render` method calls the superclass and then draws hover tooltips. `leftPos`
and `topPos` are where the panel starts on the screen; slot coordinates such as
`(44, 35)` are **relative to that panel**, not absolute window coordinates.

### Generate the GUI PNG instead of painting every slot by hand

`ModGuiTextureProvider` is a client data provider registered in
`ModDataGenerators.gatherData`. Its `run` method creates a 256×256 ARGB image,
draws the panel border and recessed boxes, encodes it as PNG, and writes it into
`src/generated/resources/assets/tutorialmod/textures/gui/machine.png` through
`CachedOutput.writeIfNeeded`. The generated resources folder is included in the
main resource set by `build.gradle`, so the built mod contains the PNG. Re-run
data generation after changing the provider; editing the generated PNG directly
would be overwritten.

The provider is included only when client data is requested:

```java
generator.addProvider(event.includeClient(),
        new ModGuiTextureProvider(output));
```

The provider draws an 18×18 border around each 16×16 slot interior. For the
machine slot at `(44, 35)` in the menu, its border begins at `(43, 34)` in the
PNG. The three player inventory rows and hotbar use the same one-pixel offset.
The bar recess begins at `(79, 34)` and the dynamic fill starts at `(80, 35)`.
This is why menu, screen, and texture-provider coordinates must be kept in step.
Other machine block textures are authored image assets; this particular GUI PNG
is created by Java data generation.

## Model, shape, and actual pig spawn

The generator has horizontal `facing` and boolean `on` properties. The server
ticker changes `on` only when generation starts or stops.
`ModBlockStateProvider` creates off/on orientable cube models and horizontal
variants for all facing directions. Its item model uses the off model. The
authored `generator_on.png` has four 16×16 animation frames stacked vertically;
the adjacent `.mcmeta` file tells Minecraft their timing.

The spawner block model has a half-height base and four posts, all using
`spawner.png`. The data provider creates five cuboid elements and gives the
model `minecraft:block/block` as parent so the item inherits the normal angled,
3D block display. The JSON model describes appearance.
`PigSpawnerBlock.getShape` describes the outline that players point at; it
includes the base and posts. `getCollisionShape` returns **only** the base,
matching a bottom slab. That lets a pig stand at block Y + 0.5 without colliding
with the decorative posts. `noOcclusion` keeps the open model from hiding
neighboring faces as if it were a solid cube. Changing a JSON model alone never
changes entity collision.

Before adding a pig, `PigSpawnerBlockEntity.serverTick` creates a real server
entity centered over the platform. Its `noCollision`, liquid, and nearby-entity
checks must succeed. If a solid block fills the space above the spawner, or
another pig remains in the spawn volume, the machine keeps its energy and food.
This protects both resources from failed attempts.

## Render a preview without spawning another entity

A baked block model cannot show a pig that appears and disappears according to
the block entity's resources. `PigSpawnerRenderer` is a **BlockEntityRenderer**
registered in the client-only `EntityRenderersEvent.RegisterRenderers` listener.
Its `render` method runs during world rendering, asks the spawner whether the
preview should show, and draws a client-only preview pig over the platform. It
translates, slowly rotates, bobs, and scales the model with a `PoseStack`. The
preview uses Minecraft's existing **pig entity renderer**, model, and texture;
it is never added to the world and does not collide, move, consume food, or
count as a spawned pig. The renderer expands its bounding box upward so the
hovering model is not culled as though it fit only inside one block. [NeoForge's
BER guide](https://docs.neoforged.net/docs/1.21.1/blockentities/ber/) explains
registration and render parameters.

`PigSpawnerBlockEntity` keeps one preview pig object for its client instance. It
marks that object invisible but overrides its visibility to the local player.
The vanilla pig renderer then uses its translucent path, producing the ghostly
effect without a second pig texture or model. This is a **visual object**, not
the real entity created by `serverTick`.

The renderer needs one small piece of server state: **has at least one FE and
valid food**. The server computes that condition whenever energy or inventory
changes. If its truth value changes, it sends a block update. `getUpdatePacket`
and `getUpdateTag` send only `preview_ready`; client `onDataPacket` and
`handleUpdateTag` update the local flag. The client renderer reads that flag.
The preview appears while the buffer is charging, stays while a full machine
cannot spawn because space is blocked, and disappears when spawning consumes the
resources.

The readiness check is intentionally smaller than the actual spawn check:

```java
private boolean hasPreviewResources() {
    return energy.getEnergyStored() > 0
            && accepts(inventory.getStackInSlot(0));
}
```

This needs only some charge and valid food. The real spawn still requires the
full buffer and free space. The server sends a block update only when this
boolean changes; the open-menu bar continues to update its exact FE count.

This is a **different synchronization path from the menu**. A nearby player can
see the preview without opening a screen, so the state must be sent as a world
block-entity update. The menu's FE data slots, by comparison, are sent only to
players viewing that menu. Sending a boolean only when it changes also avoids
transmitting the full inventory and energy amount every time 20 FE arrives.

## Preserve energy when breaking and replacing a machine

The shared block entity writes energy and inventory into world-save data and
exports its current FE as `ModDataComponents.ENERGY`. The generated machine loot
tables copy that component from the block entity onto the dropped block item. On
placement, `applyImplicitComponents` restores the FE amount;
`removeComponentsFromTag` discards the duplicate saved energy field during the
item-component conversion. Restored amounts are clamped to machine capacity.
Recipes, loot tables, pickaxe tags, translations, blockstates, models, and the
generated GUI texture all come from providers, while the block PNG source art
and animation metadata remain in `src/main/resources`.

## Generate, test, and try it in game

Run directly from your IDE or else from the **1.21.1** project:

```bash
./gradlew runData
./gradlew build
./gradlew runGameTestServer -Pexclude_optional_mods
./gradlew runClient
```

On Windows, use `gradlew.bat`. `runData` refreshes `src/generated/resources`;
`build` packages it; the GameTest server runs the five machine tests without the
optional JEI and TOP runtime mods; `runClient` lets you inspect the animation,
screen, model, and pig preview. The `exclude_optional_mods` switch is optional
for normal testing but checks that these machines work without integrations from
Tutorial 4.

The tests live in `src/gameTest`, outside the published jar. `empty.snbt` is an
empty 7×5×7 structure that gives them a clear arena; `prepareGameTestArena`
copies it into the GameTest run directory. The tests cover ten-second charging,
food/power/space requirements and preview conditions, repeated same-tick input
pushes, all six generator output directions, and energy surviving saves and
item-component placement. A headless GameTest cannot judge whether the
translucent pig looks right, so also inspect the client: open both screens,
shift-click valid and invalid inputs, charge a fed spawner, block and unblock
its spawn space, and watch the preview disappear when the real pig appears.

## Minecraft 26.2 differences

The 26.2 companion project implements the same **push design, menu roles,
shared GUI, and preview behavior** for Minecraft 26.2. It is a port, not a
second energy design. Tutorials 1–4 already introduce Java 25, registry property
suppliers, `Identifier`, and the client/server data-run split. Here are all
changes that matter specifically to these machines.

The main Minecraft change boundaries help when porting an intermediate version:
the `ModelProvider` approach begins in **1.21.4**, the block-entity `ValueInput`
and `ValueOutput` hooks replace raw tags in **1.21.6**, render-state submission
replaces immediate renderer calls in **1.21.9**, and `ResourceLocation` becomes
`Identifier` in **26.1**. The capability and transfer names below are the
NeoForge APIs used by the **26.2** companion project; check the exact NeoForge
version when targeting a release between these projects.

| Area | 1.21.1 tutorial | 26.2 companion |
| --- | --- | --- |
| Energy capability | `Capabilities.EnergyStorage.BLOCK`, `IEnergyStorage` | `Capabilities.Energy.BLOCK`, `EnergyHandler` |
| Energy buffer and transfer | Inline `IEnergyStorage`; `receiveEnergy`/`extractEnergy` with `simulate` | `SimpleEnergyHandler`; `insert`/`extract` inside root `Transaction`s; commit real transfers |
| Item automation | `Capabilities.ItemHandler.BLOCK`, `ItemStackHandler` | `Capabilities.Item.BLOCK`, `ResourceHandler`/`ItemStacksResourceHandler` |
| Machine menu slot | `SlotItemHandler` | `ResourceHandlerSlot` |
| World persistence | `CompoundTag` plus `HolderLookup.Provider` | `ValueInput`/`ValueOutput`, including a child value for the inventory |
| Empty-hand use and removal | `InteractionResult.sidedSuccess`; `onRemove` drops inventory | `SUCCESS`/`SUCCESS_SERVER` with `withoutItem()`; `BlockEntity.preRemoveSideEffects` drops inventory |
| Fuel and pig creation | Stack smelting burn time; `EntityType.PIG.create(server)` and `moveTo` | Burn time uses `level.fuelValues()`; `EntityTypes.PIG.create(server, EntitySpawnReason.SPAWNER)`, `setPos`, `setYRot` |
| Screen drawing | `GuiGraphics`, `renderBg`, `renderLabels`, ordinary `blit` | `GuiGraphicsExtractor`, `extractBackground`, `extractLabels`, `RenderPipelines.GUI_TEXTURED` |
| Pig preview renderer | BER `render` calls the pig entity renderer directly | BER `extractRenderState` builds an `EntityRenderState`; `submit` sends it to `SubmitNodeCollector` |
| Model and item data | NeoForge `BlockStateProvider`; `assets/<modid>/models/item/*.json` | Minecraft `ModelProvider`; `assets/<modid>/items/*.json` definitions |
| GameTests | `@GameTest`, `empty.snbt`, `GameTestHelper.getBlockEntity(pos)` | `RegisterGameTestsEvent`, `TestData`/`FunctionGameTestInstance`, `data/<modid>/structure/empty.nbt`, class-qualified block-entity lookup |

### The new transfer API still follows the same push rule

The 26.2 generator obtains `Capabilities.Energy.BLOCK` on a neighbor's opposite
face and calls `EnergyHandler.insert`. Each real insert is inside
`Transaction.openRoot()` and is **committed**; an uncommitted transaction rolls
back and serves as simulation. `MachineBlockEntity.MachineEnergy` extends
`SimpleEnergyHandler`, marks the block entity changed when FE moves, and
provides small helper methods that keep the generator code readable.
`PigSpawnerBlockEntity.input` directly exposes its buffer: its 20 FE insertion
cap and zero extraction limit are configured on that handler.
`Capabilities.Item.BLOCK` exposes an `ItemStacksResourceHandler`; the menu's
machine slot becomes `ResourceHandlerSlot`. These are NeoForge transfer-API
changes, not a switch from push to pull. [NeoForge's transaction
guide](https://docs.neoforged.net/docs/inventories/transactions/) describes the
commit/rollback idea.

```java
int accepted;
try (var transaction = Transaction.openRoot()) {
    accepted = target.insert(offered, transaction);
    transaction.commit(); // Omit this for a simulated, rolled-back transfer.
}
energy.extractEnergy(accepted, false);
```

### Save data, interaction, fuel, and spawning

In 26.2, `saveAdditional(ValueOutput)` and `loadAdditional(ValueInput)` replace
the block entity's tag-based hooks. Energy and `burn_ticks` use
`putInt`/`getIntOr`; inventory serializes into `output.child("inventory")` and
loads from `input.childOrEmpty("inventory")`. `applyImplicitComponents` takes
`DataComponentGetter`, and `removeComponentsFromTag` uses
`ValueOutput.discard("energy")`. The loot component copy uses
`CopyComponentsFunction.copyComponentsFromBlockEntity(LootContextParams.BLOCK_ENTITY)` instead of
the older `Source.BLOCK_ENTITY` builder. The practical result is unchanged:
world saves preserve machine state and dropped machine items preserve FE.

Minecraft removed this tutorial's old block `onRemove` hook. The 26.2 block
entity drops the inventory from `preRemoveSideEffects` only when the machine is
actually replaced. Empty-hand interaction returns `SUCCESS` on the client or
`SUCCESS_SERVER` on the server, both marked `withoutItem()`. The generator asks
for burn time with the level's `FuelValues`; crafting remainder comes from
`Item.getCraftingRemainder()` and may be null. The pig class moved to
`animal.pig.Pig`, the type is `EntityTypes.PIG`, creation supplies
`EntitySpawnReason.SPAWNER`, and `setPos`/`setYRot` replace `moveTo`. The spawn
point is still on the bottom-slab-height platform.

Both new machine block entity types also use the direct
`new BlockEntityType<>(factory, validBlock)` registration introduced in Tutorial
3. Machine block and block-item registrations use the 26.2 property-supplier
helpers from Tutorial 2; the machine-specific server rules remain in their
concrete block entities.

### Menus, screens, the GUI PNG, and renderer

`ModMenus` still registers an extended menu type. Opening still sends the block
position; the server still supplies real `ContainerData` and the client still
starts with `SimpleContainerData(3)`. Vanilla menu slot/data synchronization
still drives the client screen. The difference is the item slot's transfer API,
`ResourceHandlerSlot`, and the screen's **extraction** API: `extractBackground`
blits through `GuiGraphicsExtractor` with `RenderPipelines.GUI_TEXTURED`, while
`extractLabels` records text. The 80-pixel energy bar still reads synchronized
menu values. The PNG generator is essentially unchanged and still writes
`textures/gui/machine.png` during client data generation; the model identifier
type is now `Identifier`.

The 26.2 BER has a render-state stage. `createRenderState` makes a
`BlockEntityRenderState`; `extractRenderState` reads the spawner, extracts the
preview pig's `EntityRenderState`, and records animation time; `submit`
positions and submits that state through `SubmitNodeCollector`. The
invisible-but-visible pig still uses the vanilla translucent pig path. Because the preview
entity is **never added to the world**, it would keep client entity ID 0; 26.2's
render-state extraction rejects that unassigned ID. The port assigns each
preview a unique negative ID before extraction. The ready flag is still sent
through `getUpdateTag` and the block update packet, but the receiving
`onDataPacket`/`handleUpdateTag` callbacks read a `ValueInput` rather than a
`CompoundTag`. This preview sync remains separate from the open-menu FE sync.
NeoForge's [rendering migration
notes](https://docs.neoforged.net/primer/docs/1.21.9/) explain the
renderer-state transition.

### Model generation and GameTests

The 26.2 `ModelProvider` creates the generator's orientable off/on models,
rotated facing variants, and item definitions. The custom half-slab-and-post
spawner model is an authored JSON resource in `src/main/resources`; the provider
references it to generate the blockstate and item definition. Items now use
`assets/tutorialmod/items/<name>.json` definitions rather than the older
`models/item` files. The 26.2 tag provider adds `ResourceKey<Block>` values,
while recipe generation uses a `RecipeProvider.Runner`/context and the changed
loot builder described above. The generated GUI PNG remains a client resource.

GameTests are registered with `RegisterGameTestsEvent` and `TestData` instead of
annotations. Each `FunctionGameTestInstance` references a function registered in
`TEST_FUNCTION`; that registry reference lets the built-in codec serialize test
instances during client pack negotiation. The companion project includes a codec
regression test for this. `GameTestHelper.getBlockEntity` now takes the expected
class, and the empty arena is a binary `data/tutorialmod/structure/empty.nbt`
resource instead of `empty.snbt`. The Gradle `gameTest` source set and
`runGameTestServer` still compile/run tests without packing them into the
published jar.

The 26.2 Gradle setup has **separate** client and server data runs. Both specify
`--uncached` because they write into the same generated-resources tree;
otherwise one run's cache can treat the other's output as stale. From the
companion project, run:

```bash
./gradlew runClientData runServerData
./gradlew build
./gradlew runGameTestServer
./gradlew runClient
```

The menu and preview are best checked in game as well as by GameTests: data-slot
sync, item shift-clicking, GUI alignment, the translucent pig, collision at half
height, and a real spawn are the same behaviors to look for in both versions.

## Further reading

- [NeoForge 1.21.1 capabilities](https://docs.neoforged.net/docs/1.21.1/inventories/capabilities/)
- [NeoForge 1.21.1 menus](https://docs.neoforged.net/docs/1.21.1/gui/menus/)
- [NeoForge 1.21.1 block entity renderers](https://docs.neoforged.net/docs/1.21.1/blockentities/ber/)
- [NeoForge transfer transactions](https://docs.neoforged.net/docs/inventories/transactions/)
- [NeoForge renderer migration in 1.21.9](https://docs.neoforged.net/primer/docs/1.21.9/)
- [Tutorial 2: data generation](02-first-block-and-datagen.md)
- [Tutorial 3: block entity state](03-block-entity-and-state.md)
