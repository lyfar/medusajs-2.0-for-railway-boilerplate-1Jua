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

# 2.1.2. Guide: Create Brand Workflow

This chapter builds on the work from the [previous chapter](https://docs.medusajs.com/learn/customization/custom-features/module) where you created a Brand Module.

After adding custom modules to your application, you build commerce features around them using workflows. A workflow is a series of queries and actions, called steps, that complete a task spanning across modules. You construct a workflow similar to a regular function, but it's a special function that allows you to define roll-back logic, retry configurations, and more advanced features.

The workflow you'll create in this chapter will use the Brand Module's service to implement the feature of creating a brand. In the [next chapter](https://docs.medusajs.com/learn/customization/custom-features/api-route), you'll expose an API route that allows admin users to create a brand, and you'll use this workflow in the route's implementation.

Note: Learn more about workflows in [this chapter](https://docs.medusajs.com/learn/fundamentals/workflows).

Prerequisites1

[Brand Module↗](https://docs.medusajs.com/learn/customization/custom-features/module)

* * *

## 1\. Create createBrandStep[\#](https://docs.medusajs.com/learn/customization/custom-features/workflow\#1-create-createbrandstep)

A workflow consists of a series of steps, each step created in a TypeScript or JavaScript file under the `src/workflows` directory. A step is defined using `createStep` from the Workflows SDK

The workflow you're creating in this guide has one step to create the brand. So, create the file `src/workflows/create-brand.ts` with the following content:

![Directory structure in the Medusa project after adding the file for createBrandStep](https://res.cloudinary.com/dza7lstvk/image/upload/fl_lossy/f_auto/r_16/ar_16:9,c_pad/v1/Medusa%20Book/brand-workflow-dir-overview-1_fjvf5j.jpg?_a=DATAalWOZAA0)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/workflows/create-brand.ts

1import {2  createStep,3  StepResponse,4} from "@medusajs/framework/workflows-sdk"5import { BRAND_MODULE } from "../modules/brand"6import BrandModuleService from "../modules/brand/service"7
8export type CreateBrandStepInput = {9  name: string10}11
12export const createBrandStep = createStep(13  "create-brand-step",14  async (input: CreateBrandStepInput, { container }) => {15    const brandModuleService: BrandModuleService = container.resolve(16      BRAND_MODULE17    )18
19    const brand = await brandModuleService.createBrands(input)20
21    return new StepResponse(brand, brand.id)22  }23)
```

You create a `createBrandStep` using the `createStep` function. It accepts the step's unique name as a first parameter, and the step's function as a second parameter.

The step function receives two parameters: input passed to the step when it's invoked, and an object of general context and configurations. This object has a `container` property, which is the Medusa container.

The [Medusa container](https://docs.medusajs.com/learn/fundamentals/medusa-container) is a registry of framework and commerce tools accessible in your customizations, such as a workflow's step. The Medusa application registers the services of core and custom modules in the container, allowing you to resolve and use them.

So, In the step function, you use the Medusa container to resolve the Brand Module's service and use its generated `createBrands` method, which accepts an object of brands to create.

Note: Learn more about the generated `create` method's usage in [this reference](https://docs.medusajs.com/resources/service-factory-reference/methods/create).

A step must return an instance of `StepResponse`. Its first parameter is the data returned by the step, and the second is the data passed to the compensation function, which you'll learn about next.

### Add Compensation Function to Step[\#](https://docs.medusajs.com/learn/customization/custom-features/workflow\#add-compensation-function-to-step)

You define for each step a compensation function that's executed when an error occurs in the workflow. The compensation function defines the logic to roll-back the changes made by the step. This ensures your data remains consistent if an error occurs, which is especially useful when you integrate third-party services.

Note: Learn more about the compensation function in [this chapter](https://docs.medusajs.com/learn/fundamentals/workflows/compensation-function).

To add a compensation function to the `createBrandStep`, pass it as a third parameter to `createStep`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/workflows/create-brand.ts

1export const createBrandStep = createStep(2  // ...3  async (id: string, { container }) => {4    const brandModuleService: BrandModuleService = container.resolve(5      BRAND_MODULE6    )7
8    await brandModuleService.deleteBrands(id)9  }10)
```

The compensation function's first parameter is the brand's ID which you passed as a second parameter to the step function's returned `StepResponse`. It also accepts a context object with a `container` property as a second parameter, similar to the step function.

In the compensation function, you resolve the Brand Module's service from the Medusa container, then use its generated `deleteBrands` method to delete the brand created by the step. This method accepts the ID of the brand to delete.

Note: Learn more about the generated `delete` method's usage in [this reference](https://docs.medusajs.com/resources/service-factory-reference/methods/delete).

So, if an error occurs during the workflow's execution, the brand that was created by the step is deleted to maintain data consistency.

* * *

## 2\. Create createBrandWorkflow[\#](https://docs.medusajs.com/learn/customization/custom-features/workflow\#2-create-createbrandworkflow)

You can now create the workflow that runs the `createBrandStep`. A workflow is created in a TypeScript or JavaScript file under the `src/workflows` directory. In the file, you use `createWorkflow` from the Workflows SDK to create the workflow.

Add the following content in the same `src/workflows/create-brand.ts` file:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

src/workflows/create-brand.ts

1// other imports...2import {3  // ...4  createWorkflow,5  WorkflowResponse,6} from "@medusajs/framework/workflows-sdk"7
8// ...9
10type CreateBrandWorkflowInput = {11  name: string12}13
14export const createBrandWorkflow = createWorkflow(15  "create-brand",16  (input: CreateBrandWorkflowInput) => {17    const brand = createBrandStep(input)18
19    return new WorkflowResponse(brand)20  }21)
```

You create the `createBrandWorkflow` using the `createWorkflow` function. This function accepts two parameters: the workflow's unique name, and the workflow's constructor function holding the workflow's implementation.

The constructor function accepts the workflow's input as a parameter. In the function, you invoke the `createBrandStep` you created in the previous step to create a brand.

A workflow must return an instance of `WorkflowResponse`. It accepts as a parameter the data to return to the workflow's executor.

* * *

## Next Steps: Expose Create Brand API Route[\#](https://docs.medusajs.com/learn/customization/custom-features/workflow\#next-steps-expose-create-brand-api-route)

You now have a `createBrandWorkflow` that you can execute to create a brand.

In the next chapter, you'll add an API route that allows admin users to create a brand. You'll learn how to create the API route, and execute in it the workflow you implemented in this chapter.

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Brand Module

Brand API Route

Edited Dec 9· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/customization/custom-features/workflow/page.mdx)

- 1\. Create createBrandStep
  - Add Compensation Function to Step
- 2\. Create createBrandWorkflow
- Next Steps: Expose Create Brand API Route

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

![Directory structure in the Medusa project after adding the file for createBrandStep](https://docs.medusajs.com/learn/customization/custom-features/workflow)

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=ylohcninubqy)