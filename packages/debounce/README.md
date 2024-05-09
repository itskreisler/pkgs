# Debounce

A simple utility to debounce a function.

## Usage

Install package

```node
npm i @kreisler/debounce
```

### Import module

```mjs
import { debounce } from "@kreisler/debounce";
```

or

### Import commonjs

```cjs
const { debounce } = require("@kreisler/debounce");
```

#### Example #1

```js
const { debounce } = require("@kreisler/debounce");
const myFunction = (message) => alert(message);
const debouncedFunction = debounce(myFunction, 1000);
debouncedFunction("Hello World"); // Will alert "Hello World" after 1 second
debouncedFunction("Hello World"); // Will cancel the previous call and alert "Hello World" after 1 second
debouncedFunction("Hello World"); // alert "Hello World" after 1 second

```

#### Example #2

```js
import { debounce } from "@kreisler/debounce";
const myFunction = (message) => alert(message);
const debouncedFunction = debounce(myFunction, 1000, { 
      immediate: true,
      onCall: (message) => console.log(`Calling function with message: ${message}`),
      onComplete: (message) => console.log(`Function completed with message: ${message}`)
      flood: 7,
      onFlood: (message) => console.log(`Function flooded 7 with message: ${message}`)
    });
debouncedFunction("Hello World"); // Will alert "Hello World" immediately // onCall will be called
debouncedFunction("Hello World"); // Will cancel the previous call and alert "Hello World" after 1 second // onCall will be called
debouncedFunction("Hello World"); // alert "Hello World" after 1 second // onCall will be called
debouncedFunction("Hello World"); // alert "Hello World" after 1 second // onCall will be called
debouncedFunction("Hello World"); // alert "Hello World" after 1 second // onCall will be called
debouncedFunction("Hello World"); // alert "Hello World" after 1 second // onCall will be called
debouncedFunction("Hello World"); // onFlood will be called // onCall will be called
debouncedFunction("Hello World"); // alert "Hello World" after 1 second // onComplete will be called

```
