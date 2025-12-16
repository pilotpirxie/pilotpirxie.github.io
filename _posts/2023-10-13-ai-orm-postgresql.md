---
layout: post
title: "I built an AI ORM so you don't have to"
subtitle: "And why you shouldn't use it"
author: "pilotpirxie"
date: 2023-10-13T10:54:19.000Z
tags: ["webdev", "programming", "ai", "javascript"]
background: '/img/posts/how-i-created-ai-powered-orm-for-postgresql-mysql-and-sqlite-and-why-you-shouldnt-use-it-1a-cover.jpeg'
---
> tl;dr
> I created AI-powered ORM for Node with TypeScript or JavaScript called [ormgpt](https://www.npmjs.com/package/ormgpt). It works, it's silly and please don't use it.
> ```shell
> npm install ormgpt
> ```

### Cutting edge, blazing fast technology everywhere
In the last few years the number of new ORMs (object-relational mappers) and query builders has grown like crazy. A few years ago, the gold standard was either an ORM like Sequelize or a query builder like Knex. Since then we've got TypeORM, Bookshelf, Objection, Mikro-ORM, Prisma, Drizzle, Kysely and many, many more. While I agree that more options are good since anyone can choose the best-suited solution for their needs, it also creates many copy-alike libs.

At this point, I think ORMs have become the new JavaScript frameworks but for the backend.

Another hot topic, wider than just the JavaScript ecosystem, is AI. An entire group of algorithms to recognise patterns, predict output, and generate things. Now tech startups not only must store data in hot blockchain, NoSQL, or vector databases, but compute on edge using quantum technology. Must also be AI - artificially intelligent.  

<figure>
  <img src="/img/posts/how-i-created-ai-powered-orm-for-postgresql-mysql-and-sqlite-and-why-you-shouldnt-use-it-1a-1-cb4342.gif" alt="AI">
  <figcaption>Source Giphy</figcaption>
</figure>

### Afternoon idea
My idea was, what if I create a hot, new lib to access data like ORMs or query builders but using AI? So anyone can access data using plain language like:

```shell
give me 10 recent posts from the category travel and where the author is John Doe, with the author and comments info  
``` 
or even in other languages like German, for example
```shell
bitte legen Sie einen neuen Benutzer Hans Schmidt mit Wohnadresse München, Kaufingerstraße und Neuhauser Straße 1A an
```

so I messed around a little with the OpenAI API, calling it with prompts like
```ts
Prepare SQL query for ${prompt}
```
but that was too general. I then tried
```ts
Having database schema: 

${dbSchema}

Prepare SQL query for:

${prompt}
```
still, it often returned invalid queries or additional comments. So I made it even stricter by also passing the dialect, entire database schema, and asking it not to write any other response than a query.

```ts
You are an SQL engine brain. 
You are using ${this.dialect} dialect.
Having db schema as follows:
${this.dbSchema}

Write a query to fulfil the user request: ${request}

Don't write anything else than SQL query.
```

And that worked quite well. So the next step was to prepare methods to call OpenAI programmatically and adapters for database engines. 

The method for calling OpenAI was pretty simple and used built-in fetch:
```ts

  private async getResponse(request: string): Promise<string> {
    const prompt = `
      You are an SQL engine brain. 
      You are using ${this.dialect} dialect.
      Having db schema as follows:
      ${this.dbSchema}
                
      Write a query to fulfil the user request: ${request}
                
      Don't write anything else than SQL query.
    `;

    const response = await fetch(this.apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: this.model,
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        ...this.modelOptions,
      }),
    });

    const data = (await response.json()) as ErrorResponse | SuccessResponse;

    if (data.hasOwnProperty("error")) {
      throw new Error((data as ErrorResponse).error.message);
    }

    return (data as SuccessResponse).choices[0].message.content;
  }
```

I know OpenAI also has an SDK library, but I prefer simple calls instead of another dependency since it's hard to manage them in the long term. The API allows direct access to the resource; the SDK package would have to be updated separately and eventually could be abandoned.

<figure>
  <img src="/img/posts/how-i-created-ai-powered-orm-for-postgresql-mysql-and-sqlite-and-why-you-shouldnt-use-it-1a-2-679e98.gif" alt="pkg">
  <figcaption>Source Giphy</figcaption>
</figure>

For the database engine, I chose to support PostgreSQL, MySQL, and SQLite out of the box. They are the most popular and I had worked with all of them successfully before. The first was SQLite, which allowed me to experiment with different adapter interfaces. With such an interface, anyone can create their own adapter for other engines like Oracle, ClickHouse, or CouchDB. I decided to stick with the smallest possible set of methods in the interface, leaving other responsibilities, such as executing queries, to native clients:

```ts
export interface DatabaseEngineAdapter {
  executeQuery(query: string): Promise<any[]>;
}
```

Then I created silly adapters:
```ts
import { DatabaseEngineAdapter } from "./DatabaseEngineAdapter";
import betterSqlite3, { Statement } from "better-sqlite3";

export class SqliteAdapter implements DatabaseEngineAdapter {
  private db: betterSqlite3.Database;

  constructor({ dbFilePath }: { dbFilePath: string }) {
    this.db = new betterSqlite3(dbFilePath);
  }

  executeQuery(query: string): Promise<unknown[]> {
    return new Promise((resolve, reject) => {
      const statement: Statement = this.db.prepare(query);
      if (this.isSelectQuery(query)) {
        resolve(statement.all());
      } else {
        const info = statement.run();
        resolve([]);
      }
    });
  }

  private isSelectQuery(query: string): boolean {
    return query.trim().toLowerCase().startsWith("select");
  }
}
```

Now it's possible to run.

For example, for a request to an SQLite database with a simple schema of users, posts, comments, and likes:
```ts
  const sqliteAdapter = new SqliteAdapter({
    dbFilePath: "./db.sqlite",
  });

  const ormgpt = new ormGPT({
    apiKey: process.env.OPENAI_API_KEY || "",
    schemaFilePath: "./schema.sql",
    dialect: "postgres",
    dbEngineAdapter: sqliteAdapter,
  });

ormgpt.query("give me the post with id 1, all comments for this post, and user information about the author");
```

Generated query:
```sql
SELECT 
  p.id AS post_id, 
  p.title, 
  p.body, 
  c.id AS comment_id, 
  c.body AS comment_body, 
  u.username AS author_username, 
  u.email AS author_email 
FROM 
  posts p 
  JOIN comments c ON p.id = c.post_id 
  JOIN users u ON u.id = p.user_id 
WHERE 
  p.id = 1;
```

and the response after execution from the database:
```
[
  {
    post_id: 1,
    title: 'Hello world!',
    body: 'This is my first post!',
    comment_id: 1,
    comment_body: 'Hello world!',
    author_username: 'test',
    author_email: 'test@example.com'
  }
]
```

It's kind of hard to test such an app because it's non-deterministic. The only way I could think of was to test short, precise statements like "create x with y and z" and then check the database to see if it's there. 

<figure>
  <img src="/img/posts/how-i-created-ai-powered-orm-for-postgresql-mysql-and-sqlite-and-why-you-shouldnt-use-it-1a-3-2e262d.gif" alt="Db">
  <figcaption>Source Giphy</figcaption>
</figure>

### Conclusion
Here we come to the conclusion of why this library is useless for now. If you're looking for something more complex like joins, nested subqueries, or engine-related queries, with the current state of GPT it's not possible to get results you can rely on. However, at least you can minimise randomness by being very strict about the requirements in your statement and decreasing "temperature" as low as 0 for deterministic results!

Anyway, as an experimental project, I decided to finish it. So the final part was to allow fine-tuning of model parameters:
```ts
export type ModelTuning = {
  temperature: number;
  max_tokens: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
}
```  

and prepare PostgreSQL and MySQL adapters. The final part was to publish the library. The name ormGPT comes from ORM + GPT model but in fact it's neither an ORM nor a query builder. A proper ORM should "map" the database into objects. Then maybe it's an "intelligent" query builder? Also no. A query builder usually allows you to chain query objects before generating SQL. You can chain plain strings, but is that enough? Maybe it should be chatGPTtoQueryFacade.js? 

Too much thinking, not enough willingness. Published as ormGPT. 

That's it. Tiny afternoon project - you shouldn't use it in your production application. Or maybe you should? In the end, you can tell your clients you are using cutting-edge technologies and advanced AI.

You can find the lib on the NPM: [OrmGPT](https://www.npmjs.com/package/ormgpt)

or at the GitHub repository:

[View ormGPT on GitHub](https://github.com/pilotpirxie/ormGPT)

_This post was originally published on Dev.to_