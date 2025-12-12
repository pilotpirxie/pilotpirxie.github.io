---
layout: post
title: "One Month of Learning Full-Text Search Algorithms - Building a Web Search Library with Prefix Trees"
subtitle: "Most developers have side projects. And I have my own too. About one month ago I started..."
author: "pilotpirxie"
date: 2019-11-28T16:37:11.000Z
tags: ["algorithms", "csharp", "career", "githunt"]
---
Most developers have side projects. And I have my own too. About one month ago, I started writing a full-text-search library to learn C# and algorithms a little better. Today I know there's still a lot of work and learning ahead of me. However, I have some thoughts and in this short article, I'll do my best to share them with you.

![Prefix Tree](/img/posts/one-month-of-learning-full-text-search-algorithms-building-web-search-lib-with-prefix-trees-5gjd-1-99b6a9.png)
via Wikipedia

tl;dr
* I created the Coresearch library + in-memory command-line tool for efficient matching of content with its resource at large scale https://github.com/pilotpirxie/coresearch ⭐🐙
* Database engines commonly use inverted indexes to speed up queries.
* Prefix Tree is one of the structures used in this approach. It splits information into fixed-length common parts and stores them in the nodes.
* Radix Tree is an optimised version of Prefix Tree, where unused nodes without data (resources) are compressed together, which means fewer nodes handle more information.
* PATRICIA Tree is a binary (radix equals 2) version of the Radix Tree with two children in each node.
* You can use logical connectives on search results to find diffs, sums, etc.

![Result 1](https://camo.githubusercontent.com/9e392edb88dd3ca462db8486347c5d789c9feda2/68747470733a2f2f692e696d6775722e636f6d2f77334253496b6d2e676966)


![Result 2](https://camo.githubusercontent.com/2290e3fe180c2223abff340a177c88b2591211f1/68747470733a2f2f692e696d6775722e636f6d2f4b7465504e586f2e676966)

# Project
Working on this project, I started by writing down on paper what the purpose of the program was and what features it should have. Because at work senior engineers were excited about Solr and ElasticSearch, I decided to learn a little more about how they work, which algorithms they use, and learn .NET Core as well (day-to-day I'm a JS and React developer).

My design notes assumed I would create a library and an application for searching to find which resources (TXT, JSON, CSV, YAML, etc.) contain words picked by the user. Moreover, it should have the option to search resources even if the user types just part of the word, as in real-world search engines.

# MVP?
My first approach was to create a class with some simple 
```word -> resource``` map using the _inverted index_ pattern. To accomplish that, I used a Dictionary with a string as the key and a HashSet of strings as the value to avoid duplicate resources. However, as you may expect, it took an extremely large amount of memory to store all that information, even though the Dictionary in C# is similar to a HashMap. For four words like:
```
alan -> a
ala -> b
alice -> c
alek -> d
```
it creates 4 entries. Exact search in the dictionary is very fast. Simply compute a hash of the key and check the value. But I decided to add functionality for a wildcard search, and this is the moment when the real fun starts.
With a dictionary, to find every value under keys like "al*", the program must follow each entry one by one and match the key with the pattern. With 4 entries, that is not a problem. Even after scaling up to hundreds of thousands of records, with the power of modern devices, it's still fairly fast. The problem starts when you have a really large amount of data to search. 

# Scale
Imagine having a web search with 10k requests/s, scanning each of the 100 million entries in a linear fashion every time. It's very slow and wastes resources, which, in the era of cloud infrastructures, can be very expensive if left uncontrolled.

So I spent the next few days reading and learning about how databases and tools like Solr and ElasticSearch handle data and searching, and I found the concept of organising data in a tree structure and traversing to find non-leaf nodes with data. I tried a few different approaches and finally decided to use Prefix Tree because it's extremely fast and allows searching down and up through nodes. When adding new keys, new nodes are created only for characters that don't currently exist. That said, the four words from above are going to look like this in a Prefix Tree:
```
  i-c-e
  |
a-l-a-n
  |
  e-k
```
Every node that terminates a word contains information about a resource. And even if at this scale it may not look very optimal, it scales very well. Think about inserting a new word like "aleksander". Instead of a new entry with a long hashcode / literal value, you create a few missing nodes with the characters s, a, n, d, e, r and attach a resource to the newly created "r" node.

It's even better when you look at how you can search with this structure. Suppose you are looking for words starting with "ali". In the dictionary, as I wrote above, you must check every entry to determine if the key contains the requested characters in the specified order. With a prefix tree, starting from the top-level nodes, you check every attached child and compare the next letter. If it matches, then move to the child node and repeat the process until you find the last node or until there is no child with the required character. In our case, you will stop at the _i_ node. From this place, you go recursively down and return every resource from every child.

When you have a dict with 100k resources and you are looking for the word "calypso", you must search all 100k entries. In a Trie structure, that is 7 steps. So a search in a Prefix Tree is O(n) where n is the length of the word to search.

# Programming
With this knowledge, I started working on the second version of my library. I found a lot of resources on the Internet. Some of the more notable ones:
https://medium.com/basecs/compressing-radix-trees-without-too-many-tears-a2e658adb9a0
https://visualstudiomagazine.com/articles/2015/10/20/text-pattern-search-trie-class-net.aspx
https://github.com/antirez/rax
https://www.cs.usfca.edu/~galles/visualization/Trie.html

After creating Trie, Node, and other classes for the library, I created a small CLI program inspired by Redis to allow interaction with the Trie without forcing people to implement it in code. For testing, I used sample BBC articles from http://mlg.ucd.ie/datasets/bbc.html and enwiki8. I spent the last few days implementing new arguments, refactoring, and adding wildcard and depth+1 search. There is still a lot of optimisation that could be done, and maybe I will do this in the future. Personally, I completed my plan, so now it's time to celebrate a little ;p

To sum up, I really recommend trying to create a library like this to better understand what is going on under the hood in web search engines when we type the next letter.

If you like the article, want to try it on your own, do some modifications, or check how it's implemented, you can download the source code from GitHub: https://github.com/pilotpirxie/coresearch

_This post was originally published on Dev.to_