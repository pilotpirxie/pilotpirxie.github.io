---
layout: post
title: "Building a Recommendation System: From Redis Hackathon to Production"
subtitle: "A complete journey through designing, implementing, and deploying a content-based recommendation engine using Redis and Node.js"
author: "pilotpirxie"
date: 2022-08-05T15:14:00.000Z
tags: ["webdev", "javascript", "node", "typescript", "redis", "algorithms", "recommendation-system", "hackathon"]
background: '/img/posts/writing-recommendation-system-0-2lhh-cover.png'
---

In one of the applications that I'm involved in during my spare time, a friend and I decided to add a recommendation section. With such a section, users who interact with one product will get recommendations for other similar products. I'd already read a little about this problem and it seemed far from trivial. Because I enjoy challenges, I decided to write my own simple recommendation engine.

To ensure I wouldn't abandon this project too soon, I decided to participate in the [Redis Hackathon](https://dev.to/devteam/announcing-the-redis-hackathon-on-dev-3248) - not for prizes or glory, but to have fun with limitations and perhaps collaborate with others through a post series.

My initial thoughts were to use Redis for the stream of user events and storage of products to match (eventually QuestDB, but hey, it's a Redis Hackathon!). For algorithms, I was still researching, but the easiest one to implement seemed to be the Jaccard index extended by weights on individual events.

## Business Objectives

The recommendation system I'm creating will be used in a product-based application, similar to e-commerce apps. It will be difficult to measure direct leads as it's integrated with various partners and websites, and this may vary from one to another. So recommendations will be calculated based on events with different weights.

For now, I'm thinking of something like: opening a product page +1 score, liking a product +2, commenting +2, viewing details +5, and so on. For each tag associated with the product, a composite key with the event will be created.

Back to high-level requirements: the number of products will be relatively low compared to full-featured e-commerce sites, with up to about 10,000 items. The cold start problem - when a user hasn't made any interactions before - will be solved by choosing products popular among the overall user audience.

User needs and tastes may change, so the composite of user-tag-event should expire. This can be done in Redis by setting TTL, or in a more general database by using a WHERE clause plus a maintenance worker or trigger for periodic cleanup.

## Architecture: Redis & Node.js

After defining the business requirements, I established the taxonomy for the architecture. The system consists of relationships between four entities:

* **Actor** - The decisive entity for whom we try to match recommendations. In most cases, this is a user or a group of users.
* **Item** - This entity represents what we try to match, e.g. a product in a store, an article on a blog, or a video on a streaming platform.
* **Event** - These are the actor's actions used to calculate recommendations. Each consists of a tag with a score (weight).
* **Recommendation** - The final result showing how closely matched a certain actor and item are.

### Redis Implementation

Having defined the domain entities, I experimented with many different Redis data structures to find suitable ones for storage. For actor data, the most useful initially seemed to be a HashSet with actorId as key, tag as field, and score as value. However, I wanted to add event expiration, which isn't easily possible with this structure. So instead, I decided to use basic String structures where the key contains all the information and the value is the score. Then I use SCAN with wildcards to retrieve data. Items have sets of unique tags, so the Set structure is perfect. Actors - just to indicate existence - are simple Strings with creation timestamps.

### Node.js Implementation

The Node.js part of the application is written using TypeScript and Express. The system consists of an app layer with the recommendation mechanism run by controllers. Redis is hidden behind a data access layer so it can be easily replaced with a different storage engine.

## How It Works

### Data Storage
* Actors are stored in Redis as simple `String` keys with creation date `timestamps` as values.
* Items are `Set` types with `tags` as members. An item may have multiple tags.
* Events are `String` types with `actorId:id:tag:timestamp:ttl` and an expire attribute set to ensure freshness of recommendations.

### Data Access
* **Get actor with events**
  * Check if actor exists with `EXISTS actor:${id}`
  * Get all user events with `SCAN ${cursor} MATCH actor:${id}*`
* **Delete actor**
  * Scan for each key related to actor `SCAN ${cursor} MATCH actor:${id}*`
  * Delete each key with `DEL ${key}`
* **Add actor**
  * Scan for existing keys `SCAN ${cursor} MATCH actor:${id}*`
  * Delete existing keys with `DEL ${key}`
  * Add new actor with `SET actor:${id} ${Date.now().toString()}`
* **Add event**
  * Check if actor exists (if flag set) using `EXISTS actor:${id}`
  * Add event with `SET actor:${id}:${tag}:${date}:${ttl} ${score}`
  * If TTL provided, set expiration with `EXPIRE actor:${id}:${tag}:${date}:${ttl} ${ttl}`
* **Get all items with tags**
  * Get all items with `SCAN ${cursor} MATCH item:*`
  * For each item, get tags with `SMEMBERS ${itemKey}`
* **Get single item with tags**
  * Get tags with `SMEMBERS item:${id}`
* **Delete item**
  * Delete with `DEL item:${id}`
* **Add item**
  * Check if exists `EXISTS item:${id}`
  * If exists, remove `DEL item:${id}`
  * Add with tags `SADD item:${id} ${tags}`

## The Algorithm

A single recommendation is the overlap between item tags and actor tag-event interactions.

For example, consider these items:
- *Titanic* has tags: drama, tragedy, history, action
- *Merlin* has tags: adventure, fantasy, history, wizards
- *Harry Potter* has tags: adventure, fantasy, action, wizards

An actor (user) has previously interacted with films:
- Liked a film with tags: action, fantasy
- Added to favourites a film with tags: action, fantasy
- Liked a film with tags: history, action, comedy
- Liked a film with tags: adventure, fantasy, dragons
- Liked a film with tags: wizards, history, action
- Added to favourites a film with tags: drama, wizards, fantasy

Each like has a weight of 1, each favourite has a weight of 3. The sum of overlaps (with or without duplication, with or without clamping to 1) divided by the maximum value per film gives us the overlap score. The higher the score, the stronger the recommendation.

To ensure tags remain relevant, they have an expiration time. As interests may change, old tags expire and are replaced with new ones. It's also worth noting that items with more keywords provide more precise suggestions.

## Final Results

The system uses tag scores and the Jaccard index for content-based filtering. It's event-driven with naive exploration of new tags, suitable for product and content recommendations. Fine-tuning of tag weights is possible, and the system is minimalist and lightweight, written in TypeScript and Node.js.

### Demo
Here's a demo of film recommendations with 10,000 videos:

[Watch the recommendation system demo on YouTube](https://www.youtube.com/watch?v=_m1BandnVsQ)

### Source Code
[View source code on GitHub](https://github.com/pilotpirxie/recommendation)

This was my Redis Hackathon journey. It was fun to participate and learn more about Redis's technical aspects. The hackathon helped me stay focused and complete another side project. What a wonderful event!

*Check out [Redis OM](https://redis.io/docs/stack/get-started/clients/#high-level-client-libraries), client libraries for working with Redis as a multi-model database.*
*Use [RedisInsight](https://redis.info/redisinsight) to visualise your data in Redis.*
*Sign up for a [free Redis database](https://redis.info/try-free-dev-to).*

_This post was originally published on Dev.to_