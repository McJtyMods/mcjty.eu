# McJty Website - Redirector

This is the redirector for the McJty website, which is used to redirect requests from the old wiki links to the new website.

This website is built using Cloudflare Pages, which is a static site hosting service. The redirector is implemented using Cloudflare Workers, which are serverless functions that run on Cloudflare's edge network.

## Installation

To install dependencies:

```shell
pnpm install
```

## Local Development

To start a local development server:

```shell
pnpm wrangler pages dev public
```

This command starts a local development server and opens up a browser window.
Most changes are reflected live without having to restart the server.

## Deployment

To deploy the redirector to Cloudflare Pages:

```shell
pnpm wrangler pages publish public
```

## Notes

The old wiki links looks like `https://wiki.mcjty.eu/modding/index.php?title=Main_Page`.
