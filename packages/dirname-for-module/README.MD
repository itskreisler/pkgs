# dirname-for-module

This package only works in esm module, config `type: module` in package.json

## Install

```sh
npm install @kreisler/dirname-for-module
```

## Usage

```js
import { __dirname } from "@kreisler/dirname-for-module";
// or
import * as dfm from "@kreisler/dirname-for-module";
console.log(dfm.__dirname); // outputs "/path/to/the"
```

## API

[Type Document](https://itskreisler.github.io/dirname-for-module/)
