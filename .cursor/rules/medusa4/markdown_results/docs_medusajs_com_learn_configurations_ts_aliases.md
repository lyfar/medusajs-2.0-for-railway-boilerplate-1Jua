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

# 6.3. Using TypeScript Aliases

By default, Medusa doesn't support TypeScript aliases in production.

If you prefer using TypeScript aliases, install following development dependencies:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

npmyarnpnpm

❯npm install --save-dev tsc-alias rimraf
```

Where `tsc-alias` is a package that resolves TypeScript aliases, and `rimraf` is a package that removes files and directories.

Then, add a new `resolve:aliases` script to your `package.json` and update the `build` script:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

package.json

1{2  "scripts": {3    // other scripts...4    "resolve:aliases": "tsc --showConfig -p tsconfig.json > tsconfig.resolved.json && tsc-alias -p tsconfig.resolved.json && rimraf tsconfig.resolved.json",5    "build": "npm run resolve:aliases && medusa build"6  }7}
```

You can now use TypeScript aliases in your Medusa application. For example, add the following in `tsconfig.json`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

tsconfig.json

1{2  "compilerOptions": {3    // ...4    "paths": {5      "@/*": ["./src/*"]6    }7  }8}
```

Now, you can import modules, for example, using TypeScript aliases:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Code

import { BrandModuleService } from "@/modules/brand/service"
```

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Medusa Configuations

7\. Debugging & TestingTesting Tools

Edited Feb 11· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/configurations/ts-aliases/page.mdx)

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

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=5d3v9lbd7fgq)