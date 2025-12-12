---
layout: post
title: "Guide to Data Structures Using JavaScript for Beginners"
subtitle: "Data structures are an essential part of computer science, as they provide the means to efficiently organise and store data"
author: "pilotpirxie"
date: 2022-12-07T10:13:53.000Z
tags: ["javascript", "data-structures", "programming"]
background: '/img/posts/definitive-guide-to-data-structures-using-javascript-for-beginners-1ea9-cover.png'
---
Data structures are an essential part of computer science, as they provide the means to efficiently organise and store data. In the field of computer programming, data structures are used to implement algorithms and perform operations on data. JavaScript, a popular programming language, offers a number of built-in data structures that can be used to efficiently manipulate and store data.

This guide provides an introduction to:
* built-in objects
* built-in arrays
* linked lists
* double linked lists
* heaps
* stacks
* queues

### Built-in Data Structures

One of the most commonly used data structures in JavaScript is the array. An array is a linear data structure that stores a collection of elements in a contiguous block of memory. The elements in an array can be of any data type, including numbers, strings, and objects.

Arrays in JavaScript are zero-indexed, which means that the first element in the array has an index of 0, the second element has an index of 1, and so on. To access an element in an array, we use its index. For example, to access the first element in an array named "myArray", we would use the following syntax:

```js
myArray[0]
```

In addition to accessing elements by their index, JavaScript arrays also provide a number of useful methods that can be used to manipulate the data they contain. For example, the "push" method can be used to add new elements to the end of an array, and the "pop" method can be used to remove the last element from an array.

Another common data structure in JavaScript is the object. An object is a collection of key-value pairs, where the keys are used to identify the values. Objects in JavaScript are similar to dictionaries in other programming languages.

To create an object in JavaScript, we use the "object literal" syntax, which involves enclosing a list of key-value pairs in curly braces. For example, the following code creates an object named "myObject" that contains two key-value pairs:

```js
let myObject = {
  key1: "value1",
  key2: "value2"
};
```

To access the values in an object, we use the dot notation or the square bracket notation. For example, to access the value associated with the "key1" key in the "myObject" object, we could use either of the following syntaxes:

```js
myObject.key1
myObject["key1"]
```

In addition to the built-in data structures, JavaScript also allows developers to create their own data structures. For example, we could create a linked list data structure by defining a "Node" class that has properties for the data and a reference to the next node in the list, and a "LinkedList" class that has methods for adding, removing, and searching for nodes in the list.

Linked lists are useful for situations where we need to store a large amount of data and we don't know the size of the data in advance. Unlike arrays, linked lists do not have a fixed size, so they can grow and shrink dynamically to accommodate the data.

One of the main advantages of using data structures in JavaScript is that they provide a way to organise and store data in a way that is efficient and easy to work with. By using the built-in data structures and creating our own custom data structures, we can write code that is efficient, reusable, and maintainable.

In summary, data structures are an essential part of computer science and JavaScript provides a number of built-in data structures as well as the ability to create custom data structures. By using data structures, we can write code that is efficient, organised, and easy to work with.

### Linked list

A linked list is a data structure that consists of a sequence of nodes, where each node contains a reference to the next node in the sequence. Linked lists are often used in computer programming because they provide a flexible and efficient way to store and manipulate data.

In a linked list, each node is an object that contains a value and a reference to the next node in the sequence. The first node in the linked list is called the "head" node, and the last node in the linked list is called the "tail" node.

```js
class LinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  addToTail(value) {
    const newNode = { value, next: null };
    if (!this.head) {
      this.head = newNode;
    }
    if (this.tail) {
      this.tail.next = newNode;
    }
    this.tail = newNode;
  }

  removeHead() {
    if (!this.head) {
      return null;
    }
    const value = this.head.value;
    this.head = this.head.next;
    return value;
  }
}
```

One of the main advantages of linked lists is that they can be easily modified by adding or removing nodes from the list. For example, we can add a new node to the beginning of a linked list by simply setting the new node's "next" reference to the current head node, and then setting the linked list's head node to the new node. Similarly, we can remove a node from the beginning of a linked list by simply setting the linked list's head node to the current head node's "next" reference.

Another advantage of linked lists is that they can be easily traversed. To traverse a linked list, we simply start at the head node and follow the "next" references until we reach the tail node. This allows us to perform operations on all of the nodes in the list without having to know the size of the list in advance.

However, one disadvantage of linked lists is that they do not provide constant-time access to individual elements, like arrays do. To access a specific element in a linked list, we have to traverse the list from the beginning until we reach the desired element. This can be slow for large lists, especially if we want to access an element near the end of the list.

### Double linked list

A double linked list is a variation of the linked list data structure that allows nodes to be traversed in both directions. In a double linked list, each node contains not only a reference to the next node in the sequence, but also a reference to the previous node in the sequence.

This allows us to traverse the list in either direction, starting at either the head or the tail node. It also allows us to easily remove a node from the middle of the list, by simply updating the previous node's "next" reference to point to the current node's "next" reference, and the next node's "previous" reference to point to the current node's "previous" reference.

```js
class DoubleLinkedList {
  constructor() {
    this.head = null;
    this.tail = null;
  }

  addToHead(value) {
    const newNode = { value, next: this.head, prev: null };
    if (this.head) {
      this.head.prev = newNode;
    }
    this.head = newNode;
    if (!this.tail) {
      this.tail = newNode;
    }
  }

  addToTail(value) {
    const newNode = { value, next: null, prev: this.tail };
    if (this.tail) {
      this.tail.next = newNode;
    }
    this.tail = newNode;
    if (!this.head) {
      this.head = newNode;
    }
  }

  removeHead() {
    if (!this.head) {
      return null;
    }
    const value = this.head.value;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    }
    return value;
  }

  removeTail() {
    if (!this.tail) {
      return null;
    }
    const value = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    }
    return value;
  }
}
```

### Stack

A stack is a data structure that provides two main operations: "push" and "pop". The "push" operation allows us to add an element to the top of the stack, and the "pop" operation allows us to remove the element at the top of the stack. Stacks are often used in computer programming because they provide a simple and efficient way to manage data.

One of the main characteristics of a stack is that it follows the "last-in, first-out" (LIFO) principle, which means that the last element that was added to the stack will be the first one to be removed. This is because the "pop" operation always removes the element at the top of the stack, and the "push" operation always adds an element to the top of the stack.

```js
class Stack {
  constructor() {
    this.items = [];
  }

  push(item) {
    this.items.push(item);
  }

  pop() {
    return this.items.pop();
  }

  peek() {
    return this.items[this.items.length - 1];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
```

A common example of a stack in computer programming is the call stack, which is used to keep track of the sequence of function calls in a program. When a function is called, its parameters and local variables are pushed onto the call stack, and when the function returns, its parameters and local variables are popped off the call stack.

### Heap

A heap is a data structure that provides two main operations: "insert" and "extract". The "insert" operation allows us to add a new element to the heap, and the "extract" operation allows us to remove and return the largest or smallest element from the heap. Heaps are often used in computer programming because they provide a fast and efficient way to manage data.

```js
class Heap {
  constructor(compareFn) {
    this.compareFn = compareFn;
    this.items = [];
  }

  add(item) {
    this.items.push(item);
    this.heapifyUp();
  }

  remove() {
    if (this.items.length === 0) return null;
    if (this.items.length === 1) return this.items.pop();

    const removedItem = this.items[0];
    this.items[0] = this.items.pop();
    this.heapifyDown();

    return removedItem;
  }

  heapifyUp() {
    let currentIndex = this.items.length - 1;
    let currentItem = this.items[currentIndex];
    let parentIndex = this.getParentIndex(currentIndex);

    while (
      parentIndex >= 0 &&
      this.compareFn(currentItem, this.items[parentIndex]) > 0
    ) {
      this.items[currentIndex] = this.items[parentIndex];
      currentIndex = parentIndex;
      currentItem = this.items[currentIndex];
      parentIndex = this.getParentIndex(currentIndex);
    }

    this.items[currentIndex] = currentItem;
  }

  heapifyDown() {
    let currentIndex = 0;
    let currentItem = this.items[currentIndex];
    let [leftChildIndex, rightChildIndex] = this.getChildIndices(currentIndex);

    while (
      (leftChildIndex < this.items.length &&
        this.compareFn(currentItem, this.items[leftChildIndex]) < 0) ||
      (rightChildIndex < this.items.length &&
        this.compareFn(currentItem, this.items[rightChildIndex]) < 0)
    ) {
      let swapIndex;
      if (
        rightChildIndex < this.items.length &&
        this.compareFn(this.items[leftChildIndex], this.items[rightChildIndex]) <
          0
      ) {
        swapIndex = rightChildIndex;
      } else {
        swapIndex = leftChildIndex;
      }

      this.items[currentIndex] = this.items[swapIndex];
      currentIndex = swapIndex;
      currentItem = this.items[currentIndex];
      [leftChildIndex, rightChildIndex] = this.getChildIndices(currentIndex);
    }

    this.items[currentIndex] = currentItem;
  }

  getParentIndex(childIndex) {
    return Math.floor((childIndex - 1) / 2);
  }

  getChildIndices(parentIndex) {
    return [2 * parentIndex + 1, 2 * parentIndex + 2];
  }
```

One of the main characteristics of a heap is that it is a "complete binary tree", which means that all of the levels of the tree are fully filled, except possibly the last level, which is filled from left to right. This allows us to efficiently access and manipulate the elements in the heap.

Heaps can be either "max heaps" or "min heaps", depending on whether the largest or smallest element is at the root of the heap. In a max heap, the parent nodes are always greater than or equal to their child nodes, and in a min heap, the parent nodes are always less than or equal to their child nodes.

A common example of a heap in computer programming is the priority queue, which is used to store and manage a set of elements with associated priorities. In a priority queue, elements are added to the heap with their priorities, and the element with the highest priority is always extracted first.

### Queue

A queue is a data structure that provides two main operations: "enqueue" and "dequeue". The "enqueue" operation allows us to add an element to the end of the queue, and the "dequeue" operation allows us to remove and return the element at the front of the queue. Queues are often used in computer programming because they provide a simple and efficient way to manage data.

```js
class Queue {
  constructor() {
    this.items = [];
  }

  enqueue(item) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  peek() {
    return this.items[0];
  }

  isEmpty() {
    return this.items.length === 0;
  }
}
```

One of the main characteristics of a queue is that it follows the "first-in, first-out" (FIFO) principle, which means that the first element that was added to the queue will be the first one to be removed. This is because the "dequeue" operation always removes the element at the front of the queue, and the "enqueue" operation always adds an element to the end of the queue.

A common example of a queue in computer programming is the message queue, which is used to store and manage messages that are being sent between different components of a system. In a message queue, messages are added to the queue with the "enqueue" operation, and they are removed and processed with the "dequeue" operation.

### Summary

In summary, linked lists, double linked lists, stacks, heaps, and queues are all important data structures in computer science. They provide different ways to store and manipulate data, and they have different strengths and weaknesses. By understanding the characteristics and operations of these data structures, we can choose the right one for the task at hand and write efficient and effective code.

_This post was originally published on Dev.to_