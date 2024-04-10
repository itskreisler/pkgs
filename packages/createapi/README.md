# Create API

Create API is a simple package to create API requests with ease.

## Usage

Install package

```node
npm i @kreisler/createapi
```

### Import module

```mjs
import { createApi } from "@kreisler/createapi";
```

or

### Import commonjs

```cjs
const { createApi } = require("@kreisler/createapi");
```

#### Example #1

```js
(async () => {
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
})();
```

#### Example #2

```js
(async () => {
  // createApi
  const api = createApi('https://api.adviceslip.com')
  const output = await api.advice()
  // final url: https://api.adviceslip.com/advice
  console.log({ output })
  /**
   * {
   * output: { slip: { id: 189, advice: 'Do not compare yourself with others.' } }
   * }
  */
})();
```
