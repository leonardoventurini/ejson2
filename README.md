This is basically an improved version of the original `ejson` library from Meteor.

1. Cloned from the Meteor repo and converted the entire codebase to TypeScript and Vitest.
2. Now it eliminates circular references automatically.
3. Added `base64-js` for handling binary data instead of maintaing own code.
4. Removed Meteor specific code references.

All tests have been converted to Vitest and all of them pass, including newly added ones.

## Roadmap

1. Add types to the entire codebase.
2. Performance improvements as needed.

## Mongoose

If you work with Mongoose now this library automatically converts `ObjectId`s to strings.

## Usage

```js

import { EJSON } from 'ejson2'

EJSON.parse('{}')

EJSON.stringify({})

```
