---
layout: post
title: "How to update a several-year-old outdated project in Node and React"
subtitle: "Navigating old Node.js dependencies can be confusing. In this article, I'll share how I decoded this..."
author: "Meat Boy"
date: 2023-08-24T08:40:06.000Z
tags: ["webdev", "javascript", "tutorial", "react"]
background: '/img/posts/how-to-update-a-few-years-old-outdated-project-in-node-and-react-31jm-cover.png'
---
Navigating old Node.js dependencies can be confusing. In this article, I'll share how I decoded this challenge in a several-year-old repository using a custom tool—and how you too can benefit from my experience.

> tl;dr
> Use the tool [dependency-time-machine](https://www.npmjs.com/package/dependency-time-machine) to quickly update dependencies one by one in chronological order. Most dependencies are compatible with other packages from a similar or past time period.
> This tool is intended to simulate the typical updating workflow as it was done regularly.
> ```
> npx dependency-time-machine --update
> ```

### Outdated codebase

![GTA SA](/img/posts/how-to-update-a-few-years-old-outdated-project-in-node-and-react-31jm-1-f0fe7a.gif)

I recently joined a new team with a great product but a highly outdated codebase. So my first task was to update dependencies and make changes so we could migrate from Node 16 to Node 18 and finally to Node 20. Some parts of the code were still relying on Node 14. The initial thought was to use ``ncu`` or ``yarn upgrade-interactive`` and update all patch versions since they shouldn't break anything if package developers were following semantic versioning. But they didn't.

### Dependency void
Many dependencies were not only "old" - this is not the problem, but they were incompatible with new Node versions and other dependencies whose features we needed. At the time of doing this process, Node 16 had become deprecated and Node 18 was going into maintenance. Having such an old codebase makes it hard to develop it further and the backend part makes it also insecure and vulnerable.

Dependency management is not only about blindly updating, but also about knowing when it's beneficial to use or drop a package and having common sense about long-term tech debt.
Sometimes, newer versions of a dependency can introduce breaking changes, reduced performance, or other issues. Before updating, developers should check changelogs, understand the implications of the update, and, ideally, test the update in a controlled environment before deploying it.

Over time, some dependencies might become redundant, or better alternatives might emerge. A good practice is to periodically review the project's dependencies to determine if they are still aligned with the project's needs. Additionally, if a package is no longer maintained or has known vulnerabilities, it might be wise to seek alternatives or drop it altogether.

Over-reliance on multiple dependencies can lead to technical debt. If not managed properly, this debt can accumulate, making future changes or updates cumbersome and risky. It's essential to strike a balance between leveraging existing solutions (dependencies) and the potential long-term costs associated with them.

![Image description](/img/posts/how-to-update-a-few-years-old-outdated-project-in-node-and-react-31jm-2-03b071.png)

Going back to the case. Thankfully the team had written plenty of good tests, both unit tests, some integration and a lot of end-to-end so after each update it was possible to check if something broke. At this point, I realized I had to go one-by-one through dependencies and look at which would be compatible with others and the SDK. 

Some packages had phantom dependencies. These are indirect dependencies (but also not peerDependencies) and it is expected to have them installed and be available in certain directories. npm since v3 and yarn classic install dependencies in the flat structure of node_modules with nesting only sub-dependencies so the issue with phantom dependencies is hidden until changes in the package structure. pnpm - another package manager installs dependencies in a hidden directory and uses symlinks to make them available at node_modules levels. Also, it hides all sub-dependencies which breaks phantom dependencies early, leaving clean node_modules (IMO, that's good).

![npm v2 vs v3](/img/posts/how-to-update-a-few-years-old-outdated-project-in-node-and-react-31jm-3-2959a6.png)

Other problems were changes in Node SDK from 16 to 18. In the meantime, Node 17 introduced changes in the OpenSSL provider which broke older webpack and DNS resolve mechanisms from "by-default-ipv4" to "by-default-ipv6" which broke usage of some backend and testing libraries.

### dependency-time-machine

To manage all this headache I wrote in my spare time a library called [dependency-time-machine](https://www.npmjs.com/package/dependency-time-machine) which retrieves information about every package listed in package.json and its version. Then it creates a single timeline which is used to determine which library is the most behind and should be updated next.

I found libraries written at certain moments are compatible with other libraries at similar or previous time periods. So, for instance, library ``a@2.5.1`` that came when library ``b@1.3.0`` was already available makes it higher chance compatible than with the same library but with a higher version e.g. ``b@1.3.2`` that was released a year later than ``a@2.5.1``.

```
npx dependency-time-machine --timeline
```

Moreover, this replicates the natural process of updating dependencies. When you do this regularly you match existing libs with other existing libraries. So, the main problem that  ``dependency-time-machine`` tries to solve is to reconstruct the process of natural updating.

And because it may be a lot of work, like in my case where I had to take care of over 200 packages (!) so to ease this process I put into the tool an ``auto mode`` which can find the next dependency to update before another dependency was released, install it and run tests. If tests pass, it will do the same over and over. If the tests fail it will stop so you can look closer and fix either codebase or test.

```
npx dependency-time-machine --update --install --auto --install-script "yarn install" --test-script "yarn test"
```

Also, if you don't want to rely on auto-mode you can print the timeline in JSON and make decisions manually of updating dependencies. Other options allow you to exclude dependencies you don't want to update for some reason.

Going back to the story. It still took some time but at least I was more certain about the process and had a linear plan of work. After all, I wrote a document to describe the process so other team members knew what's going on with the repository and we discussed the process. Deployment went smoothly with only a few minor issues in the meantime because most of the problems were spotted early thanks to the willing help from team members.

Dependency management can be painful, but done regularly and with patience makes our future work easier. I hope someone finds this article and tool useful :)
