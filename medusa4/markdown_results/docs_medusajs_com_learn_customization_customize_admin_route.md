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

# 2.3.2. Create Brands UI Route in Admin

In this chapter, you'll add a UI route to the admin dashboard that shows all [brands](https://docs.medusajs.com/learn/customization/custom-features/module) in a new page. You'll retrieve the brands from the server and display them in a table with pagination.

Prerequisites1

[Brands Module↗](https://docs.medusajs.com/learn/customization/custom-features/modules)

## 1\. Get Brands API Route[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#1-get-brands-api-route)

In a [previous chapter](https://docs.medusajs.com/learn/customization/extend-features/query-linked-records), you learned how to add an API route that retrieves brands and their products using [Query](https://docs.medusajs.com/learn/fundamentals/module-links/query). You'll expand that API route to support pagination, so that on the admin dashboard you can show the brands in a paginated table.

Replace or create the `GET` API route at `src/api/admin/brands/route.ts` with the following:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/api/admin/brands/route.ts

1// other imports...2import {3  MedusaRequest,4  MedusaResponse,5} from "@medusajs/framework/http"6
7export const GET = async (8  req: MedusaRequest,9  res: MedusaResponse10) => {11  const query = req.scope.resolve("query")12  13  const { 14    data: brands, 15    metadata: { count, take, skip } = {},16  } = await query.graph({17    entity: "brand",18    ...req.queryConfig,19  })20
21  res.json({ 22    brands,23    count,24    limit: take,25    offset: skip,26  })27}
```

In the API route, you use Query's `graph` method to retrieve the brands. In the method's object parameter, you spread the `queryConfig` property of the request object. This property holds configurations for pagination and retrieved fields.

The query configurations are combined from default configurations, which you'll add next, and the request's query parameters:

- `fields`: The fields to retrieve in the brands.
- `limit`: The maximum number of items to retrieve.
- `offset`: The number of items to skip before retrieving the returned items.

When you pass pagination configurations to the `graph` method, the returned object has the pagination's details in a `metadata` property, whose value is an object having the following properties:

- `count`: The total count of items.
- `take`: The maximum number of items returned in the `data` array.
- `skip`: The number of items skipped before retrieving the returned items.

You return in the response the retrieved brands and the pagination configurations.

Note: Learn more about pagination with Query in [this chapter](https://docs.medusajs.com/learn/fundamentals/module-links/query#apply-pagination).

* * *

## 2\. Add Default Query Configurations[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#2-add-default-query-configurations)

Next, you'll set the default query configurations of the above API route and allow passing query parameters to change the configurations.

Medusa provides a `validateAndTransformQuery` middleware that validates the accepted query parameters for a request and sets the default Query configuration. So, in `src/api/middlewares.ts`, add a new middleware configuration object:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/api/middlewares.ts

1import { 2  defineMiddlewares,3  validateAndTransformQuery,4} from "@medusajs/framework/http"5import { createFindParams } from "@medusajs/medusa/api/utils/validators"6// other imports...7
8export const GetBrandsSchema = createFindParams()9
10export default defineMiddlewares({11  routes: [12    // ...13    {14      matcher: "/admin/brands",15      method: "GET",16      middlewares: [17        validateAndTransformQuery(18          GetBrandsSchema,19          {20            defaults: [21              "id",22              "name",23              "products.*",24            ],25            isList: true,26          }27        ),28      ],29    },30\
31  ],32})
```

You apply the `validateAndTransformQuery` middleware on the `GET /admin/brands` API route. The middleware accepts two parameters:

- A [Zod](https://zod.dev/) schema that a request's query parameters must satisfy. Medusa provides `createFindParams` that generates a Zod schema with the following properties:

- `fields`: A comma-separated string indicating the fields to retrieve.
- `limit`: The maximum number of items to retrieve.
- `offset`: The number of items to skip before retrieving the returned items.
- `order`: The name of the field to sort the items by. Learn more about sorting in [the API reference](https://docs.medusajs.com/api/admin#sort-order)

- An object of Query configurations having the following properties:

- `defaults`: An array of default fields and relations to retrieve.
- `isList`: Whether the API route returns a list of items.

By applying the above middleware, you can pass pagination configurations to `GET /admin/brands`, which will return a paginated list of brands. You'll see how it works when you create the UI route.

Note: Learn more about using the `validateAndTransformQuery` middleware to configure Query in [this chapter](https://docs.medusajs.com/learn/fundamentals/module-links/query#request-query-configurations).

* * *

## 3\. Initialize JS SDK[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#3-initialize-js-sdk)

In your custom UI route, you'll retrieve the brands by sending a request to the Medusa server. Medusa has a [JS SDK](https://docs.medusajs.com/resources/js-sdk) that simplifies sending requests to the core API route.

If you didn't follow the [previous chapter](https://docs.medusajs.com/learn/customization/customize-admin/widget), create the file `src/admin/lib/sdk.ts` with the following content:

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

## 4\. Add a UI Route to Show Brands[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#4-add-a-ui-route-to-show-brands)

You'll now add the UI route that shows the paginated list of brands. A UI route is a React component created in a `page.tsx` file under a sub-directory of `src/admin/routes`. The file's path relative to src/admin/routes determines its path in the dashboard.

Note: Learn more about UI routes in [this chapter](https://docs.medusajs.com/learn/fundamentals/admin/ui-routes).

So, to add the UI route at the `localhost:9000/app/brands` path, create the file `src/admin/routes/brands/page.tsx` with the following content:

![Directory structure of the Medusa application after adding the UI route.](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brands-admin-dir-overview-3_syytld.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1import { defineRouteConfig } from "@medusajs/admin-sdk"2import { TagSolid } from "@medusajs/icons"3import { 4  Container,5} from "@medusajs/ui"6import { useQuery } from "@tanstack/react-query"7import { sdk } from "../../lib/sdk"8import { useMemo, useState } from "react"9
10const BrandsPage = () => {11  // TODO retrieve brands12
13  return (14    <Container className="divide-y p-0">15      {/* TODO show brands */}16    </Container>17  )18}19
20export const config = defineRouteConfig({21  label: "Brands",22  icon: TagSolid,23})24
25export default BrandsPage
```

A route's file must export the React component that will be rendered in the new page. It must be the default export of the file. You can also export configurations that add a link in the sidebar for the UI route. You create these configurations using `defineRouteConfig` from the Admin Extension SDK.

So far, you only show a container. In admin customizations, use components from the [Medusa UI package](https://docs.medusajs.com/ui) to maintain a consistent user interface and design in the dashboard.

### Retrieve Brands From API Route[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#retrieve-brands-from-api-route)

You'll now update the UI route to retrieve the brands from the API route you added earlier.

First, add the following type in `src/admin/routes/brands/page.tsx`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1type Brand = {2  id: string3  name: string4}5type BrandsResponse = {6  brands: Brand[]7  count: number8  limit: number9  offset: number10}
```

You define the type for a brand, and the type of expected response from the `GET /admin/brands` API route.

To display the brands, you'll use Medusa UI's [DataTable](https://docs.medusajs.com/ui/components/data-table) component. So, add the following imports in `src/admin/routes/brands/page.tsx`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1import { 2  // ...3  Heading,4  createDataTableColumnHelper,5  DataTable,6  DataTablePaginationState,7  useDataTable,8} from "@medusajs/ui"
```

You import the `DataTable` component and the following utilities:

- `createDataTableColumnHelper`: A utility to create columns for the data table.
- `DataTablePaginationState`: A type that holds the pagination state of the data table.
- `useDataTable`: A hook to initialize and configure the data table.

You also import the `Heading` component to show a heading above the data table.

Next, you'll define the table's columns. Add the following before the `BrandsPage` component:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1const columnHelper = createDataTableColumnHelper<Brand>()2
3const columns = [4  columnHelper.accessor("id", {5    header: "ID",6  }),7  columnHelper.accessor("name", {8    header: "Name",9  }),10]
```

You use the `createDataTableColumnHelper` utility to create columns for the data table. You define two columns for the ID and name of the brands.

Then, replace the `// TODO retrieve brands` in the component with the following:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1const limit = 152const [pagination, setPagination] = useState<DataTablePaginationState>({3  pageSize: limit,4  pageIndex: 0,5})6const offset = useMemo(() => {7  return pagination.pageIndex * limit8}, [pagination])9
10const { data, isLoading } = useQuery<BrandsResponse>({11  queryFn: () => sdk.client.fetch(`/admin/brands`, {12    query: {13      limit,14      offset,15    },16  }),17  queryKey: [["brands", limit, offset]],18})19
20// TODO configure data table
```

To enable pagination in the `DataTable` component, you need to define a state variable of type `DataTablePaginationState`. It's an object having the following properties:

- `pageSize`: The maximum number of items per page. You set it to `15`.
- `pageIndex`: A zero-based index of the current page of items.

You also define a memoized `offset` value that indicates the number of items to skip before retrieving the current page's items.

Then, you use `useQuery` from [Tanstack (React) Query](https://tanstack.com/query/latest) to query the Medusa server. Tanstack Query provides features like asynchronous state management and optimized caching.

Warning: Do not install Tanstack Query as that will cause unexpected errors in your development. If you prefer installing it for better auto-completion in your code editor, make sure to install `v5.64.2` as a development dependency.

In the `queryFn` function that executes the query, you use the JS SDK's `client.fetch` method to send a request to your custom API route. The first parameter is the route's path, and the second is an object of request configuration and data. You pass the query parameters in the `query` property.

This sends a request to the [Get Brands API route](https://docs.medusajs.com/learn/customization/customize-admin/route#1-get-brands-api-route), passing the pagination query parameters. Whenever `currentPage` is updated, the `offset` is also updated, which will send a new request to retrieve the brands for the current page.

### Display Brands Table[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#display-brands-table)

Finally, you'll display the brands in a data table. Replace the `// TODO configure data table` in the component with the following:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1const table = useDataTable({2  columns,3  data: data?.brands || [],4  getRowId: (row) => row.id,5  rowCount: data?.count || 0,6  isLoading,7  pagination: {8    state: pagination,9    onPaginationChange: setPagination,10  },11})
```

You use the `useDataTable` hook to initialize and configure the data table. It accepts an object with the following properties:

- `columns`: The columns of the data table. You created them using the `createDataTableColumnHelper` utility.
- `data`: The brands to display in the table.
- `getRowId`: A function that returns a unique identifier for a row.
- `rowCount`: The total count of items. This is used to determine the number of pages.
- `isLoading`: A boolean indicating whether the data is loading.
- `pagination`: An object to configure pagination. It accepts the following properties:

- `state`: The pagination state of the data table.
- `onPaginationChange`: A function to update the pagination state.

Then, replace the `{/* TODO show brands */}` in the return statement with the following:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/admin/routes/brands/page.tsx

1<DataTable instance={table}>2  <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">3    <Heading>Brands</Heading>4  </DataTable.Toolbar>5  <DataTable.Table />6  <DataTable.Pagination />7</DataTable>
```

This renders the data table that shows the brands with pagination. The `DataTable` component accepts the `instance` prop, which is the object returned by the `useDataTable` hook.

* * *

## Test it Out[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#test-it-out)

To test out the UI route, start the Medusa application:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

npmyarnpnpm

❯npm run dev
```

Then, open the admin dashboard at `http://localhost:9000/app`. After you log in, you'll find a new "Brands" sidebar item. Click on it to see the brands in your store. You can also go to `http://localhost:9000/app/brands` to see the page.

![A new sidebar item is added for the new brands UI route. The UI route shows the table of brands with pagination.](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/Screenshot_2024-12-05_at_7.46.52_PM_slcdqd.png?_a=DATAalWOZAA0)

* * *

## Summary[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#summary)

By following the previous chapters, you:

- Injected a widget into the product details page to show the product's brand.
- Created a UI route in the Medusa Admin that shows the list of brands.

* * *

## Next Steps: Integrate Third-Party Systems[\#](https://docs.medusajs.com/learn/customization/customize-admin/route\#next-steps-integrate-third-party-systems)

Your customizations often span across systems, where you need to retrieve data or perform operations in a third-party system.

In the next chapters, you'll learn about the concepts that facilitate integrating third-party systems in your application. You'll integrate a dummy third-party system and sync the brands between it and the Medusa application.

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Add Widget

Integrate Systems

Edited Feb 11· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/customization/customize-admin/route/page.mdx)

- 1\. Get Brands API Route
- 2\. Add Default Query Configurations
- 3\. Initialize JS SDK
- 4\. Add a UI Route to Show Brands
  - Retrieve Brands From API Route
  - Display Brands Table
- Test it Out
- Summary
- Next Steps: Integrate Third-Party Systems

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

![The directory structure of the Medusa application after adding the file](https://docs.medusajs.com/learn/customization/customize-admin/route)

![Directory structure of the Medusa application after adding the UI route.](https://docs.medusajs.com/learn/customization/customize-admin/route)

![A new sidebar item is added for the new brands UI route. The UI route shows the table of brands with pagination.](https://docs.medusajs.com/learn/customization/customize-admin/route)

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=d02h1pdaw0hp)