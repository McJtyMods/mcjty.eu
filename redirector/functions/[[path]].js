const REDIRECT_STATUS = 302;

const MODDING_REDIRECTS = {
  "YouTube-Tutorials-12": "https://mcjty.eu/docs/1.12/",
  "YouTube-Tutorials-15": "https://mcjty.eu/docs/1.15/",
  "YouTube-Tutorials": "https://mcjty.eu/docs/1.14-1.15-1.16/",
  "YouTube-Tutorials-14": "https://mcjty.eu/docs/1.14-1.15-1.16/",
  "YouTube-Tutorials-16": "https://mcjty.eu/docs/1.14-1.15-1.16/",
  "YouTube-Tutorials-17": "https://mcjty.eu/docs/1.17/",
  "YouTube-Tutorials-18": "https://mcjty.eu/docs/1.18/",
  "YouTube-Tutorials-19": "https://mcjty.eu/docs/1.19/",
};

const MODS_REDIRECTS = {
  Ariente: "https://mcjty.eu/docs/mods/ariente/",
  ControlMods: "https://mcjty.eu/docs/mods/control-mods/",
  ControlMods16: "https://mcjty.eu/docs/mods/control-mods/",
  FxControl: "https://mcjty.eu/docs/mods/control-mods/",
  InControl: "https://mcjty.eu/docs/mods/control-mods/",
  Deep_Resonance: "https://mcjty.eu/docs/mods/deep-resonance/",
  EFab: "https://mcjty.eu/docs/mods/efab/",
  Elemental_Dimensions: "https://mcjty.eu/docs/mods/elemental-dimensions/",
  Enigma: "https://mcjty.eu/docs/mods/enigma/",
  Interaction_Wheel: "https://mcjty.eu/docs/mods/interaction-wheel/",
  Lost_Cities: "https://mcjty.eu/docs/mods/lost-cities/",
  Quest_Utilities: "https://mcjty.eu/docs/mods/quest-utilities/",
  RFTools: "https://mcjty.eu/docs/mods/rftools/",
  RFTools_Control: "https://mcjty.eu/docs/mods/rftools-control/",
  RFTools_Dimensions: "https://mcjty.eu/docs/mods/rftools-dimensions/",
  Struggle_Mod_List: "https://mcjty.eu/docs/mods/struggle-mod-list/",
  The_One_Probe: "https://mcjty.eu/docs/mods/the-one-probe/",
  XNet: "https://mcjty.eu/docs/mods/xnet/",
};

function redirect(to) {
  return Response.redirect(to, REDIRECT_STATUS);
}

export async function onRequest(context) {
  const url = new URL(context.request.url);
  const path = url.pathname.replace(/\/+$/, "");
  const title = url.searchParams.get("title") || "";

  if (path === "/modding/index.php") {
    return redirect(MODDING_REDIRECTS[title] || "https://mcjty.eu/docs/intro/");
  }

  if (path === "/mods/index.php") {
    return redirect(MODS_REDIRECTS[title] || "https://mcjty.eu/docs/mods/");
  }

  console.warn(`Unknown path: ${path}`);

  return redirect("https://mcjty.eu/");
}
