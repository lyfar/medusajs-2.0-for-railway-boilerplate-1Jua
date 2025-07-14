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

# 2.1.3. Guide: Create Brand API Route

In the previous two chapters, you created a [Brand Module](https://docs.medusajs.com/learn/customization/custom-features/module) that added the concepts of brands to your application, then created a [workflow to create a brand](https://docs.medusajs.com/learn/customization/custom-features/workflow). In this chapter, you'll expose an API route that allows admin users to create a brand using the workflow from the previous chapter.

An API Route is an endpoint that acts as an entry point for other clients to interact with your Medusa customizations, such as the admin dashboard, storefronts, or third-party systems.

The Medusa core application provides a set of [admin](https://docs.medusajs.com/api/admin) and [store](https://docs.medusajs.com/api/store) API routes out-of-the-box. You can also create custom API routes to expose your custom functionalities.

Prerequisites1

[createBrandWorkflow↗](https://docs.medusajs.com/learn/customization/custom-features/workflow)

## 1\. Create the API Route[\#](https://docs.medusajs.com/learn/customization/custom-features/api-route\#1-create-the-api-route)

You create an API route in a `route.{ts,js}` file under a sub-directory of the `src/api` directory. The file exports API Route handler functions for at least one HTTP method (`GET`, `POST`, `DELETE`, etc…).

Note: Learn more about API routes [in this guide](https://docs.medusajs.com/learn/fundamentals/api-routes).

The route's path is the path of `route.{ts,js}` relative to `src/api`. So, to create the API route at `/admin/brands`, create the file `src/api/admin/brands/route.ts` with the following content:

![Directory structure of the Medusa application after adding the route](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-route-dir-overview-2_hjqlnf.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/api/admin/brands/route.ts

1import {2  MedusaRequest,3  MedusaResponse,4} from "@medusajs/framework/http"5import { 6  createBrandWorkflow,7} from "../../../workflows/create-brand"8
9type PostAdminCreateBrandType = {10  name: string11}12
13export const POST = async (14  req: MedusaRequest<PostAdminCreateBrandType>,15  res: MedusaResponse16) => {17  const { result } = await createBrandWorkflow(req.scope)18    .run({19      input: req.validatedBody,20    })21
22  res.json({ brand: result })23}
```

You export a route handler function with its name (`POST`) being the HTTP method of the API route you're exposing.

The function receives two parameters: a `MedusaRequest` object to access request details, and `MedusaResponse` object to return or manipulate the response. The `MedusaRequest` object's `scope` property is the [Medusa container](https://docs.medusajs.com/learn/fundamentals/medusa-container) that holds framework tools and custom and core modules' services.

Tip: `MedusaRequest` accepts the request body's type as a type argument.

In the API route's handler, you execute the `createBrandWorkflow` by invoking it and passing the Medusa container `req.scope` as a parameter, then invoking its `run` method. You pass the workflow's input in the `input` property of the `run` method's parameter. You pass the request body's parameters using the `validatedBody` property of `MedusaRequest`.

You return a JSON response with the created brand using the `res.json` method.

* * *

## 2\. Create Validation Schema[\#](https://docs.medusajs.com/learn/customization/custom-features/api-route\#2-create-validation-schema)

The API route you created accepts the brand's name in the request body. So, you'll create a schema used to validate incoming request body parameters.

Medusa uses [Zod](https://zod.dev/) to create validation schemas. These schemas are then used to validate incoming request bodies or query parameters.

Note: Learn more about API route validation in [this chapter](https://docs.medusajs.com/learn/fundamentals/api-routes/validation).

You create a validation schema in a TypeScript or JavaScript file under a sub-directory of the `src/api` directory. So, create the file `src/api/admin/brands/validators.ts` with the following content:

![Directory structure of Medusa application after adding validators file](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-route-dir-overview-1_yfyjss.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/api/admin/brands/validators.ts

1import { z } from "zod"2
3export const PostAdminCreateBrand = z.object({4  name: z.string(),5})
```

You export a validation schema that expects in the request body an object having a `name` property whose value is a string.

You can then replace `PostAdminCreateBrandType` in `src/api/admin/brands/route.ts` with the following:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/api/admin/brands/route.ts

1// ...2import { z } from "zod"3import { PostAdminCreateBrand } from "./validators"4
5type PostAdminCreateBrandType = z.infer<typeof PostAdminCreateBrand>6
7// ...
```

* * *

## 3\. Add Validation Middleware[\#](https://docs.medusajs.com/learn/customization/custom-features/api-route\#3-add-validation-middleware)

A middleware is a function executed before the route handler when a request is sent to an API Route. It's useful to guard API routes, parse custom request body types, and apply validation on an API route.

Note: Learn more about middlewares in [this chapter](https://docs.medusajs.com/learn/fundamentals/api-routes/middlewares).

Medusa provides a `validateAndTransformBody` middleware that accepts a Zod validation schema and returns a response error if a request is sent with body parameters that don't satisfy the validation schema.

Middlewares are defined in the special file `src/api/middlewares.ts`. So, to add the validation middleware on the API route you created in the previous step, create the file `src/api/middlewares.ts` with the following content:

![Directory structure of the Medusa application after adding the middleware](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-route-dir-overview-3_kcx511.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/api/middlewares.ts

1import { 2  defineMiddlewares,3  validateAndTransformBody,4} from "@medusajs/framework/http"5import { PostAdminCreateBrand } from "./admin/brands/validators"6
7export default defineMiddlewares({8  routes: [9    {10      matcher: "/admin/brands",11      method: "POST",12      middlewares: [13        validateAndTransformBody(PostAdminCreateBrand),14      ],15    },16  ],17})
```

You define the middlewares using the `defineMiddlewares` function and export its returned value. The function accepts an object having a `routes` property, which is an array of middleware objects.

In the middleware object, you define three properties:

- `matcher`: a string or regular expression indicating the API route path to apply the middleware on. You pass the create brand's route `/admin/brand`.
- `method`: The HTTP method to restrict the middleware to, which is `POST`.
- `middlewares`: An array of middlewares to apply on the route. You pass the `validateAndTransformBody` middleware, passing it the Zod schema you created earlier.

The Medusa application will now validate the body parameters of `POST` requests sent to `/admin/brands` to ensure they match the Zod validation schema. If not, an error is returned in the response specifying the issues to fix in the request body.

* * *

## Test API Route[\#](https://docs.medusajs.com/learn/customization/custom-features/api-route\#test-api-route)

To test out the API route, start the Medusa application with the following command:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

npmyarnpnpm

❯npm run dev
```

Since the `/admin/brands` API route has a `/admin` prefix, it's only accessible by authenticated admin users.

So, to retrieve an authenticated token of your admin user, send a `POST` request to the `/auth/user/emailpass` API Route:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Code

1curl -X POST 'http://localhost:9000/auth/user/emailpass' \2-H 'Content-Type: application/json' \3--data-raw '{4    "email": "admin@medusa-test.com",5    "password": "supersecret"6}'
```

Make sure to replace the email and password with your admin user's credentials.

Tip: Don't have an admin user? Refer to [this guide](https://docs.medusajs.com/learn/installation#create-medusa-admin-user).

Then, send a `POST` request to `/admin/brands`, passing the token received from the previous request in the `Authorization` header:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Code

1curl -X POST 'http://localhost:9000/admin/brands' \2-H 'Content-Type: application/json' \3-H 'Authorization: Bearer {token}' \4--data '{5    "name": "Acme"6}'
```

This returns the created brand in the response:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Example Response

1{2  "brand": {3    "id": "01J7AX9ES4X113HKY6C681KDZJ",4    "name": "Acme",5    "created_at": "2024-09-09T08:09:34.244Z",6    "updated_at": "2024-09-09T08:09:34.244Z"7  }8}
```

* * *

## Summary[\#](https://docs.medusajs.com/learn/customization/custom-features/api-route\#summary)

By following the previous example chapters, you implemented a custom feature that allows admin users to create a brand. You did that by:

1. Creating a module that defines and manages a `brand` table in the database.
2. Creating a workflow that uses the module's service to create a brand record, and implements the compensation logic to delete that brand in case an error occurs.
3. Creating an API route that allows admin users to create a brand.

* * *

## Next Steps: Associate Brand with Product[\#](https://docs.medusajs.com/learn/customization/custom-features/api-route\#next-steps-associate-brand-with-product)

Now that you have brands in your Medusa application, you want to associate a brand with a product, which is defined in the [Product Module](https://docs.medusajs.com/resources/commerce-modules/product).

In the next chapters, you'll learn how to build associations between data models defined in different modules.

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Brand Workflow

Extend Features

Edited Dec 9· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/customization/custom-features/api-route/page.mdx)

- 1\. Create the API Route
- 2\. Create Validation Schema
- 3\. Add Validation Middleware
- Test API Route
- Summary
- Next Steps: Associate Brand with Product

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

![Directory structure of the Medusa application after adding the route](https://docs.medusajs.com/learn/customization/custom-features/api-route)

![Directory structure of Medusa application after adding validators file](https://docs.medusajs.com/learn/customization/custom-features/api-route)

![Directory structure of the Medusa application after adding the middleware](https://docs.medusajs.com/learn/customization/custom-features/api-route)

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=2obcrfqwcvts)