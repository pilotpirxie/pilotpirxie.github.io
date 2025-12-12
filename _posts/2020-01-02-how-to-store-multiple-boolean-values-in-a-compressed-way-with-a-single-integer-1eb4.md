---
layout: post
title: "How to store multiple boolean values in a compressed way with a single integer"
subtitle: "Hey everyone, in this short tutorial I am going to show how to store multiple boolean (true/false) va..."
author: "pilotpirxie"
date: 2020-01-02T00:34:07.000Z
tags: ["tutorial", "algorithms", "data", "structure"]
background: '/img/posts/how-to-store-multiple-boolean-values-in-a-compressed-way-with-a-single-integer-1eb4-cover.jpg'
---
Hey everyone, in this short tutorial I am going to show how to store multiple boolean (true/false) values in a compressed way, very useful for databases.

### Bit
As you may remember from your CS lessons, modern computers are digital and store information as a sequence of 0 and 1. For example, integer ``14`` in decimal is ``1110`` in binary representation. Each digit from last to first is the power of 2 with exponent to the index in a row minus 1. 
```
1 (bin) = 1 (dec) because 1*2^(1-1)=1*2^0=1
10 (bin) = 2 (dec)  because 1*2^(2-1)=1*2^1=1
100 (bin) = 4 (dec)  because 1*2^(3-1)=1*2^2=1
and so on...
```

Having this knowledge you can perform operations on numbers like adding, subtracting, multiplying, dividing etc. But you can also perform bitwise operations.

Bitwise operation is an operation base on boolean algebra introduced by George Boole in his first book, in 1847. Some basic operations are conjunction (AND), disjunction (OR) negation (NOT) and exclusive or (XOR). 

AND operation is the one, that we need to compress our set of booleans, so quickly remind the truth table for it:
```
X & Y = Z
--
X Y Z
0 0 0
0 1 0
1 0 0
1 1 1
```

With this, we can calculate AND between numbers like ``1`` AND ``7``:
```
001 & 111 = 001
so 
1 & 7 = 1
```
but
```
001 & 110 = 000
so
1 & 6 = 0
```

### Bitwise composition
And now imagine that you have set of 3 flags about an entity in the database. But you know, in the future it will be much more flags and not every entity is going to have all of them. Instead of creating multiple columns with the boolean data type you can perform bit masking and store every flag as bitwise composition in a single column with an integer data type.

For instance, entity #1 has ``false, false, false`` it could be ``000`` in binary and ``0`` in decimal. Entity #2 has ``true, false and false``. It's ``100`` in binary = ``4`` in decimal. Entity #3 has ``true, true and true``. It's ``111`` binary = ``7`` decimal.

In the future, when you would want to add more flags simply recalculate flags where true values are going to be. Other leave as are. 

To find if the flag is set as true or false, calculate AND between column value and like shown above with the search flag bit value. Most of the databases have bult-in in functions for calculations on bits. In PostgreSQL you can:
```sql
SELECT * FROM xyz WHERE flags & 2 != 0
```
In MySQL and SQL Server it's very similar.

### Conclusion
To sum up, bitwise operations are very useful, widely used in many different aspects of software engineering and technique from this article is just an example of the power behind numbers and optimization tricks, that you can perform.

_This post was originally published on Dev.to_