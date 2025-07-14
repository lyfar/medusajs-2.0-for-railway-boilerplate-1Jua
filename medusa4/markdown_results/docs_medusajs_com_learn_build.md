[![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Flogo.png&w=48&q=75)](https://docs.medusajs.com/)

- [Get Started](https://docs.medusajs.com/learn)
- Product







[Commerce Modules](https://docs.medusajs.com/resources/commerce-modules)



[Architectural Modules](https://docs.medusajs.com/resources/architectural-modules)

- Build







[Recipes](https://docs.medusajs.com/resources/recipes)



[How-to & Tutorials](https://docs.medusajs.com/resources/how-to-tutorials)



[Integrations](https://docs.medusajs.com/resources/integrations)



[Storefront](https://docs.medusajs.com/resources/storefront-development)

- [Tools](https://docs.medusajs.com/resources/tools)





CLI Tools



[JS SDK](https://docs.medusajs.com/resources/js-sdk)



[Next.js Starter](https://docs.medusajs.com/resources/nextjs-starter)



[Medusa UI](https://docs.medusajs.com/ui)

- [Reference](https://docs.medusajs.com/resources/references-overview)





[Admin API](https://docs.medusajs.com/api/admin)



[Store API](https://docs.medusajs.com/api/store)



[Admin Injection Zones](https://docs.medusajs.com/resources/admin-widget-injection-zones)



[Container Resources](https://docs.medusajs.com/resources/medusa-container-resources)



[Core Workflows](https://docs.medusajs.com/resources/medusa-workflows-reference)



[Data Model Language](https://docs.medusajs.com/resources/references/data-model)



[Events Reference](https://docs.medusajs.com/resources/events-reference)



[Helper Steps](https://docs.medusajs.com/resources/references/helper-steps)



[Service Factory](https://docs.medusajs.com/resources/service-factory-reference)



[Testing Framework](https://docs.medusajs.com/resources/test-tools-reference)



[Workflows SDK](https://docs.medusajs.com/resources/references/workflows)

- [User Guide](https://docs.medusajs.com/user-guide)

[v2.6.1](https://github.com/medusajs/medusa/releases/tag/v2.6.1)·

Help

[Troubleshooting](https://docs.medusajs.com/resources/troubleshooting)

[Report Issue](https://github.com/medusajs/medusa/issues/new/choose)

[Discord Community](https://discord.gg/medusajs)

[Contact Sales](https://medusajs.com/contact/)

·

![AI Assistant](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fai-assistent.png&w=32&q=75)Ask AI

[Homepage](https://medusajs.com/)

[Medusa v1](https://docs.medusajs.com/v1)

[Changelog](https://medusajs.com/changelog)

Hide Sidebar⌘\

Theme

Light

Dark

Menu

- [Get Started](https://docs.medusajs.com/learn)
- Product
- Build
- Tools
- Reference
- [User Guide](https://docs.medusajs.com/user-guide)

[Documentation](https://docs.medusajs.com/)[Get Started](https://docs.medusajs.com/learn)

# 8.1. Build Medusa Application

In this chapter, you'll learn how to create a production build of your Medusa application to be deployed to a hosting provider.

Next chapters explain how to deploy the Medusa application.

## build Command[\#](https://docs.medusajs.com/learn/build\#build-command)

The Medusa CLI tool has a [build](https://docs.medusajs.com/resources/medusa-cli/commands/build) command which creates a standalone build of the Medusa application that:

- Doesn't rely on the source TypeScript files.
- Can be copied to a production server reliably.

So, to create the production build, run the following command in the root of your Medusa application:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯npx medusa build
```

* * *

## Build Output[\#](https://docs.medusajs.com/learn/build\#build-output)

The `build` command outputs the production build in the `.medusa/server` directory, and the admin dashboard build in the `.medusa/server/public/admin`.

### Separate Admin Build[\#](https://docs.medusajs.com/learn/build\#separate-admin-build)

The `build` command accepts a `--admin-only` option that outputs the admin to the `.medusa/admin` directory. This is useful when deploying the admin dashboard separately, such as on Vercel:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯npx medusa build --admin-only
```

* * *

## Start Built Medusa Application[\#](https://docs.medusajs.com/learn/build\#start-built-medusa-application)

To start the Medusa application after running the `build` command:

- Change to the `.medusa/server` directory and install the dependencies:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

npmyarnpnpm

❯cd .medusa/server && npm install
```

- When running the application locally, make sure to copy the `.env` file from the root project's directory. In production, use system environment variables instead.

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

.medusa/server

❯cp ../../.env .env.production
```

Note: When `NODE_ENV=production`, the Medusa application loads the environment variables from `.env.production`. Learn more about environment variables in [this guide](https://docs.medusajs.com/learn/fundamentals/environment-variables).

- Set `NODE_ENV` to `production` in the system environment variable, then start the Medusa application from `.medusa/server`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

npmyarnpnpm

❯export NODE_ENV=production❯npm run start
```

* * *

## Deploying Production Build[\#](https://docs.medusajs.com/learn/build\#deploying-production-build)

The next chapter covers how you generally deploy the production build.

You can also refer to the [deployment how-to guides](https://docs.medusajs.com/resources/deployment) for platform-specific how-to guides.

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

7\. Debugging & TestingLogging

Worker Mode

Edited Dec 9· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/build/page.mdx)

- build Command
- Build Output
  - Separate Admin Build
- Start Built Medusa Application
- Deploying Production Build

Ask Anything

FAQ

What is Medusa?

How can I create a module?

How can I create a data model?

How do I create a workflow?

How can I extend a data model in the Product Module?

Recipes

How do I build a marketplace with Medusa?

How do I build digital products with Medusa?

How do I build subscription-based purchases with Medusa?

What other recipes are available in the Medusa documentation?

Chat is cleared on refresh

Line break

`⇧`  `↵`

No Filters Selected

- All Areas

- Concepts & Guides

- References

- Admin API

- Store API

- User Guide

- Troubleshooting


Clear

Commands

AI AssistantBeta

Getting started? Try one of the following terms.

Install Medusa with create-medusa-app

What is an API route?

What is a Module?

What is a Workflow?

Developing with Medusa

How to create a Module

How to create an API route

How to create a data model

How to create an admin widget

Navigation`↑`  `↓`

Open Result `↵`