# Exec Promise

A simple Exec Promise package that allows you to execute a command in a promise.

## Usage

Install package

```node
npm i @kreisler/exec-promise
```

### Import module

```mjs
import { execPromise } from "@kreisler/exec-promise";
```

or

### Import commonjs

```cjs
const { execPromise } = require("@kreisler/exec-promise");
```

#### Example #1

```js
const { execPromise } = require("@kreisler/exec-promise");
const command = 'curl -s -X GET "https://jsonplaceholder.typicode.com/posts/1"';
const {stdout, stderr} = await execPromise(command);
if (stderr)
    console.error(stderr);
console.log(stdout);
```
