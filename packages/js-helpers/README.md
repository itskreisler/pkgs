# Colelction of JavaScript helpers

## Usage

Install package

```node
npm i @kreisler/js-helpers
```

### Import module

```mjs
import {  } from "@kreisler/js-helpers";
```

or

### Import commonjs

```cjs
const {  } = require("@kreisler/js-helpers");
```

#### Example #1 MarkdownWsp

```js
import { MarkdownWsp } from "@kreisler/js-helpers";
const { Bold, BulletedList, InlineCode, Italic, Monospace, NumberedLists, Quote, Strikethrough } = MarkdownWsp;

console.log(Bold('Hello World')) // *Hello World*
console.log(BulletedList(['Hello', 'World'])) // - Hello\n- World
console.log(BulletedList('Hello World')) // - Hello World
console.log(BulletedList('Hello World', '*')) // * Hello World
console.log(BulletedList(['Hello', 'World'], '*')) // * Hello\n* World
console.log(InlineCode('Hello World')) // `Hello World`
console.log(Italic('Hello World')) // _Hello World_
console.log(Monospace('Hello World')) // ```Hello World```
console.log(NumberedLists(['Hello', 'World'])) // 1. Hello\n2. World
console.log(Quote('Hello World')) // > Hello World
console.log(Strikethrough('Hello World')) // ~Hello World~


```
