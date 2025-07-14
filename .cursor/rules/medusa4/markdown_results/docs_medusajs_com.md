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

Documentation

## Learn how to build Medusa projects. Explore our guides.

![Get started](https://docs.medusajs.com/images/get-started-card.png)

Get startedIntroduction

- Create API Route
- Build Workflows
- Add a Data Model
- Build a Custom Module
- Link Data Models
- Subscribe to Events
- Customize Admin
- Integrate Systems

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75
1export async function GET(2  req: MedusaRequest,3  res: MedusaResponse4) {5  const query = req.scope.resolve("query")6
7  const { data } = await query.graph({8    entity: "company",9    fields: ["id", "name"],10    filters: { name: "ACME" },11  })12
13  res.json({14    companies: data15  })16}
```

Expose custom features with REST API routes, then consume them from your client applications.· [API Routes](https://docs.medusajs.com/learn/fundamentals/api-routes)

Optimized for Customizations

## A digital commerce platform with a built-in framework for customizations.

Unlike other platforms, Medusa allows you to easily customize and extend the behavior of your commerce platform to always fit your business needs.

### Customize Medusa Application

[Create your first application](https://docs.medusajs.com/learn/installation) [Build a Module](https://docs.medusajs.com/learn/customization) [Browse third-party integrations](https://docs.medusajs.com/resources/integrations)

### Admin Development

[Build a UI Widget](https://docs.medusajs.com/learn/fundamentals/admin/widgets) [Add a UI Route](https://docs.medusajs.com/learn/fundamentals/admin/ui-routes) [Browse the UI component library](https://docs.medusajs.com/ui)

### Storefront Development

[Explore our storefront starter](https://docs.medusajs.com/resources/nextjs-starter) [Build a custom storefront](https://docs.medusajs.com/resources/storefront-development) [Browse the UI component library](https://docs.medusajs.com/ui)

Recipes

## Medusa’s framework supports any business use case.

These recipes show how you to build a use case by customizing and extending existing data models and features, or creating new ones.

[View All Recipes](https://docs.medusajs.com/resources/recipes)

ERP

Integrate an ERP system to manage custom product prices, purchase rules, syncing orders, and more.

Marketplace

Build a marketplace with multiple vendors.

Subscriptions

Implement a subscription-based commerce store.

Restaurant-Delivery

Build a restaurant marketplace inspired by UberEats, with real-time delivery handling.

Digital Products

Sell digital products with custom fulfillment.

Restock Notifications

Notify customers when a product is back in stock.

Browse Commerce Modules

## All commerce features are provided as extendable modules in Medusa.

Click on any of the commerce modules below to learn more about their commerce features, and how to extend and use them for your custom use-case.

### Cart & Purchase

Checkout, Total calculations, and more

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fcart-icon.png&w=64&q=75)

Cart

Add to cart, checkout, and totals.

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fpayment-icon.png&w=64&q=75)

Payment

Process any payment type.

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fcustomer-icon.png&w=64&q=75)

Customer

Customer and group management.

### Merchandising

Products, pricing, and promotions.

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fpricing-icon.png&w=64&q=75)

Pricing

Configurable pricing engine

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fpromotion-icon.png&w=64&q=75)

Promotion

Discounts and promotions

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fproduct-icon.png&w=64&q=75)

Product

Variants, categories, and bulk edits

### Fulfillment

OMS, fulfilment, and inventory.

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Forder-icon.png&w=64&q=75)

Order

Omnichannel order management

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Finventory-icon.png&w=64&q=75)

Inventory

Multi-warehouse and reservations

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Ffulfillment-icon.png&w=64&q=75)

Fulfillment

Order fulfillment and shipping

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fstock-location-icon.png&w=64&q=75)

Stock Location

Locations of stock-kept items

### Regions & Channels

Multi-region and omnichannel support.

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fregion-icon.png&w=64&q=75)

Region

Cross-border commerce

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fsales-channel-icon.png&w=64&q=75)

Sales Channel

Omnichannel sales

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Ftax-icon.png&w=64&q=75)

Tax

Granular tax control

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fcurrency-icon.png&w=64&q=75)

Currency

Multi-currency support

### User Access

API keys and authentication.

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fapi-key-icon.png&w=64&q=75)

API Keys

Store and admin access

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fuser-icon.png&w=64&q=75)

User Module

Admin user management

![](https://docs.medusajs.com/_next/image?url=%2Fimages%2Fauth-icon.png&w=64&q=75)

Auth

Integrate authentication methods

Was this page helpful?

It was helpfulIt wasn't helpfulReport Issue

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

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=yhmeoidr6ek4)