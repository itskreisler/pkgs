# Colelction of JavaScript helpers

@kreisler/js-helpers is a Javascript library for dealing with code repetition

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

#### Example #2 stripHtmlTags

```js
// using import module from "package-name"
const { stripHtmlTags } = require("@kreisler/js-helpers");
console.log(stripHtmlTags('<h1>Hello World</h1>'))
// output: Hello World
```

#### Example #3 debounce

```js
// using import module from "package-name"
import { debounce } from "@kreisler/js-helpers";
// debounce
const miFuncion = function() {
  console.log("Mi función debouncer");
}
const miFuncionConDebounce = debounce(miFuncion, 5000, {
  flood: 3,
  onFlood: function() {
    console.log("¡Estás haciendo spam!");
  },
  onCall: function() {
    console.log("Se ha llamado a la función debouncer");
  },
  onComplete: function() {
    console.log("Se ha completado la función debouncer");
  },
  immediate: true
});

miFuncionConDebounce(); // Llamada 1
miFuncionConDebounce(); // Llamada 2
miFuncionConDebounce(); // Llamada 3 (Flood alcanzado, se llama a onFlood)
miFuncionConDebounce(); // Llamada 4 (callCount se reinicia a 0 en el setTimeout)
```

#### Example #4 createApi

```js
import { createApi } from "@kreisler/js-helpers";
// createApi
const api = createApi('https://nekobot.xyz/api')
const output = await api.image({ type: 'neko' })
// final url: https://nekobot.xyz/api/image?type=neko
console.log({ output })
// output: 
// {
// "success": true,
// "message": "https://i0.nekobot.xyz/7/0/6/217595fa8b7cae5b7f6524169230c.png",
// "color": 13419230,
// "version": "2021070801"
// }
```

## Methods

| Name    | Description                                                                                 |
|---------|---------------------------------------------------------------------------------------------|
| `createApi`     | Utility function to create an API.|
| `stripHtmlTags` | Utility function to strip HTML tags.|
| `debounce`                | Utility function to debounce a function.|
| `b64Toutf8` `utf8Tob64`   | Utility function to convert UTF8 to base64 and base64 to UTF8|
| `normalize`     | Utility function to normalize a string.|
| `trimText`  | Utility function to trim text|
