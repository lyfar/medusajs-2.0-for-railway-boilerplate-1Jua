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

# 2.3.1. Guide: Add Product's Brand Widget in Admin

In this chapter, you'll customize the product details page of the Medusa Admin dashboard to show the product's [brand](https://docs.medusajs.com/learn/customization/custom-features/module). You'll create a widget that is injected into a pre-defined zone in the page, and in the widget you'll retrieve the product's brand from the server and display it.

Prerequisites1

[Brands linked to products↗](https://docs.medusajs.com/learn/customization/extend-features/define-link)

## 1\. Initialize JS SDK[\#](https://docs.medusajs.com/learn/customization/customize-admin/widget\#1-initialize-js-sdk)

In your custom widget, you'll retrieve the product's brand by sending a request to the Medusa server. Medusa has a [JS SDK](https://docs.medusajs.com/resources/js-sdk) that simplifies sending requests to the server's API routes.

So, you'll start by configuring the JS SDK. Create the file `src/admin/lib/sdk.ts` with the following content:

![The directory structure of the Medusa application after adding the file](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brands-admin-dir-overview-1_jleg0t.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/lib/sdk.ts

1import Medusa from "@medusajs/js-sdk"2
3export const sdk = new Medusa({4  baseUrl: import.meta.env.VITE_BACKEND_URL || "/",5  debug: import.meta.env.DEV,6  auth: {7    type: "session",8  },9})
```

You initialize the SDK passing it the following options:

- `baseUrl`: The URL to the Medusa server.
- `debug`: Whether to enable logging debug messages. This should only be enabled in development.
- `auth.type`: The authentication method used in the client application, which is `session` in the Medusa Admin dashboard.

Notice that you use `import.meta.env` to access environment variables in your customizations because the Medusa Admin is built on top of Vite. Learn more in [this chapter](https://docs.medusajs.com/learn/fundamentals/admin/environment-variables).

You can now use the SDK to send requests to the Medusa server.

Note: Learn more about the JS SDK and its options in [this reference](https://docs.medusajs.com/resources/js-sdk).

* * *

## 2\. Add Widget to Product Details Page[\#](https://docs.medusajs.com/learn/customization/customize-admin/widget\#2-add-widget-to-product-details-page)

You'll now add a widget to the product-details page. A widget is a React component that's injected into pre-defined zones in the Medusa Admin dashboard. It's created in a `.tsx` file under the `src/admin/widgets` directory.

Note: Learn more about widgets in [this documentation](https://docs.medusajs.com/learn/fundamentals/admin/widgets).

To create a widget that shows a product's brand in its details page, create the file `src/admin/widgets/product-brand.tsx` with the following content:

![Directory structure of the Medusa application after adding the widget](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brands-admin-dir-overview-2_eq5xhi.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/widgets/product-brand.tsx

1import { defineWidgetConfig } from "@medusajs/admin-sdk"2import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"3import { clx, Container, Heading, Text } from "@medusajs/ui"4import { useQuery } from "@tanstack/react-query"5import { sdk } from "../lib/sdk"6
7type AdminProductBrand = AdminProduct & {8  brand?: {9    id: string10    name: string11  }12}13
14const ProductBrandWidget = ({ 15  data: product,16}: DetailWidgetProps<AdminProduct>) => {17  const { data: queryResult } = useQuery({18    queryFn: () => sdk.admin.product.retrieve(product.id, {19      fields: "+brand.*",20    }),21    queryKey: [["product", product.id]],22  })23  const brandName = (queryResult?.product as AdminProductBrand)?.brand?.name24
25  return (26    <Container className="divide-y p-0">27      <div className="flex items-center justify-between px-6 py-4">28        <div>29          <Heading level="h2">Brand</Heading>30        </div>31      </div>32      <div33        className={clx(34          `text-ui-fg-subtle grid grid-cols-2 items-center px-6 py-4`35        )}36      >37        <Text size="small" weight="plus" leading="compact">38          Name39        </Text>40
41        <Text42          size="small"43          leading="compact"44          className="whitespace-pre-line text-pretty"45        >46          {brandName || "-"}47        </Text>48      </div>49    </Container>50  )51}52
53export const config = defineWidgetConfig({54  zone: "product.details.before",55})56
57export default ProductBrandWidget
```

A widget's file must export:

- A React component to be rendered in the specified injection zone. The component must be the file's default export.
- A configuration object created with `defineWidgetConfig` from the Admin Extension SDK. The function receives an object as a parameter that has a `zone` property, whose value is the zone to inject the widget to.

Since the widget is injected at the top of the product details page, the widget receives the product's details as a parameter.

In the widget, you use [Tanstack (React) Query](https://tanstack.com/query/latest) to query the Medusa server. Tanstack Query provides features like asynchronous state management and optimized caching. In the `queryFn` function that executes the query, you use the JS SDK to send a request to the [Get Product API Route](https://docs.medusajs.com/api/admin#products_getproductsid), passing `+brand.*` in the `fields` query parameter to retrieve the product's brand.

Warning: Do not install Tanstack Query as that will cause unexpected errors in your development. If you prefer installing it for better auto-completion in your code editor, make sure to install `v5.64.2` as a development dependency.

You then render a section that shows the brand's name. In admin customizations, use components from the [Medusa UI package](https://docs.medusajs.com/ui) to maintain a consistent user interface and design in the dashboard.

* * *

## Test it Out[\#](https://docs.medusajs.com/learn/customization/customize-admin/widget\#test-it-out)

To test out your widget, start the Medusa application:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

npmyarnpnpm

❯npm run dev
```

Then, open the admin dashboard at `http://localhost:9000/app`. After you log in, open the page of a product that has a brand. You'll see a new section at the top showing the brand's name.

![The widget is added as the first section of the product details page.](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/Screenshot_2024-12-05_at_5.59.25_PM_y85m14.png?_a=DATAalWOZAA0)

* * *

## Admin Components Guides[\#](https://docs.medusajs.com/learn/customization/customize-admin/widget\#admin-components-guides)

When building your widget, you may need more complicated components. For example, you may add a form to the above widget to set the product's brand.

The [Admin Components guides](https://docs.medusajs.com/resources/admin-components) show you how to build and use common components in the Medusa Admin, such as forms, tables, JSON data viewer, and more. The components in the guides also follow the Medusa Admin's design convention.

* * *

## Next Chapter: Add UI Route for Brands[\#](https://docs.medusajs.com/learn/customization/customize-admin/widget\#next-chapter-add-ui-route-for-brands)

In the next chapter, you'll add a UI route that displays the list of brands in your application and allows admin users.

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Customize Admin

Add UI Route

Edited Feb 4· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/customization/customize-admin/widget/page.mdx)

- 1\. Initialize JS SDK
- 2\. Add Widget to Product Details Page
- Test it Out
- Admin Components Guides
- Next Chapter: Add UI Route for Brands

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

![The directory structure of the Medusa application after adding the file](https://docs.medusajs.com/learn/customization/customize-admin/widget)

![Directory structure of the Medusa application after adding the widget](https://docs.medusajs.com/learn/customization/customize-admin/widget)

![The widget is added as the first section of the product details page.](https://docs.medusajs.com/learn/customization/customize-admin/widget)

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=2xquv3rvnt4)