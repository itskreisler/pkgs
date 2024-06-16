# Create API

Create API is a simple package to create API requests with ease.
[@kreisler/createapi](https://www.npmjs.com/package/@kreisler/createapi)

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

#### Example #2 Typescript

```ts
interface Adviceslip {
  advice: () => Promise<{
    slip: {
      id: number
      advice: string
    }

  }>
}
const adviceslip = async () => {
  // createApi
  const api = createApi('https://api.adviceslip.com') as Adviceslip
  const output = await api.advice()
  // final url: https://api.adviceslip.com/advice
  console.log({ output }, output.slip.advice)
  /* {
    output: {
      slip: {
        id: 135,
        advice: 'If you want to be happily married, marry a happy person.'
      }
    }
  } */
}
adviceslip()
```

#### Example #3 Typescript

```ts

import { createApi } from "@kreisler/createapi";
interface NekoBot {
  image: (arg: {
    type: 'neko' | 'food' | 'coffee' | '4k'
  }) => Promise<{
    success: boolean
    message: string
    color: number
    version: string
  }>
}
const neko = async () => {
  const api = createApi('https://nekobot.xyz/api', { debug: true }) as NekoBot
  const res = await api.image({ type: 'neko' })
  console.log(res)
  /* {
    success: true,
    message: 'https://cdn.nekobot.xyz/a/e/4/72cc9cda5e8db2b370991737314b4.png',
    color: 15655656,
    version: '2021070801'
  } */
}
neko()
```

### Example #4 Typescript Advanced

```ts
import { createApi } from "@kreisler/createapi";
// replace any with your types or interfaces
interface PostmanEcho {
  get: (id?: any, params?: any, extraparams?: RequestInit) => Promise<any>
  post: (id?: any, params?: any, extraparams?: RequestInit) => Promise<any>
  put: (id?: any, params?: any, extraparams?: RequestInit) => Promise<any>
  delete: (id?: any, params?: any, extraparams?: RequestInit) => Promise<any>
  [key: string]: (id?: any, params?: any, extraparams?: RequestInit) => Promise<any>
}

const postman = createApi('https://postman-echo.com', {
  headers: {
    'Content-Type': 'application/json'
  }
}) as PostmanEcho

postman.get({ id: 1 }, null, { method: 'GET' }).then(console.log)
postman.post(null, null, { method: 'POST', body: JSON.stringify({ id: 1 }) }).then(console.log)
postman.put(null, null, { method: 'PUT', body: JSON.stringify({ id: 1 }) }).then(console.log)
postman.delete(null, null, { method: 'DELETE', body: JSON.stringify({ id: 1 }) }).then(console.log)
```
