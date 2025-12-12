---
layout: post
title: "Symbols in JavaScript for Beginners with Examples and Exercises"
subtitle: "When and how to use Symbols. At the end of the post are a few exercises"
author: "pilotpirxie"
date: 2020-05-19T00:06:05.000Z
tags: ["javascript", "tutorial", "webdev"]
background: '/img/posts/symbols-for-beginners-with-examples-and-exercises-o9b-cover.png'
---
In this post, I am going to explain what a Symbol in JavaScript is, when and how to use it. At the end of the post are a few exercises. You can check yourself and post solutions in the comments. I'll code review the first few answers 😉

So, let's learn something new!
<figure>
  <img src="/img/posts/symbols-for-beginners-with-examples-and-exercises-o9b-1-895b19.gif" alt="Learning">
  <figcaption>Source Giphy</figcaption>
</figure>

### What is a Symbol?
Symbols are a new primitive data type, introduced with ECMAScript 6. Every symbol created with the basic constructor is unique.
```js
const symbol1 = Symbol(); // create first symbol
const symbol2 = Symbol(); // create second symbol

console.log(symbol1 == symbol2); // false
console.log(symbol1 === symbol2); // false
```
A symbol can be created with a description in the constructor. However, it shouldn't be used for any other purpose than debugging. Don't rely on the description!

```js
const niceSymbol = Symbol('Yup 👩‍💻');
console.log(niceSymbol.description); // Yup 👩‍💻 
```

### Global symbol registry
The symbol can also be created using the **for** method with a custom string as the argument. So you can create a few instances of symbols with the same value under the hood. After creating a symbol using the **for** method, the description is set to the same value as the key and the symbol itself is stored in the global symbol registry.

```js
const symbol1 = Symbol.for('devto');
const symbol2 = Symbol.for('devto');

console.log(symbol1 == symbol2); // true
console.log(symbol1 === symbol2); // true
console.log(symbol1.description); // devto
```
The global symbol registry is a location where all symbols created with the **for** method are stored across all contexts in the runtime. When you are using the **for** method for the first time, a new symbol is attached to the registry. Next time it is retrieved from it.

What's important is that symbols created with the **for** method are distinct from those created with the basic constructor. You can check the key for a symbol registered globally with the method **Symbol.keyFor()**.
```js
const a = Symbol.for('devto'); // globally registered symbol
console.log(Symbol.keyFor(a)); // devto

const b = Symbol(); // local unique symbol
console.log(Symbol.keyFor(b)); // undefined
```

Symbols don't have string literals. So if you try to explicitly convert a symbol to a string, you get a TypeError.
```js
console.log(`${Symbol()}`); // TypeError: Can't convert Symbol to string
```

### Hide access to property
Symbols are commonly used for hiding direct access to properties in objects. With a Symbol, you can create a semi-private field.

Properties are hidden like the Pink Panther ;) They exist, you can retrieve them with some effort but at first glance you cannot see them or get them!
<figure>
  <img src="/img/posts/symbols-for-beginners-with-examples-and-exercises-o9b-2-f90fdb.gif" alt="Hide">
  <figcaption>Source Giphy</figcaption>
</figure>

```js
const tree = {
  [Symbol('species')]: 'birch',
  [Symbol('height')]: 7.34,
};
console.log(tree);
```
Without a reference to the symbol, you don't have the value under which the properties are bound to the tree. 

### Enums
Another awesome trick to do with symbols is to create enums. Enums in other programming languages are types with all possible values. For instance, you may want to have exactly two states for a car: DRIVE and IDLE and make sure the car's state comes from this enum so you can't use strings or numbers.

Example of enum with symbols:
```js
const CarState = Object.freeze({
  DRIVE: Symbol('drive'),
  IDLE: Symbol('idle'),
});

const car = {
  state: CarState.DRIVE
}

if (car.state === CarState.DRIVE) {
  console.log('Wroom, wroom 🚙!');
} else if (car.state === CarState.IDLE) {
  console.log('Waiting for ya ⏱!');
} else {
  throw new Error('Invalid state');
}

// Wroom, wroom 🚙!
```

Why are symbols so important? Check this example. If you try to mutate the object with a value other than the one behind the symbol from the enum you will get an error.
```js
// correct way of creating enum - with symbols

const CarState = Object.freeze({
  DRIVE: Symbol('drive'),
  IDLE: Symbol('idle'),
});

const car = {
  state: CarState.DRIVE
}

// you cannot set the state without reference to symbol-based enum
car.state = 'idle';

if (car.state === CarState.DRIVE) {
  console.log('Wroom, wroom 🚙!');
} else if (car.state === CarState.IDLE) {
  console.log('Waiting for ya ⏱!');
} else {
  throw new Error('Invalid state');
}

// Error: Invalid state
```

Similar code with strings will be valid, and this is a problem! We want to control all possible states.

```js
// invalid way of creating enum - with other data types

const CarState = Object.freeze({
  DRIVE: 'drive',
  IDLE: 'idle',
});

const car = {
  state: CarState.DRIVE
}

// you can set car state without calling for enum prop, so data may be lost or incorrect
car.state = 'idle';

if (car.state === CarState.DRIVE) {
  console.log('Wroom, wroom 🚙!');
} else if (car.state === CarState.IDLE) {
  console.log('Waiting for ya ⏱!');
} else {
  throw new Error('Invalid state');
}
// Waiting for ya ⏱!
```

### Well-known Symbols
The last thing is a set of well-known symbols. They are built-in properties and are used for different internal object behaviours. This is a little tricky topic. So let's say we want to override ``Symbol.iterator``, the most popular well-known symbol for objects.

The iterator is responsible for behaviour when we are iterating with a ``for...of`` loop.
```js
const tab = [1, 7, 14, 4];

for (let num of tab) {
  console.log(num);
}
// 1
// 7
// 14
// 4
```

<figure>
  <img src="/img/posts/symbols-for-beginners-with-examples-and-exercises-o9b-3-40f77f.gif" alt="Roman numeral">
  <figcaption>Source Giphy</figcaption>
</figure>

But what if we want to return all numbers **but in Roman numerals** and without changing the for...of loop? We can use Symbol.iterator and **override** the function responsible for returning values.

```js
const tab = [1, 7, 14, 4];

tab[Symbol.iterator] = function () {
  let index = 0;
  const total = this.length;
  const values = this;
  return {
    next() {
      const romanize = num => {
        const dec = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
        const rom = ["M", "CM", "D", "CD", "C", "XC", "L", "XL", "X", "IX", "V", "IV", "I"];
        let output = "";

        for (let i = 0; i < dec.length; i++) {
          while (dec[i] <= num) {
            output += rom[i];
            num -= dec[i];
          }
        }

        return output;
      };

      return index++ < total ? {
        done: false,
        value: romanize(values[index - 1])
      } : {
        done: true
      };
    }

  };
};

for (let num of tab) {
  console.log(num);
}
// I
// VII
// XIV
// IV
```

Other well-known symbols:
* asyncIterator,
* match,
* replace,
* search,
* split,
* hasInstance,
* isConcatSpreadable,
* unscopables,
* species,
* toPrimitive,
* toStringTag,

That's all about the Symbols! Now time to practice ;)
<figure>
  <img src="/img/posts/symbols-for-beginners-with-examples-and-exercises-o9b-4-ef889d.gif" alt="Homework">
  <figcaption>Source Giphy</figcaption>
</figure>

A1. Create a custom logger function, which as one of its parameters accepts one of the enum values and data to log. If an invalid value is passed, throw an error.
```js
// expected result
log(LogLevel.INFO, 'Important information :O');
log(LogLevel.WARN, 'Houston, We Have a Problem!');
log('info', 'Hi!'); // Error: Invalid log level
```

A2. By default an instance of a class returns with toString() ``[object Object]``. But you want to return a more nicely looking name! Create a Logger class. Move the function from the first exercise inside. Override the getter for the ``Symbol.toStringTag`` property of the class and return 'Logger' instead.
```js
// expected result
console.log((new Logger()).toString()); // [object Logger]
```

_This post was originally published on Dev.to_