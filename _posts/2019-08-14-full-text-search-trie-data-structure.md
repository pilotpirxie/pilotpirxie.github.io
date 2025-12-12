---
layout: post
title: "Full-Text-Search - Trie Data Structures Demystified"
subtitle: 'What makes Full-Text Search engines so efficient? In this article, we are going to look closer at the Trie and derivative data structures'
author: "pilotpirxie"
date: 2019-08-14T00:00:00.000Z
tags: ["data", "structure", "algorithm", "trie"]
---

# Search Engines and Tree Data Structures

For the past few decades, people from all around the world were sharing, posting and gaining information through the Internet. The amount of new data generated every day is overwhelming. Until 2025 amount of created data will increase up to 175 ZB, Seagate IDC predicts. We are way past a point when a single human could analyze everything. So we need technology to help us effectively search for the information we need. Thankfully we have it, and we call it a Search Engine.

To put it simply, a search engines are programs which searches a database for information that we are looking for. They are available in various forms and places, web search engines like Google or Bing, API services like Algolia, standalone software like ElasticSearch etc. However, the database needs to be populated with data first. Some search engines use crawlers, others rely on manual submissions. A structure of data inside different database engines may be different because they are meant to be solving different problems.

A very common approach to storing information is indexing data, along with a source where they come from. The source is a context, a mechanism which produces words. The aforementioned method is called a reverse-index. This allows us to perform a very efficient scan for a required word in large collections of data. Instead of searching one-by-one, for each word in every source, we start with mapping each word to its source, and then check where it occurs, by calculating hash and retrieving nested data.

The reverse index can be implemented with a HashMap structure. It's extremely fast when it comes to insertion and exact search with O(1) complexity, but it's ineffective when we want to search with kleene star e.g. to make a search suggestion. For example, if an indexed word is "elephant" but we type just "eleph", the hash of the word is different, and not mapping to any source. And for such occasions, there is a better data structure called Prefix Tree (Trie).

## Prefix Tree

The algorithms behind search engines are nearly countless. However, the Prefix Tree (Trie) concept is one of the most widely known and well researched. Prefix Tree is a tree graph built from many nodes. Each node describes atomic data about the key. In our case, atomic data is a single letter of the word connected with a parent (a previous letter), children (the following letters) and if it's the last node it contains a reference to the source.

This structure is called a Prefix Tree, because consecutive parts of each word are stored in different nodes of the graph connected with a single, undirected edge. The information in a Trie is populated effectively by sharing nodes with the same atomic data between keys. It means that a new node is created only if a parent doesn't have a child node with the required key data.

The Trie data structure may sound and looks strange at first glance, however, there are only a few rules which describes this structure. The Trie is recursively defined by the following rule:

![Trie Math Model](/img/posts/trie-math-model.png)

- **Σ** is a fixed alphabet with r characters. Sigma comes from formal language theory. It contains atomic data (symbols), which describe words.
- **W** is a finite subset of words made of characters from an infinite set of words over Σ (Σ*). A single entry in W is a string made from symbols.
- Trie structure for word W is made of recursive subtrees and atomic information (e.g. character).
- The first node of Trie is called Root and it's Node(W).
- Trie goes recursively down until set W contains only one element. At this point, a pointer to the source is written along with the last atomic data.

Example of insertion and graph traversing written in C#:

```csharp
using System;
using System.Collections;
using System.Collections.Generic;
//...
public class Node: ICollection {
    Node _parent;
    char _key;
    HashSet _data = new HashSet ();
    public List Children {get; set;}
    public int Depth {get; set;}
    // ...
    public Node(Node parent, char key, string data = null, int depth = 0) {
        _parent = parent;
        _key = key;
        if (data != null) {
            _data.Add(data);
        }
        Depth = depth;
    }
    public Node GetChildByKey(char key) {
        for (int i = 0; i < Children.Count; i++) {
            if (Children[i]._key == key) {
                return Children[i];
            }
        }
        return null;
    }
    public void Add(string item){
        _data.Add(item);
    }
    // ...
}

public class Program {
    Node _root = new Node(null, ' ', null, 0);
    int _size = 0;
    // ...
    public Node TraversePrefix(string keyPrefix) {
        Node currentNode = _root;
        Node result = currentNode;
        foreach(char keyPrefixChar in keyPrefix) {
            currentNode = currentNode.GetChildByKey(keyPrefixChar);
            if (currentNode == null) {
                break;
            }
            result = currentNode;
        }
        return result;
    }
    public void Insert(string key, string data) {
        Node commonPrefix = TraversePrefix(key);
        Node current = commonPrefix;
        for (int i = current.Depth; i < key.Length; i++) {
            Node newNode = new Node(current, key[i], null, current.Depth + 1);
            current.Children.Add(newNode);
            current = newNode;
            _size += 1;
        }
        current.Add(data);
    }
    // ...
}
```

A non-compressed Trie with two words "Alan, Alice" pointing to the same resource contains eight nodes, 7 atomic and 1 root.

`~->a->l->{a->n, i->c->e}`

![Prefix Tree Diagram](/img/posts/prefix-tree.png)

As you can see, with the structure like this, we can simply traverse down with just partial information. Let's say we are looking for resources which contain "a" in the key. To find them we can simply traverse to the last known atomic node, and extract data recursively down from every connected node. The time of searching, insertion and deleting from a Trie is O(*a\*n*). It depends on the length of the word (*a*), and total number of the words in the structure (*n*).

## Radix Tree

In the previous paragraph, I mentioned the term: "non-compressed". This means a prefix tree may be optimized further. Imagine that you have a few, different and extremely long strings to index. For every letter, the program is going to create a new node even if the strings aren't sharing nodes. The performance of Trie depends on the maximum length of a word in structure. Each atomic data has its node, connected to the parent and children. Compressing atomic data together can be done via Radix Tree, which is a special form of a Prefix Tree and differs from the original, in a way how it stores atomic data. Atomic data is stored together to reduce the number of unshared nodes in the chain. Our previous example of a Prefix Tree, stored as a Radix Tree would look like this:

`~->al->{an,ice}`

![Radix Tree Diagram](/img/posts/radix-tree.png)

4 nodes (1 root, 3 atomic) instead of 8! Reducing half of the size means a lot of saved memory, a possibility to index more data and finally, less expensive maintenance.

## PATRICIA Tree

Maybe you had a chance to work with tools like Apache Lucene or Redis. They are good examples of the phenomenon I'm about to introduce. Both, in some cases, use a Radix Tree to store information (based on the source of Rax library). Some, for instance, use Radix Tree with a radix equal to 2. It means that Redis stores information in binary, to minimize sparseness. This type of Radix Tree is called PATRICIA Tree, and it was described for the first time in 1968. Every node in PATRICIA Tree contains only two subtrees. Because data is stored in binary, you can easily insert almost everything to the database, not only lexical data.

![PATRICIA Tree Diagram](/img/posts/patricia-tree.png)

This diagram may look similar to the previous one, with a visualized Radix Tree. However, if you look closer, you will notice that the first node contains more common data. Radix Tree in first children of the root contains (assuming 8 bit extended ASCII encoding) 2 characters × 1 Byte × 8 = 16 bits. PATRICIA Tree contains 20 common bits from the beginning.

To sum up, you can see, the modern problem of the overwhelming amount of information can be addressed with modern solutions. Tree data structures are very common and aren't as complicated as they may look like. Stay tuned if you want to know more - additional blog posts are coming soon.

**Useful resources & references:**

- [https://www.forbes.com/sites/gilpress/2020/01/06/6-predictions-about-data-in-2020-and-the-coming-decade/](https://www.forbes.com/sites/gilpress/2020/01/06/6-predictions-about-data-in-2020-and-the-coming-decade/#7391347f4fc3)
- [http://www.mathcs.emory.edu/~cheung/Courses/323/Syllabus/Text/trie02.html](http://www.mathcs.emory.edu/~cheung/Courses/323/Syllabus/Text/trie02.html)
- [http://www.lucenetutorial.com/basic-concepts.html](http://www.lucenetutorial.com/basic-concepts.html)
- [https://www.techiedelight.com/trie-implementation-insert-search-delete/](https://www.techiedelight.com/trie-implementation-insert-search-delete/)
- [https://brilliant.org/wiki/tries](https://brilliant.org/wiki/tries)
- [https://github.com/antirez/rax](https://github.com/antirez/rax)

_This post was originally published on [Ringier Axel Springer Tech Blog](https://tech.ringieraxelspringer.com/blog/programming/full-text-search-trie-data-structures-demystified,28)_