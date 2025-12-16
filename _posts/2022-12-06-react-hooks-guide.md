---
layout: post
title: "React Hooks - Overview for Beginners"
subtitle: "React hooks are a new feature introduced in React 16.8 that allows developers to use state and other..."
author: "pilotpirxie"
date: 2022-12-06T14:35:42.000Z
tags: ["javascript", "react", "webdev", "beginners"]
---
**React hooks** are a new feature introduced in React 16.8 that allows developers to use state and other React features without writing a class. This makes it possible to use React features in functional components, which are components written as JavaScript functions instead of classes.

### useState

One of the most commonly used React hooks is the useState hook, which allows a functional component to have local state. Here is an example of how to use the useState hook to implement a simple counter component:

```js
import React, { useState } from 'react';

const Counter = () => {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>{count}</p>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(count - 1)}>
        Decrement
      </button>
    </div>
  );
};
```

In this example, the useState hook is called inside the Counter component to create a piece of state called count. The useState hook returns a pair of values: the current state value and a function to update it. In this case, the count variable holds the current value of the count state, and the setCount function is used to update the count state when a button is clicked.

React hooks provide a convenient and declarative way to use state and other React features in functional components. They can make code more readable and maintainable by avoiding the need to write complex class components.

### useEffect

The useEffect hook is a built-in React hook that allows a functional component to perform side effects, such as making an API call or subscribing to a data source. It is called inside a functional component, and it takes a function as an argument, which is called when the component is rendered.

Here is an example of how to use the useEffect hook to fetch data from an API and display it in a component:

```js
import React, { useState, useEffect } from 'react';

const DataFetcher = () => {
  // Declare a new piece of state to hold the fetched data
  const [data, setData] = useState(null);

  // Use the useEffect hook to perform a side effect (fetching data)
  useEffect(() => {
    // Call the API to fetch the data
    fetch('https://example.com/api/data')
      // Parse the response as JSON
      .then(response => response.json())
      // Update the component's state with the fetched data
      .then(json => setData(json));
  }, []); // The second argument to useEffect specifies when the effect should be executed

  return (
    <div>
      {/* Display the fetched data */}
      {data && data.map(item => (
        <p key={item.id}>{item.text}</p>
      ))}
    </div>
  );
};
```

In this example, the useEffect hook is called inside the DataFetcher component to perform a side effect when the component is rendered. The useEffect hook takes a function as an argument, which is called when the component is rendered. In this case, the function makes an API call to fetch some data and updates the component's state with the data when it is received.

Bear in mind that this is just a simple example. As @brense pointed out:

> Updating state asynchronously in useEffect without cleanup is problematic. When the component unmounts while your request is still executing, it will produce an error when the request finishes and tries to update the state of your unmounted component. If you do anything asynchronously inside a useEffect you need to have a cleanup function that runs on unmount:
```js
useEffect(() => {
  // Do async stuff like fetch
  return () => {
    // Cleanup by cancelling your fetch
  }
}, [])
```

The `useEffect` hook can also be used to perform cleanup actions, such as canceling a subscription or removing an event listener, when a component is unmounted. This can be done by returning a function from the effect callback, which will be called when the component is unmounted.

Here is an example of how to use the useEffect hook to subscribe to a data source and perform cleanup when the component is unmounted:

```js
import React, { useState, useEffect } from 'react';

const DataSubscriber = () => {
  // Declare a new piece of state to hold the subscribed data
  const [data, setData] = useState(null);

  // Use the useEffect hook to perform a side effect (subscribing to a data source)
  useEffect(() => {
    // Create a new subscription to the data source
    const subscription = dataSource.subscribe(data => setData(data));

    // Return a cleanup function, which will be called when the component is unmounted
    return () => {
      // Cancel the subscription
      subscription.unsubscribe();
    };
  }, []); // The second argument to useEffect specifies when the effect should be executed

  return (
    <div>
      {/* Display the subscribed data */}
      {data && data.map(item => (
        <p key={item.id}>{item.text}</p>
      ))}
    </div>
  );
};
```

In this example, the useEffect hook is called inside the DataSubscriber component to perform a side effect when the component is rendered. The useEffect hook takes a function as an argument, which is called when the component is rendered. In this case, the function creates a subscription to a data source and updates the component's state with the data when it is received. The useEffect hook also returns a cleanup function, which is called when the component is unmounted to cancel the subscription.

### useContext

The useContext hook is a built-in React hook that allows a functional component to access the current value of a context, which is a way of passing data through the component tree without having to explicitly pass props at every level. It is called inside a functional component, and it takes a context object as an argument, which is created using the React.createContext method.

Here is an example of how to use the useContext hook to access the current theme in a component:
```js
import React, { useContext } from 'react';

// Create a new context object
const ThemeContext = React.createContext('light');

const ThemeChanger = () => {
  // Use the useContext hook to access the current theme
  const theme = useContext(ThemeContext);

  return (
    <div>
      <p>The current theme is {theme}.</p>
    </div>
  );
};

```

In this example, the useContext hook is called inside the ThemeChanger component to access the current value of the ThemeContext context. The useContext hook takes a context object as an argument, which is the ThemeContext object created at the top of the file. The useContext hook returns the current value of the context, which in this case is the current theme.

To provide a value for the context, a component can render a Provider component from the context object, passing the value as a prop. The Provider component will make the value available to all components in the component tree that are descendants of the Provider.

Here is an example of how to use the useContext hook with a Provider component to provide a value for the context:

```js
import React, { useContext } from 'react';

// Create a new context object
const ThemeContext = React.createContext('light');

const App = () => {
  // Use the useContext hook to access the current theme
  const theme = useContext(ThemeContext);

  return (
    <div>
      <p>The current theme is {theme}.</p>
    </div>
  );
};

const ThemeChanger = () => {
  return (
    <div>
      {/* Render a Provider component from the context object, passing the new theme as a prop */}
      <ThemeContext.Provider value="dark">
        <App />
      </ThemeContext.Provider>
    </div>
  );
};

```

In this example, the useContext hook is called inside the App component to access the current value of the ThemeContext context. The ThemeChanger component renders a Provider component from the ThemeContext object, passing a new value for the theme as a prop. This makes the new theme available to the App component, which uses the useContext hook to access the theme. The useContext hook will return the new theme provided by the Provider, rather than the default light theme.

### useReducer

The useReducer hook is a built-in React hook that allows a functional component to manage state in a complex component, or share state between multiple components. It is called inside a functional component, and it takes a reducer function and an initial state as arguments, and returns the current state and a dispatch method.

Here is an example of how to use the useReducer hook to manage state in a complex component:
```js
import React, { useReducer } from 'react';

// Define a reducer function to handle state updates
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
};

const Counter = () => {
  // Use the useReducer hook to manage state in the component
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>The current count is {state.count}.</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        Increment
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        Decrement
      </button>
    </div>
  );
};

```

In this example, the useReducer hook is called inside the Counter component to manage state in the component. The useReducer hook takes a reducer function and an initial state as arguments, and returns the current state and a dispatch method. The reducer function defines how the state should be updated in response to actions, and the initial state sets the initial value of the state.

The Counter component uses the useReducer hook to access the current state and dispatch method, and uses them to display the current count and handle button clicks to increment or decrement the count. When a button is clicked, the component calls the dispatch method with an action object, which is passed to the reducer function to update the state.

The useReducer hook can also be used to share state between multiple components. This can be done by creating a context object and using the useReducer hook in a component higher up in the component tree to manage the shared state. The current state and dispatch method can then be accessed using the useContext hook in descendant components.


Here is an example of how to use the useReducer hook to share state between multiple components:

```js
import React, { useReducer, useContext } from 'react';

// Create a new context object
const CounterContext = React.createContext();

// Define a reducer function to handle state updates
const reducer = (state, action) => {
  switch (action.type) {
    case 'increment':
      return { count: state.count + 1 };
    case 'decrement':
      return { count: state.count - 1 };
    default:
      throw new Error();
  }
};

const App = () => {
  // Use the useContext hook to access the current count and dispatch method
  const { count, dispatch } = useContext(CounterContext);

  return (
    <div>
      <p>The current count is {count}.</p>
      <button onClick={() => dispatch({ type: 'increment' })}>
        Increment
      </button>
      <button onClick={() => dispatch({ type: 'decrement' })}>
        Decrement
      </button>
    </div>
  );
};

const CounterProvider = () => {
  // Use the useReducer hook to manage state in the component
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      {/* Render a Provider component from the context object, passing the current state and dispatch method as props */}
      <CounterContext.Provider value={{ count: state.count, dispatch }}>
        <App />
      </CounterContext.Provider>
    </div>
  );
};

```

In this example, the useReducer hook is called inside the CounterProvider component to manage state in the component. The useReducer hook takes a reducer function and an initial state as arguments, and returns the current state and a dispatch method. The CounterProvider component uses the useReducer hook to access the current state and dispatch method, and renders a Provider component from the CounterContext object, passing the current state and dispatch method as props.

The App component uses the useContext hook to access the current count and dispatch method from the CounterContext context. The useContext hook takes the CounterContext object as an argument, and returns the current count and dispatch method provided by the Provider component. The App component uses the count and dispatch method to display the current count and handle button clicks to increment or decrement the count. When a button is clicked, the component calls the dispatch method with an action object, which is passed to the reducer function to update the state.

### useCallback

The useCallback hook is a built-in React hook that allows a functional component to memoize a callback function, so that the function is not recreated on every render. It is called inside a functional component, and it takes a callback function and an array of dependencies as arguments, and returns a memoized callback function.

Here is an example of how to use the useCallback hook to memoize a callback function:

```js
import React, { useState, useCallback } from 'react';

const Counter = () => {
  // Declare a new piece of state to hold the count
  const [count, setCount] = useState(0);

  // Use the useCallback hook to memoize the incrementCount callback function
  const incrementCount = useCallback(() => {
    setCount(prevCount => prevCount + 1);
  }, []); // The second argument to useCallback specifies the dependencies of the callback function

  return (
    <div>
      <p>The current count is {count}.</p>
      <button onClick={incrementCount}>
        Increment
      </button>
    </div>
  );
};
```

In this example, the useCallback hook is called inside the Counter component to memoize the incrementCount callback function. The useCallback hook takes a callback function and an array of dependencies as arguments, and returns a memoized callback function. In this case, the incrementCount callback function updates the count by calling setCount, and the dependencies array is empty, so the callback function will only be recreated when the dependencies change.

The Counter component uses the useCallback hook to memoize the incrementCount callback function, and passes the memoized callback function to the onClick event handler of the Increment button. When the button is clicked, the incrementCount callback function is called, and the count is updated. Because the incrementCount callback function is memoized, it will not be recreated on every render, which can improve performance.

### useMemo
The useMemo hook is a built-in React hook that allows a functional component to memoize a value, so that the value is not recalculated on every render. It is called inside a functional component, and it takes a value-calculating function and an array of dependencies as arguments, and returns the memoized value.

Here is an example of how to use the useMemo hook to memoize a value:
```js
import React, { useState, useMemo } from 'react';

const Counter = () => {
  // Declare a new piece of state to hold the count
  const [count, setCount] = useState(0);

  // Use the useMemo hook to memoize the result of the square calculation
  const square = useMemo(() => {
    // Calculate the square of the count
    return count * count;
  }, [count]); // The second argument to useMemo specifies the dependencies of the value calculation

  return (
    <div>
      <p>The current count is {count}.</p>
      <p>The square of the count is {square}.</p>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>
        Increment
      </button>
    </div>
  );
};
```

In this example, the useMemo hook is called inside the Counter component to memoize the result of the square calculation. The useMemo hook takes a value-calculating function and an array of dependencies as arguments, and returns the memoized value. In this case, the value-calculating function calculates the square of the count, and the dependencies array contains the count state, so the value will only be recalculated when the count changes.

### useImperativeHandle
The useImperativeHandle hook is a built-in React hook that allows a functional component to expose a custom imperative API to its parent component. It is called inside a functional component that is wrapped in a forwardRef callback, and it takes an object containing the custom imperative methods as an argument, and returns nothing.

Here is an example of how to use the useImperativeHandle hook to expose a custom imperative API to a parent component:


```js
import React, { useRef, forwardRef } from 'react';

const TextInput = forwardRef((props, ref) => {
  // Create a ref to store the input element
  const inputRef = useRef(null);

  // Use the useImperativeHandle hook to expose a custom imperative API
  useImperativeHandle(ref, () => {
    return {
      // Define a focus method that sets focus on the input element
      focus: () => {
        inputRef.current.focus();
      }
    };
  });

  return (
    <input ref={inputRef} />
  );
});

```

In this example, the useImperativeHandle hook is called inside the TextInput component to expose a custom imperative API to the parent component. The useImperativeHandle hook takes an object containing the custom imperative methods as an argument, and returns nothing. In this case, the object contains a focus method that sets focus on the input element.

The TextInput component is a functional component that is wrapped in a forwardRef callback, which allows the parent component to access the ref passed to the TextInput component. The useImperativeHandle hook is called inside the TextInput component, and it is passed the ref object provided by the forwardRef callback. This allows the useImperativeHandle hook to access the ref object and attach the custom imperative methods to it.

Here is an example of how to use the ref object passed to the TextInput component to call the custom imperative focus method:

```js
import React, { useRef } from 'react';

const App = () => {
  // Create a ref to store the TextInput instance
  const inputRef = useRef(null);

  return (
    <div>
      <TextInput ref={inputRef} />
      <button onClick={() => inputRef.current.focus()}>
        Focus the input
      </button>
    </div>
  );
};

```

In this example, the App component uses the useRef hook to create a ref to store the TextInput instance.

### useLayoutEffect

The useLayoutEffect hook is a built-in React hook that allows a functional component to perform layout effects, such as measuring the dimensions of an element. It is called inside a functional component, and it takes a callback function that performs the layout effects as an argument, and returns nothing.

The main advantage of using the useLayoutEffect hook is that it runs synchronously after the browser has painted the layout, so it can be used to update the layout in response to a change in state or props. This is different from the useEffect hook, which runs asynchronously after the browser has painted the layout, so it cannot be used to update the layout.

Here is an example of how to use the useLayoutEffect hook to measure the dimensions of an element:

```js
import React, { useRef, useLayoutEffect } from 'react';

const MeasureElement = () => {
  // Create a ref to store the element
  const elementRef = useRef(null);

  // Use the useLayoutEffect hook to measure the element's dimensions
  useLayoutEffect(() => {
    // Measure the element's dimensions using the getBoundingClientRect method
    const rect = elementRef.current.getBoundingClientRect();

    // Log the dimensions of the element
    console.log(`Width: ${rect.width}, Height: ${rect.height}`);
  });

  return (
    <div ref={elementRef}>
      ...
    </div>
  );
};

```

In this example, the useLayoutEffect hook is called inside the MeasureElement component to measure the dimensions of the div element. The useLayoutEffect hook takes a callback function that performs the layout effects as an argument, and returns nothing. In this case, the callback function measures the dimensions of the div element using the getBoundingClientRect method, and logs the dimensions to the console.

The MeasureElement component uses the useRef hook to create a ref to store the div element, and passes the ref to the div element as the ref prop. The useLayoutEffect hook is called inside the MeasureElement component, and it is passed the ref to the div element. This allows the useLayoutEffect hook to access the div element and measure its dimensions.

When the MeasureElement component is rendered, the useLayoutEffect hook runs synchronously after the browser has painted the layout, so it can measure the dimensions of the div element and log the dimensions to the console. This allows the MeasureElement component to update the layout in response to a change in state or props, without causing a layout thrashing.

### useDebugValue

The useDebugValue hook is a built-in React hook that allows a functional component to display a custom label in the React DevTools. It is called inside a functional component, and it takes a value that represents the current state or props of the component as an argument, and returns nothing.

The main advantage of using the useDebugValue hook is that it allows a developer to see the current state or props of a functional component in the React DevTools, which can be useful for debugging and understanding the behavior of the component. This is especially useful for components that are wrapped in higher-order components, such as connect from the Redux library, because it allows the developer to see the values passed to the wrapped component.

Here is an example of how to use the useDebugValue hook to display a custom label in the React DevTools:

```js
import React, { useState, useDebugValue } from 'react';

const Counter = (props) => {
  // Declare a new piece of state to hold the count
  const [count, setCount] = useState(0);

  // Use the useDebugValue hook to display the count in the React DevTools
  useDebugValue(count);

  return (
    <div>
      <p>The current count is {count}.</p>
      <button onClick={() => setCount(prevCount => prevCount + 1)}>
        Increment
      </button>
    </div>
  );
};
```

In this example, the useDebugValue hook is called inside the Counter component to display the current count in the React DevTools. The useDebugValue hook takes a value that represents the current state or props of the component as an argument, and returns nothing. In this case, the value is the count state, so the useDebugValue hook will display the current count in the React DevTools.

When the Counter component is rendered, the useDebugValue hook will display the current count in the React DevTools, under the label "Counter". This allows the developer to see the current count of the Counter component in the React DevTools, which can be useful for debugging and understanding the behavior of the component.

In summary, there are several advantages to using React hooks in functional components. The main advantages include:

* Improved performance: Hooks allow functional components to manage state and perform side effects, without requiring the overhead of class components. This can improve the performance of the application by reducing the amount of code that needs to be executed.
* Cleaner code: Hooks allow functional components to manage state and perform side effects using a simple and declarative syntax. This can make the code easier to read and understand, and can make it easier to refactor and maintain.
* Reusable logic: Hooks can be extracted from functional components and shared across multiple components, allowing developers to reuse common logic and avoid duplication. This can improve the modularity and maintainability of the application.
* Better composition: Hooks allow functional components to be composed in a more flexible and powerful way, allowing developers to create custom hooks that combine multiple hooks in a reusable and composable way. This can make it easier to create complex and flexible components, without sacrificing readability and maintainability.

Overall, the use of React hooks in functional components can improve the performance, cleanliness, and reusability of the code, and can make it easier to create complex and flexible components.

_This post was originally published on Dev.to_