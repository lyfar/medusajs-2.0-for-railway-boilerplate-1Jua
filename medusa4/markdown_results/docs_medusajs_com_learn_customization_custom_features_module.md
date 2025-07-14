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

# 2.1.1. Guide: Implement Brand Module

In this chapter, you'll build a Brand Module that adds a `brand` table to the database and provides data-management features for it.

A module is a reusable package of functionalities related to a single domain or integration. Medusa comes with multiple pre-built modules for core commerce needs, such as the [Cart Module](https://docs.medusajs.com/resources/commerce-modules/cart) that holds the data models and business logic for cart operations.

In a module, you create data models and business logic to manage them. In the next chapters, you'll see how you use the module to build commerce features.

Note: Learn more about modules in [this chapter](https://docs.medusajs.com/learn/fundamentals/modules).

## 1\. Create Module Directory[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#1-create-module-directory)

Modules are created in a sub-directory of `src/modules`. So, start by creating the directory `src/modules/brand` that will hold the Brand Module's files.

![Directory structure in Medusa project after adding the brand directory](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-dir-overview-1_hxwvgx.jpg?_a=DATAalWOZAA0)

* * *

## 2\. Create Data Model[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#2-create-data-model)

A data model represents a table in the database. You create data models using Medusa's Data Model Language (DML). It simplifies defining a table's columns, relations, and indexes with straightforward methods and configurations.

Note: Learn more about data models in [this chapter](https://docs.medusajs.com/learn/fundamentals/modules#1-create-data-model).

You create a data model in a TypeScript or JavaScript file under the `models` directory of a module. So, to create a data model that represents a new `brand` table in the database, create the file `src/modules/brand/models/brand.ts` with the following content:

![Directory structure in module after adding the brand data model](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-dir-overview-2_lexhdl.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/modules/brand/models/brand.ts

1import { model } from "@medusajs/framework/utils"2
3export const Brand = model.define("brand", {4  id: model.id().primaryKey(),5  name: model.text(),6})
```

You create a `Brand` data model which has an `id` primary key property, and a `name` text property.

You define the data model using the `define` method of the DML. It accepts two parameters:

1. The first one is the name of the data model's table in the database. Use snake-case names.
2. The second is an object, which is the data model's schema.

Tip: Learn about other property types in [this chapter](https://docs.medusajs.com/learn/fundamentals/data-models/properties).

* * *

## 3\. Create Module Service[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#3-create-module-service)

You perform database operations on your data models in a service, which is a class exported by the module and acts like an interface to its functionalities.

In this step, you'll create the Brand Module's service that provides methods to manage the `Brand` data model. In the next chapters, you'll use this service when exposing custom features that involve managing brands.

Note: Learn more about services in [this chapter](https://docs.medusajs.com/learn/fundamentals/modules#2-create-service).

You define a service in a `service.ts` or `service.js` file at the root of your module's directory. So, create the file `src/modules/brand/service.ts` with the following content:

![Directory structure in module after adding the service](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-dir-overview-3_jo7baj.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/modules/brand/service.ts

1import { MedusaService } from "@medusajs/framework/utils"2import { Brand } from "./models/brand"3
4class BrandModuleService extends MedusaService({5  Brand,6}) {7
8}9
10export default BrandModuleService
```

The `BrandModuleService` extends a class returned by `MedusaService` from the Modules SDK. This function generates a class with data-management methods for your module's data models.

The `MedusaService` function receives an object of the module's data models as a parameter, and generates methods to manage those data models. So, the `BrandModuleService` now has methods like `createBrands` and `retrieveBrand` to manage the `Brand` data model.

You'll use these methods in the [next chapter](https://docs.medusajs.com/learn/customization/custom-features/workflow).

Tip: Find a reference of all generated methods in [this guide](https://docs.medusajs.com/resources/service-factory-reference).

* * *

## 4\. Export Module Definition[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#4-export-module-definition)

A module must export a definition that tells Medusa the name of the module and its main service. This definition is exported in an `index.ts` file at the module's root directory.

So, to export the Brand Module's definition, create the file `src/modules/brand/index.ts` with the following content:

![Directory structure in module after adding the definition file](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-dir-overview-4_nf8ymw.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/modules/brand/index.ts

1import { Module } from "@medusajs/framework/utils"2import BrandModuleService from "./service"3
4export const BRAND_MODULE = "brand"5
6export default Module(BRAND_MODULE, {7  service: BrandModuleService,8})
```

You use `Module` from the Modules SDK to create the module's definition. It accepts two parameters:

1. The module's name (`brand`). You'll use this name when you use this module in other customizations.
2. An object with a required property `service` indicating the module's main service.

Tip: You export `BRAND_MODULE` to reference the module's name more reliably in other customizations.

* * *

## 5\. Add Module to Medusa's Configurations[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#5-add-module-to-medusas-configurations)

To start using your module, you must add it to Medusa's configurations in `medusa-config.ts`.

The object passed to `defineConfig` in `medusa-config.ts` accepts a `modules` property, whose value is an array of modules to add to the application. So, add the following in `medusa-config.ts`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  // ...3  modules: [4    {5      resolve: "./src/modules/brand",6    },7  ],8})
```

The Brand Module is now added to your Medusa application. You'll start using it in the [next chapter](https://docs.medusajs.com/learn/customization/custom-features/workflow).

* * *

## 6\. Generate and Run Migrations[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#6-generate-and-run-migrations)

A migration is a TypeScript or JavaScript file that defines database changes made by a module. Migrations ensure that your module is re-usable and removes friction when working in a team, making it easy to reflect changes across team members' databases.

Note: Learn more about migrations in [this chapter](https://docs.medusajs.com/learn/fundamentals/modules#5-generate-migrations).

[Medusa's CLI tool](https://docs.medusajs.com/resources/medusa-cli) allows you to generate migration files for your module, then run those migrations to reflect the changes in the database. So, run the following commands in your Medusa application's directory:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯npx medusa db:generate brand❯npx medusa db:migrate
```

The `db:generate` command accepts as an argument the name of the module to generate the migrations for, and the `db:migrate` command runs all migrations that haven't been run yet in the Medusa application.

* * *

## Next Step: Create Brand Workflow[\#](https://docs.medusajs.com/learn/customization/custom-features/module\#next-step-create-brand-workflow)

The Brand Module now creates a `brand` table in the database and provides a class to manage its records.

In the next chapter, you'll implement the functionality to create a brand in a workflow. You'll then use that workflow in a later chapter to expose an endpoint that allows admin users to create a brand.

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Build Custom Features

Brand Workflow

Edited Mar 17· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/customization/custom-features/module/page.mdx)

- 1\. Create Module Directory
- 2\. Create Data Model
- 3\. Create Module Service
- 4\. Export Module Definition
- 5\. Add Module to Medusa's Configurations
- 6\. Generate and Run Migrations
- Next Step: Create Brand Workflow

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

![Directory structure in Medusa project after adding the brand directory](https://docs.medusajs.com/learn/customization/custom-features/module)

![Directory structure in module after adding the brand data model](https://docs.medusajs.com/learn/customization/custom-features/module)

![Directory structure in module after adding the service](https://docs.medusajs.com/learn/customization/custom-features/module)

![Directory structure in module after adding the definition file](https://docs.medusajs.com/learn/customization/custom-features/module)

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=rac4g1smorkq)