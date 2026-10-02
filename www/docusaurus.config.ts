import type { Options, ThemeConfig } from "@docusaurus/preset-classic";
import type { Config } from "@docusaurus/types";
import { themes } from "prism-react-renderer";

const repositoryUrl = "https://github.com/McJtyMods/mcjty.eu";
const siteDirectoryUrl = `${repositoryUrl}/tree/main/www/`;

const metadata = {
  title: "Mcjty",
  tagline: "Maker of RFTools, McJtyLib, Deep Resonance, and Gear Swapper.",
  description:
    "Mod developer. Maker of RFTools, McJtyLib, Deep Resonance, and Gear Swapper mods. Creator of the On The Edge hardcore/tech modpack. ForgeCraft member",
  tags: "Minecrafter, Mod Developer, Mods, Minecraft Mods, Modder, Developer, Modpacks, Modpack Developer, RFTools, McJty, Mc Jty, RFTools Dimensions, RFTools Control, XNet, Interaction Wheel, Gear Swapper, Immersive Craft, Aqua Munda, McJtyLib, CompatLayer, In Control!, The One Probe, Deep Resonance, xNICEx, CombatHelp, Elemental Dimensions, On The Edge, McJty's Lets Play Pack, Forge, NeoForge, Curseforge",
  url: "https://mcjty.eu",
  image: "https://mcjty.eu/img/logo.png",
  color: "#36B99F",
};

const ICONS = {
  youtube:
    "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z",
  github:
    "M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12",
  // Flame mark used for CurseForge.
  curseforge:
    "M13.5 1.5c.4 3.1-1.1 5-2.7 6.7C9.2 9.9 7.7 11.6 8 14.2c-1.2-.7-2-2-2.2-3.4C4.4 12.4 3.5 14.4 3.5 16.5 3.5 20.6 7.3 23 12 23s8.5-2.4 8.5-6.5c0-2.9-1.5-5.1-3.2-7-.2 1.4-.9 2.5-1.8 3.2.3-3.9-.6-8.1-2-11.2z",
} as const;

const iconLink = (name: keyof typeof ICONS, href: string, label: string) => ({
  type: "html" as const,
  position: "right" as const,
  className: "navbar__item--icon",
  value: `<a class="navbar__link navbar-icon" href="${href}" target="_blank" rel="noopener noreferrer" aria-label="${label}" title="${label}"><svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" focusable="false"><path fill="currentColor" d="${ICONS[name]}"/></svg><span class="navbar-icon__label">${label}</span></a>`,
});

export default {
  title: metadata.title,
  tagline: metadata.tagline,
  url: metadata.url,
  baseUrl: "/",
  organizationName: "McJtyMods",
  projectName: "mcjty.eu",
  trailingSlash: false,
  onBrokenLinks: "warn",
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: "warn",
    },
  },
  favicon: "img/favicon.ico",
  scripts: [
    {
      src: "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9080440722215949",
      async: true,
      crossorigin: "anonymous",
    },
  ],
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },
  plugins: [
    async function TailwindPlugin(_context, _options) {
      return {
        name: "docusaurus-tailwindcss",
        configurePostCss(postcssOptions) {
          // Appends TailwindCSS and AutoPrefixer.
          postcssOptions.plugins.push(require("tailwindcss"));
          postcssOptions.plugins.push(require("autoprefixer"));
          return postcssOptions;
        },
      };
    },
    "@docusaurus/plugin-vercel-analytics",
    [
      "@docusaurus/plugin-content-docs",
      {
        id: "apps",
        path: "apps",
        routeBasePath: "apps",
        sidebarPath: "./sidebars-apps.ts",
        editUrl: siteDirectoryUrl,
      },
    ],
  ],
  headTags: [
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/favicon-16x16.png",
        sizes: "16x16",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/favicon-32x32.png",
        sizes: "32x32",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/favicon-194x194.png",
        sizes: "194x194",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/android-chrome-192x192.png",
        sizes: "192x192",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "icon",
        type: "image/png",
        href: "/img/favicons/android-chrome-384x384.png",
        sizes: "384x384",
      },
    },
    {
      tagName: "link",
      attributes: {
        rel: "apple-touch-icon",
        type: "image/png",
        href: "/img/favicons/apple-touch-icon.png",
        sizes: "180x180",
      },
    },
  ],
  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          editUrl: siteDirectoryUrl,
          sidebarItemsGenerator: async ({
            defaultSidebarItemsGenerator,
            ...args
          }) => {
            const items = await defaultSidebarItemsGenerator(args);
            // Mod docs have their own sidebar, so keep them out of Tutorials.
            if (args.item.dirName === ".") {
              return items.filter(
                (item) =>
                  !(
                    item.type === "category" &&
                    item.link?.type === "doc" &&
                    item.link.id === "mods/mods"
                  ),
              );
            }
            // List mods alphabetically, with the overview page first.
            if (args.item.dirName === "mods") {
              const labelOf = (item: (typeof items)[number]) => {
                if (item.type === "category") return item.label;
                if (item.type === "doc") {
                  const doc = args.docs.find((d) => d.id === item.id);
                  return item.label ?? doc?.title ?? item.id;
                }
                return "";
              };
              const isOverview = (item: (typeof items)[number]) =>
                item.type === "doc" && item.id === "mods/mods";
              return [...items].sort(
                (a, b) =>
                  Number(isOverview(b)) - Number(isOverview(a)) ||
                  labelOf(a).localeCompare(labelOf(b)),
              );
            }
            return items;
          },
        },
        blog: false,
        // blog: {
        //   showReadingTime: true,
        //   editUrl: "https://github.com/tomheaton/mcjty-website/tree/main/",
        // },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      } satisfies Options,
    ],
  ],

  themeConfig: {
    metadata: [
      { name: "theme-color", content: metadata.color },
      { name: "author", content: metadata.title },
      { name: "description", content: metadata.description },
      { name: "keywords", content: metadata.tags },
      { property: "og:title", content: metadata.title },
      { property: "og:type", content: "website" },
      { property: "og:url", content: metadata.url },
      { property: "og:image", content: metadata.image },
      { property: "og:locale", content: "en_US" },
      { property: "og:locale:alternate", content: "en_GB" },
      { property: "og:description", content: metadata.description },
      { property: "og:site_name", content: "McJty.Eu" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@McJty" },
      { name: "twitter:title", content: metadata.title },
      { name: "twitter:description", content: metadata.description },
      { name: "twitter:image", content: metadata.image },
    ],
    docs: {
      sidebar: {
        hideable: true,
      },
    },
    navbar: {
      title: "McJty Wiki",
      logo: {
        alt: "McJty Logo",
        src: "img/logo.png",
      },
      items: [
        {
          type: "doc",
          docId: "intro",
          position: "left",
          label: "Tutorials",
        },
        {
          // type: "doc",
          // docId: "mods/mods",
          type: "docSidebar",
          sidebarId: "mods",
          position: "left",
          label: "Mod Docs",
        },
        {
          to: "/control-validator",
          label: "Control Validator",
          position: "left",
        },
        /*{
            to: "/blog",
            label: "Blog",
            position: "left",
          },*/
        iconLink(
          "youtube",
          "https://www.youtube.com/@jorrittyberghein7398",
          "YouTube",
        ),
        iconLink(
          "curseforge",
          "https://www.curseforge.com/members/mcjty/projects",
          "CurseForge",
        ),
        iconLink("github", "https://github.com/mcjtymods", "GitHub"),
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Tutorials",
          items: [
            {
              label: "1.21.1 and 26.2 NeoForge",
              to: "/docs/1.21.1_26.2",
            },
            {
              label: "1.20.4 NeoForge",
              to: "/docs/1.20.4_neo",
            },
            {
              label: "1.20",
              to: "/docs/1.20",
            },
            {
              label: "1.19.3",
              to: "/docs/1.19.3",
            },
            {
              label: "1.19",
              to: "/docs/1.19",
            },
            {
              label: "1.18",
              to: "/docs/1.18",
            },
            {
              label: "1.17",
              to: "/docs/1.17",
            },
            {
              label: "1.14, 1.15, and 1.16",
              to: "/docs/1.14-1.15-1.16",
            },
            {
              label: "1.15",
              to: "/docs/1.15",
            },
            {
              label: "1.12",
              to: "/docs/1.12",
            },
          ],
        },
        {
          title: "Docs",
          items: [
            {
              label: "Mod Docs",
              to: "/docs/mods",
            },
          ],
        },
        {
          title: "Tools",
          items: [
            {
              label: "Control Validator",
              to: "/control-validator",
            },
          ],
        },
        {
          title: "Community",
          items: [
            {
              label: "YouTube",
              href: "https://www.youtube.com/channel/UCYMg1JQw3syJBgPeW6m68lA",
            },
            {
              label: "Discord",
              href: "https://discord.com/invite/YaWr7Zb",
            },
            {
              label: "Twitter",
              href: "https://twitter.com/McJty",
            },
            {
              label: "Reddit",
              href: "https://www.reddit.com/user/McJty",
            },
            {
              label: "Twitch",
              href: "https://www.twitch.tv/McJty",
            },
            {
              label: "Patreon",
              href: "https://www.patreon.com/McJty",
            },
          ],
        },
        {
          title: "More",
          items: [
            // {
            //   label: "Blog",
            //   to: "/blog",
            // },
            {
              label: "Source Code",
              href: repositoryUrl,
            },
          ],
        },
      ],
      logo: {
        alt: "McJty Logo",
        src: metadata.image,
        href: metadata.url,
        width: 135,
        height: 135,
      },
      copyright: `Copyright &copy; ${new Date().getFullYear()} McJty. Made with &hearts; by <a href="https://tomheaton.dev">tomheaton</a>`,
    },
    prism: {
      theme: themes.github,
      darkTheme: themes.dracula,
      additionalLanguages: ["gradle", "java"],
    },
  } satisfies ThemeConfig,
  future: {
    // experimental_faster: true,
  },
} satisfies Config;
