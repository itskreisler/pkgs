# Try Catch

A simple try-catch wrapper for functions and async functions.

## Usage

Install package

```node
npm i @kreisler/try-catch
```

### Import module

```mjs
import { tryCatch, tryCatchPromise } from "@kreisler/try-catch";
```

or

### Import commonjs

```cjs
const { tryCatch, tryCatchPromise } = require("@kreisler/try-catch");
```

#### Example #1

```js
const { tryCatch } = require('@kreisler/try-catch');
const { parse } = JSON;
const [error, result] = tryCatch(parse, 'hello');

if (error)
    console.error(error.message);
```

#### Example #2

```js
(async () => {
const { readFile, readdir } = require('fs/promises');
const { tryCatchPromise } = require('@kreisler/try-catch');

const [error, data] = await tryCatchPromise(readFile, 'path', 'utf8');

if (!error){
  return data;
}
if (error.code !== 'EISDIR'){
  return error;
}
return await readdir('path');
})();
```
