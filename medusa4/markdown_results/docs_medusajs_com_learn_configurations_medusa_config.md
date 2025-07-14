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

# 6.2. Medusa Application Configuration

In this chapter, you'll learn available configurations in the Medusa application. You can change the application's configurations to customize the behavior of the application, its integrated modules and plugins, and more.

## Configuration File[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#configuration-file)

All configurations of the Medusa application are stored in the `medusa.config.ts` file. The file exports an object created using the `defineConfig` utility. For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa.config.ts

1import { loadEnv, defineConfig } from "@medusajs/framework/utils"2
3loadEnv(process.env.NODE_ENV || "development", process.cwd())4
5module.exports = defineConfig({6  projectConfig: {7    databaseUrl: process.env.DATABASE_URL,8    http: {9      storeCors: process.env.STORE_CORS!,10      adminCors: process.env.ADMIN_CORS!,11      authCors: process.env.AUTH_CORS!,12      jwtSecret: process.env.JWT_SECRET || "supersecret",13      cookieSecret: process.env.COOKIE_SECRET || "supersecret",14    },15  },16})
```

The `defineConfig` utility accepts an object having the following properties:

- [projectConfig](https://docs.medusajs.com/learn/configurations/medusa-config#project-configurations-projectConfig): Essential configurations related to the Medusa application, such as database and CORS configurations.
- [admin](https://docs.medusajs.com/learn/configurations/medusa-config#admin-configurations-admin): Configurations related to the Medusa Admin.
- [modules](https://docs.medusajs.com/learn/configurations/medusa-config#module-configurations-modules): Configurations related to registered modules.
- [plugins](https://docs.medusajs.com/learn/configurations/medusa-config#plugin-configurations-plugins): Configurations related to registered plugins.
- [featureFlags](https://docs.medusajs.com/learn/configurations/medusa-config#feature-flags-featureFlags): Configurations to manage enabled beta features in the Medusa application.

### Using Environment Variables[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#using-environment-variables)

Notice that you use the `loadEnv` utility to load environment variables. Learn more about it in the [Environment Variables chapter](https://docs.medusajs.com/learn/fundamentals/environment-variables).

By using this utility, you can use environment variables as the values of your configurations. It's highly recommended that you use environment variables for secret values, such as API keys and database credentials, or for values that change based on the environment, such as the application's Cross Origin Resource Sharing (CORS) configurations.

For example, you can set the `DATABASE_URL` environment variable in your `.env` file:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯DATABASE_URL=postgres://postgres@localhost/medusa-store
```

Then, use the value in `medusa-config.ts`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    databaseUrl: process.env.DATABASE_URL,4    // ...5  },6  // ...7})
```

* * *

## Project Configurations (`projectConfig`)[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#project-configurations-projectconfig)

The `projectConfig` object contains essential configurations related to the Medusa application, such as database and CORS configurations.

### databaseDriverOptions[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#databasedriveroptions)

The `projectConfig.databaseDriverOptions` configuration is an object of additional options used to configure the PostgreSQL connection. For example, you can support TLS/SSL connection using this configuration's `ssl` property.

This configuration is useful for production databases, which can be supported by setting the `rejectUnauthorized` attribute of `ssl` object to `false`. During development, it's recommended not to pass the `ssl.rejectUnauthorized` option.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    databaseDriverOptions: process.env.NODE_ENV !== "development" ?4      { connection: { ssl: { rejectUnauthorized: false } } } : {},5    // ...6  },7  // ...8})
```

Tip: When you disable `rejectUnauthorized`, make sure to also add `?ssl_mode=disable` to the end of the [databaseUrl](https://docs.medusajs.com/learn/configurations/medusa-config#databaseUrl) as well.

#### Properties

`connection`object

An object of connection options.

`ssl`object \| boolean

Either a boolean indicating whether to use SSL or an object of SSL options. You can find the full list of options in the [Node.js documentation](https://nodejs.org/docs/latest-v20.x/api/tls.html#tlsconnectoptions-callback).

Default: `false`

`pool`object

An object of options initialized by the underlying [knex](https://knexjs.org/guide/#pool) client.

`idle_in_transaction_session_timeout`number

The maximum time, in milliseconds, that a session can be idle before being terminated.

Default: `60000`

### databaseLogging[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#databaselogging)

The `projectConfig.databaseLogging` configuration specifies whether database messages should be logged to the console. It is `false` by default.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    databaseLogging: true,4    // ...5  },6  // ...7})
```

### databaseName[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#databasename)

The `projectConfig.databaseName` configuration determines the name of the database to connect to. If the name is specified in the [databaseUrl](https://docs.medusajs.com/learn/configurations/medusa-config#databaseUrl) configuration, you don't have to use this configuration.

Tip: After setting the database credentials, you can create and setup the database using the [db:setup](https://docs.medusajs.com/resources/medusa-cli/commands/db#dbsetup) command of the Medusa CLI.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    databaseName: process.env.DATABASE_NAME ||4      "medusa-store",5    // ...6  },7  // ...8})
```

### databaseSchema[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#databaseschema)

The `projectConfig.databaseSchema` configuration specifies the PostgreSQL database schema to connect to, which is `public` by default. Use this configuration only if you want to connect to a different schema.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    databaseSchema: process.env.DATABASE_SCHEMA ||4      "custom",5    // ...6  },7  // ...8})
```

### databaseUrl[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#databaseurl)

The `projectConfig.databaseUrl` configuration specifies the PostgreSQL connection URL of the database to connect to. Its format is:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯postgres://[user][:password]@[host][:port]/[dbname]
```

Where:

- `[user]`: (required) your PostgreSQL username. If not specified, the system's username is used by default. The database user that you use must have create privileges. If you're using the `postgres` superuser, then it should have these privileges by default. Otherwise, make sure to grant your user create privileges. You can learn how to do that in [PostgreSQL's documentation](https://www.postgresql.org/docs/current/ddl-priv.html).
- `[:password]`: an optional password for the user. When provided, make sure to put `:` before the password.
- `[host]`: (required) your PostgreSQL host. When run locally, it should be `localhost`.
- `[:port]`: an optional port that the PostgreSQL server is listening on. By default, it's `5432`. When provided, make sure to put `:` before the port.
- `[dbname]`: the name of the database. If not set, then you must provide the database name in the [databaseName](https://docs.medusajs.com/learn/configurations/medusa-config#databasename) configuration.

You can learn more about the connection URL format in [PostgreSQL’s documentation](https://www.postgresql.org/docs/current/libpq-connect.html).

Tip: After setting the database URL, you can create and setup the database using the [db:setup](https://docs.medusajs.com/resources/medusa-cli/commands/db#dbsetup) command of the Medusa CLI.

#### Example

For example, set the following database URL in your environment variables:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯DATABASE_URL=postgres://postgres@localhost/medusa-store
```

Then, use the value in `medusa-config.ts`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    databaseUrl: process.env.DATABASE_URL,4    // ...5  },6  // ...7})
```

### http[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#http)

The `http` configures the application's http-specific settings, such as the JWT secret, CORS configurations, and more.

#### http.jwtSecret

The `projectConfig.http.jwtSecret` configuration is a random string used to create authentication tokens in the HTTP layer. This configuration is not required in development, but must be set in production.

In a development environment, if this option is not set the default value is `supersecret`. However, in production, if this configuration is not set, an error is thrown and the application crashes. This is to ensure that you set a secure value for the JWT secret in production.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      jwtSecret: process.env.JWT_SECRET || "supersecret",5    },6    // ...7  },8  // ...9})
```

#### http.jwtExpiresIn

The `projectConfig.http.jwtExpiresIn` configuration specifies the expiration time for the JWT token. Its value format is based off the [ms package](https://github.com/vercel/ms).

If not provided, the default value is `1d`.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      jwtExpiresIn: process.env.JWT_EXPIRES_IN || "2d",5    },6    // ...7  },8  // ...9})
```

#### http.cookieSecret

The `projectConfig.http.cookieSecret` configuration is a random string used to sign cookies in the HTTP layer. This configuration is not required in development, but must be set in production.

In a development environment, if this option is not set the default value is `supersecret`. However, in production, if this configuration is not set, an error is thrown and the application crashes. This is to ensure that you set a secure value for the cookie secret in production.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      cookieSecret: process.env.COOKIE_SECRET || "supersecret",5    },6    // ...7  },8  // ...9})
```

#### http.authCors

The `projectConfig.http.authCors` configuration specifies the accepted URLs or patterns for API routes starting with `/auth`. It can either be one accepted origin, or a comma-separated list of accepted origins.

Every origin in that list must either be:

- A full URL. For example, `http://localhost:7001`. The URL must not end with a backslash;
- Or a regular expression pattern that can match more than one origin. For example, `.example.com`. The regex pattern that Medusa tests for is `^([\/~@;%#'])(.*?)\1([gimsuy]*)$`.

Since the `/auth` routes are used for authentication for both store and admin routes, it's recommended to set this configuration's value to a combination of the [storeCors](https://docs.medusajs.com/learn/configurations/medusa-config#httpstoreCors) and [adminCors](https://docs.medusajs.com/learn/configurations/medusa-config#httpadminCors) configurations.

Some example values of common use cases:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯# Allow different ports locally starting with 700❯AUTH_CORS=/http:\/\/localhost:700\d+$/❯
❯# Allow any origin ending with vercel.app. For example, admin.vercel.app❯AUTH_CORS=/vercel\.app$/❯
❯# Allow all HTTP requests❯AUTH_CORS=/http:\/\/.+/
```

Then, set the configuration in `medusa-config.ts`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      authCors: process.env.AUTH_CORS,5    },6    // ...7  },8  // ...9})
```

If you’re adding the value directly within `medusa-config.ts`, make sure to add an extra escaping `/` for every backslash in the pattern. For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      authCors: "/http:\\/\\/localhost:700\\d+$/",5    },6    // ...7  },8  // ...9})
```

#### http.storeCors

The `projectConfig.http.storeCors` configuration specifies the accepted URLs or patterns for API routes starting with `/store`. It can either be one accepted origin, or a comma-separated list of accepted origins.

Every origin in that list must either be:

- A full URL. For example, `http://localhost:7001`. The URL must not end with a backslash;
- Or a regular expression pattern that can match more than one origin. For example, `.example.com`. The regex pattern that Medusa tests for is `^([\/~@;%#'])(.*?)\1([gimsuy]*)$`.

Some example values of common use cases:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯# Allow different ports locally starting with 800❯STORE_CORS=/http:\/\/localhost:800\d+$/❯
❯# Allow any origin ending with vercel.app. For example, storefront.vercel.app❯STORE_CORS=/vercel\.app$/❯
❯# Allow all HTTP requests❯STORE_CORS=/http:\/\/.+/
```

Then, set the configuration in `medusa-config.ts`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      storeCors: process.env.STORE_CORS,5    },6    // ...7  },8  // ...9})
```

If you’re adding the value directly within `medusa-config.ts`, make sure to add an extra escaping `/` for every backslash in the pattern. For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      storeCors: "/vercel\\.app$/",5    },6    // ...7  },8  // ...9})
```

#### http.adminCors

The `projectConfig.http.adminCors` configuration specifies the accepted URLs or patterns for API routes starting with `/admin`. It can either be one accepted origin, or a comma-separated list of accepted origins.

Every origin in that list must either be:

- A full URL. For example, `http://localhost:7001`. The URL must not end with a backslash;
- Or a regular expression pattern that can match more than one origin. For example, `.example.com`. The regex pattern that Medusa tests for is `^([\/~@;%#'])(.*?)\1([gimsuy]*)$`.

Some example values of common use cases:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯# Allow different ports locally starting with 700❯ADMIN_CORS=/http:\/\/localhost:700\d+$/❯
❯# Allow any origin ending with vercel.app. For example, admin.vercel.app❯ADMIN_CORS=/vercel\.app$/❯
❯# Allow all HTTP requests❯ADMIN_CORS=/http:\/\/.+/
```

Then, set the configuration in `medusa-config.ts`:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      adminCors: process.env.ADMIN_CORS,5    },6    // ...7  },8  // ...9})
```

If you’re adding the value directly within `medusa-config.ts`, make sure to add an extra escaping `/` for every backslash in the pattern. For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      adminCors: "/vercel\\.app$/",5    },6    // ...7  },8  // ...9})
```

#### http.compression

The `projectConfig.http.compression` configuration modifies the HTTP compression settings at the application layer. If you have access to the HTTP server, the recommended approach would be to enable it there. However, some platforms don't offer access to the HTTP layer and in those cases, this is a good alternative.

If you enable HTTP compression and you want to disable it for specific API Routes, you can pass in the request header `"x-no-compression": true`. Learn more in the [API Reference](https://docs.medusajs.com/api/store#http-compression).

For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      compression: {5        enabled: true,6        level: 6,7        memLevel: 8,8        threshold: 1024,9      },10    },11    // ...12  },13  // ...14})
```

This configuation is an object that accepts the following properties:

`enabled`boolean

Whether to enable HTTP compression.

Default: `false`

`level`number

The level of zlib compression to apply to responses. A higher level will result in better compression but will take longer to complete. A lower level will result in less compression but will be much faster.

Default: `6`

`memLevel`number

How much memory should be allocated to the internal compression state. It value is between `1` (minimum level) and `9` (maximum level).

Default: `8`

`threshold`number \| string

The minimum response body size that compression is applied on. Its value can be the number of bytes or any string accepted by the [bytes](https://www.npmjs.com/package/bytes) package.

Default: `1024`

#### http.authMethodsPerActor

The `projectConfig.http.authMethodsPerActor` configuration specifies the supported authentication providers per actor type (such as `user`, `customer`, or any custom actor).

For example, you can allow Google login for `customers`, and allow email/password logins for `users` in the admin.

`authMethodsPerActor` is a an object whose key is the actor type (for example, `user`), and the value is an array of supported auth provider IDs (for example, `emailpass`).

Note: Learn more about actor types in the [Auth Identity and Actor Type documentation](https://docs.medusajs.com/resources/commerce-modules/auth/auth-identity-and-actor-types).

For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      authMethodsPerActor: {5        user: ["emailpass"],6        customer: ["emailpass", "google"],7      },8    },9    // ...10  },11  // ...12})
```

The above configurations allow admin users to login using email/password, and customers to login using email/password and Google.

#### http.restrictedFields

The `projectConfig.http.restrictedFields` configuration specifies the fields that can't be selected in API routes (using the `fields` query parameter) unless they're allowed in the [request's Query configurations](https://docs.medusajs.com/learn/fundamentals/module-links/query#request-query-configurations). This is useful to restrict sensitive fields from being exposed in the API.

For example, you can restrict selecting customers in store API routes:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    http: {4      restrictedFields: {5        store: ["customer", "customers"],6      },7    },8    // ...9  },10  // ...11})
```

The `restrictedFields` configuration accepts the following properties:

`store`string\[\]

An array of fields that can't be selected in store API routes.

Default: `["order", "orders"]`

### redisOptions[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#redisoptions)

The `projectConfig.redisOptions` configuration defines options to pass to `ioredis`, which creates the Redis connection used to store the Medusa server session. Refer to [ioredis’s RedisOptions documentation](https://redis.github.io/ioredis/index.html#RedisOptions)
for the list of available options.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    redisOptions: {4      connectionName: process.env.REDIS_CONNECTION_NAME ||5        "medusa",6    },7    // ...8  },9  // ...10})
```

### redisPrefix[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#redisprefix)

The `projectConfig.redisPrefix` configuration defines a prefix on all keys stored in Redis for the Medusa server session. The default value is `sess:`.

The value of this configuration is prepended to `sess:`. For example, if you set it to `medusa:`, then a key stored in Redis is prefixed by `medusa:sess`.

Note: This configuration is not used for modules that also connect to Redis, such as the [Redis Cache Module](https://docs.medusajs.com/resources/architectural-modules/cache/redis).

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    redisPrefix: process.env.REDIS_URL || "medusa:",4    // ...5  },6  // ...7})
```

### redisUrl[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#redisurl)

The `projectConfig.redisUrl` configuration specifies the connection URL to Redis to store the Medusa server session. When specified, the Medusa server uses Redis to store the session data. Otherwie, the session data is stored in-memory.

This configuration is not used for modules that also connect to Redis, such as the [Redis Cache Module](https://docs.medusajs.com/resources/architectural-modules/cache/redis). You'll have to configure the Redis connection for those modules separately.

Note: You must first have Redis installed. You can refer to [Redis's installation guide](https://redis.io/docs/getting-started/installation/).

The Redis connection URL has the following format:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯redis[s]://[[username][:password]@][host][:port][/db-number]
```

Where:

- `redis[s]`: the protocol used to connect to Redis. Use `rediss` for a secure connection.
- `[[username][:password]@]`: an optional username and password for the Redis server.
- `[host]`: the host of the Redis server. When run locally, it should be `localhost`.
- `[:port]`: an optional port that the Redis server is listening on. By default, it's `6379`.
- `[/db-number]`: an optional database number to connect to. By default, it's `0`.

For a local Redis installation, the connection URL should be `redis://localhost:6379` unless you’ve made any changes to the Redis configuration during installation.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    redisUrl: process.env.REDIS_URL ||4      "redis://localhost:6379",5    // ...6  },7  // ...8})
```

### sessionOptions[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#sessionoptions)

The `projectConfig.sessionOptions` configuration defines additional options to pass to [express-session](https://www.npmjs.com/package/express-session), which is used to store the Medusa server session.

Note: This configuration is not used for modules that also connect to Redis, such as the [Redis Cache Module](https://docs.medusajs.com/resources/architectural-modules/cache/redis).

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    sessionOptions: {4      name: process.env.SESSION_NAME || "custom",5    },6    // ...7  },8  // ...9})
```

#### Properties

`name`string

The name of the session ID cookie to set in the response (and read from in the request). Refer to [express-session’s documentation](https://www.npmjs.com/package/express-session#name) for more details.

Default: `` `connect.sid` ``

`resave`boolean

Whether the session should be saved back to the session store, even if the session was never modified during the request. Refer to [express-session’s documentation](https://www.npmjs.com/package/express-session#resave) for more details.

Default: `true`

`rolling`boolean

Whether the session identifier cookie should be force-set on every response. Refer to [express-session’s documentation](https://www.npmjs.com/package/express-session#rolling) for more details.

Default: `false`

`saveUninitialized`boolean

Whether to save sessions that are new but not modified. Refer to [express-session’s documentation](https://www.npmjs.com/package/express-session#saveUninitialized) for more details.

Default: `true`

`secret`string

The secret to sign the session ID cookie. By default, the value of [http.cookieSecret](https://docs.medusajs.com/learn/configurations/medusa-config#httpcookieSecret) is used. Refer to [express-session’s documentation](https://www.npmjs.com/package/express-session#secret) for details.

`ttl`number

The time-to-live (TTL) of the session ID cookie in milliseconds. It is used when calculating the `Expires``Set-Cookie` attribute of cookies. Refer to [express-session’s documentation](https://www.npmjs.com/package/express-session#cookie) for more details.

Default: `36000000`

### workerMode[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#workermode)

The `projectConfig.workerMode` configuration specifies the worker mode of the Medusa application. You can learn more about it in the [Worker Mode chapter](https://docs.medusajs.com/learn/production/worker-mode).

The value for this configuration can be one of the following:

- `shared`: run the application in a single process, meaning the worker and server run in the same process.
- `worker`: run the a worker process only.
- `server`: run the application server only.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  projectConfig: {3    workerMode: process.env.WORKER_MODE || "shared",4    // ...5  },6  // ...7})
```

* * *

## Admin Configurations (`admin`)[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#admin-configurations-admin)

The `admin` object contains configurations related to the Medusa Admin.

### backendUrl[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#backendurl)

The `admin.backendUrl` configuration specifies the URL of the Medusa application. Its default value is the browser origin. This is useful to set when running the admin on a separate domain.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  admin: {3    backendUrl: process.env.MEDUSA_BACKEND_URL ||4      "http://localhost:9000",5  },6  // ...7})
```

### disable[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#disable)

The `admin.disable` configuration specifies whether to disable the Medusa Admin. If disabled, the Medusa Admin will not be compiled and you can't access it at `/app` path of your application. The default value is `false`.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  admin: {3    disable: process.env.ADMIN_DISABLED === "true" ||4      false,5  },6  // ...7})
```

### path[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#path)

The `admin.path` configuration indicates the path to the admin dashboard, which is `/app` by default. The value must start with `/` and can't end with a `/`.

The value cannot be one of the reserved paths:

- `/admin`
- `/store`
- `/auth`
- `/`

Note: When using Docker, make sure that the root path of the Docker image isn't the same as the admin's path. For example, if the Docker image's root path is `/app`, change
the value of the `admin.path` configuration, since it's `/app` by default.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  admin: {3    path: process.env.ADMIN_PATH || `/app`,4  },5  // ...6})
```

### storefrontUrl[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#storefronturl)

The `admin.storefrontUrl` configuration specifies the URL of the Medusa storefront application. This URL is used as a prefix to some links in the admin that require performing actions in the storefront.

For example, this URL is used as a prefix to shareable payment links for orders with outstanding amounts.

#### Example

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.js

1module.exports = defineConfig({2  admin: {3    storefrontUrl: process.env.MEDUSA_STOREFRONT_URL ||4      "http://localhost:8000",5  },6  // ...7})
```

### vite[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#vite)

The `admin.vite` configration specifies Vite configurations for the Medusa Admin. Its value is a function that receives the default Vite configuration and returns the modified configuration. The default value is `undefined`.

Learn about configurations you can pass to Vite in [Vite's documentation](https://vite.dev/config/).

#### Example

For example, if you're using a third-party library that isn't ESM-compatible, add it to Vite's `optimizeDeps` configuration:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  admin: {3    vite: () => {4      return {5        optimizeDeps: {6          include: ["qs"],7        },8      }9    },10  },11  // ...12})
```

* * *

## Module Configurations (`modules`)[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#module-configurations-modules)

The `modules` configuration allows you to register and configure the [modules](https://docs.medusajs.com/learn/fundamentals/modules) registered in the Medusa application. Medusa's commerce and architectural modules are configured by default. So, you only need to pass your custom modules, or override the default configurations of the existing modules.

`modules` is an array of objects for the modules to register. Each object has the following properties:

1. `resolve`: a string indicating the path to the module, or the module's NPM package name. For example, `./src/modules/my-module`.
2. `options`: (optional) an object indicating the [options to pass to the module](https://docs.medusajs.com/learn/fundamentals/modules/options). This object is specific to the module and its configurations. For example, your module may require an API key option, which you can pass in this object.

Note: For modules that are part of a plugin, learn about registering them in the [Register Modules in Plugins](https://docs.medusajs.com/learn/configurations/medusa-config#register-modules-in-plugins) section.

### Example[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#example-18)

To register a custom module:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  modules: [3    {4      resolve: "./src/modules/cms",5      options: {6        apiKey: process.env.CMS_API_KEY,7      },8    },9  ],10  // ...11})
```

You can also override the default configurations of Medusa's modules. For example, to add a Notification Module Provider to the Notification Module:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  modules: [3    {4      resolve: "@medusajs/medusa/notification",5      options: {6        providers: [7          // default provider8          {9            resolve: "@medusajs/medusa/notification-local",10            id: "local",11            options: {12              name: "Local Notification Provider",13              channels: ["feed"],14            },15          },16          // custom provider17          {18            resolve: "./src/modules/my-notification",19            id: "my-notification",20            options: {21              channels: ["email"],22              // provider options...23            },24          },25        ],26      },27    },28  ],29  // ...30})
```

* * *

## Plugin Configurations (`plugins`)[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#plugin-configurations-plugins)

The `plugins` configuration allows you to register and configure the [plugins](https://docs.medusajs.com/learn/fundamentals/plugins) registered in the Medusa application. Plugins include re-usable Medusa customizations, such as modules, workflows, API routes, and more.

Aside from installing the plugin with NPM, you must also register it in the `medusa.config.ts` file.

The `plugins` configuration is an array of objects for the plugins to register. Each object has the following properties:

- A string, which is the name of the plugin's package as specified in the plugin's `package.json` file. This is useful if the plugin doesn't require any options.
- An object having the following properties:

- `resolve`: The name of the plugin's package as specified in the plugin's `package.json` file.
- `options`: An object that includes [options to be passed to the modules](https://docs.medusajs.com/learn/fundamentals/modules/options#pass-options-to-a-module-in-a-plugin) within the plugin.

### Example[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#example-19)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = {2  plugins: [3    `medusa-my-plugin-1`,4    {5      resolve: `medusa-my-plugin`,6      options: {7        apiKey: process.env.MY_API_KEY ||8          `test`,9      },10    },11    // ...12  ],13  // ...14}
```

The above configuration registers two plugins: `medusa-my-plugin-1` and `medusa-my-plugin`. The latter plugin requires an API key option, which is passed in the `options` object.

### Register Modules in Plugins[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#register-modules-in-plugins)

When you register a plugin, its modules are automatically registered in the Medusa application. You don't have to register them manually in the `modules` configuration.

However, this isn't the case for module providers. If your plugin includes a module provider, you must register it in the `modules` configuration, referencing the module provider's path.

For example:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = {2  plugins: [3    `medusa-my-plugin`,4  ],5  modules: [6    {7      resolve: "@medusajs/medusa/notification",8      options: {9        providers: [10          // ...11          {12            resolve: "medusa-my-plugin/providers/my-notification",13            id: "my-notification",14            options: {15              channels: ["email"],16              // provider options...17            },18          },19        ],20      },21    },22  ],23  // ...24}
```

* * *

## Feature Flags (`featureFlags`)[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#feature-flags-featureflags)

The `featureFlags` configuration allows you to manage enabled beta features in the Medusa application.

Some features in the Medusa application are guarded by a feature flag. This ensures constant shipping of new features while maintaining the engine’s stability. You can enable or disable these features using the `featureFlags` configuration.

The `featureFlags`'s value is an object whose keys are the names of the feature flags, and their values a boolean indicating whether the feature flag is enabled.

Warning: Only enable feature flags in testing or development environments. Enabling a feature flag may introduce breaking changes or unexpected behavior.

You can find available feature flags and their key name [here](https://github.com/medusajs/medusa/tree/develop/packages/medusa/src/loaders/feature-flags).

### Example[\#](https://docs.medusajs.com/learn/configurations/medusa-config\#example-20)

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

medusa-config.ts

1module.exports = defineConfig({2  featureFlags: {3    index_engine: true,4    // ...5  },6  // ...7})
```

After enabling a feature flag, make sure to run migrations, as the feature may introduce database changes:

```text-code-body font-monospace table min-w-full print:whitespace-pre-wrap py-docs_0.75

Terminal

❯npx medusa db:migrate
```

Was this chapter helpful?

It was helpfulIt wasn't helpfulReport Issue

Environment Variables

Type Aliases

Edited Mar 11· [Edit this page](https://github.com/medusajs/medusa/edit/develop/www/apps/book/app/learn/configurations/medusa-config/page.mdx)

- Configuration File
  - Using Environment Variables
- Project Configurations (projectConfig)
  - databaseDriverOptions
  - databaseLogging
  - databaseName
  - databaseSchema
  - databaseUrl
  - http
  - redisOptions
  - redisPrefix
  - redisUrl
  - sessionOptions
  - workerMode
- Admin Configurations (admin)
  - backendUrl
  - disable
  - path
  - storefrontUrl
  - vite
- Module Configurations (modules)
  - Example
- Plugin Configurations (plugins)
  - Example
  - Register Modules in Plugins
- Feature Flags (featureFlags)
  - Example

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

[iframe](https://www.google.com/recaptcha/enterprise/anchor?ar=1&k=6Lck4YwlAAAAAEIE1hR--varWp0qu9F-8-emQn2v&co=aHR0cHM6Ly9kb2NzLm1lZHVzYWpzLmNvbTo0NDM.&hl=en&v=hbAq-YhJxOnlU-7cpgBoAJHb&size=invisible&cb=1uxcvs9nosxz)