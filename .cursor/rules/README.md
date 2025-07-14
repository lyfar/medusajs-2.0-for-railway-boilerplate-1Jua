# Cursor Rules for Medusa v2 Sticker Store

This directory contains Cursor AI rules to help with the migration and development of the Medusa v2 sticker store project.

## Rules Overview

### 1. `project-structure.mdc` (Always Applied)
- **Purpose**: Provides overall project structure understanding
- **Scope**: Applied to all files automatically
- **Contains**: Backend/frontend structure, reference implementations, key technologies

### 2. `sticker-migration.mdc` (Manual)
- **Purpose**: Specific guidance for sticker functionality migration
- **Scope**: Applied when working on sticker-related features
- **Contains**: Migration sources, target structure, key patterns, testing strategy

### 3. `medusa-v2-patterns.mdc` (TypeScript Files)
- **Purpose**: Medusa v2 development patterns and best practices
- **Scope**: Applied to `.ts` and `.tsx` files
- **Contains**: Module, service, model, workflow, and API patterns

### 4. `nextjs-storefront-patterns.mdc` (Storefront Files)
- **Purpose**: Next.js 14 storefront development patterns
- **Scope**: Applied to files in the `storefront/` directory
- **Contains**: App Router patterns, component organization, data fetching, styling

### 5. `testing-patterns.mdc` (Test Files)
- **Purpose**: Testing patterns for Medusa v2
- **Scope**: Applied to `.test.ts` and `.spec.ts` files
- **Contains**: Test structure, Jest patterns, mocking, assertions

### 6. `file-organization.mdc` (Manual)
- **Purpose**: File organization and naming conventions
- **Scope**: Applied when asking about file structure
- **Contains**: Directory structure, naming conventions, import patterns

### 7. `migration-workflow.mdc` (Manual)
- **Purpose**: Step-by-step migration workflow and priorities
- **Scope**: Applied when planning migration tasks
- **Contains**: Phase-by-phase migration guide, verification steps, common issues

## How to Use These Rules

1. **Automatic Application**: `project-structure.mdc` applies to all requests
2. **File-Type Specific**: TypeScript patterns apply automatically to `.ts/.tsx` files
3. **Directory Specific**: Storefront patterns apply to files in `storefront/` directory
4. **Manual Activation**: Use rule descriptions to manually apply specific rules when needed

## Key Reference Points

- **Working Implementation**: `medusa4/my-sticker-store/` and `medusa4/my-sticker-store-storefront/`
- **Target Structure**: `backend/src/` and `storefront/src/`
- **Implementation Plan**: `medusa4/STICKER_IMPLEMENTATION_PLAN.md`
- **Configuration**: `backend/medusa-config.js`

## Migration Strategy

The rules are designed to support a step-by-step migration approach:
1. Backend core functionality first
2. Workflows and API routes
3. Frontend integration
4. Testing implementation

Each rule provides specific guidance and references to working implementations to ensure consistent and successful migration. 