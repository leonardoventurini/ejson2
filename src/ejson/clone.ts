import { isArguments, isFunction, isObject, keysOf } from '../utils'
import { EJSON } from './index'

export const clone = val => {
  let ret
  if (!isObject(val)) {
    return val
  }

  if (val === null) {
    return null // null has typeof "object"
  }

  if (val instanceof Date) {
    return new Date(val.getTime())
  }

  // RegExps are not really EJSON elements (eg we don't define a serialization
  // for them), but they're immutable anyway, so we can support them in clone.
  if (val instanceof RegExp) {
    return val
  }

  if (EJSON.isBinary(val)) {
    ret = EJSON.newBinary(val.length)

    for (let i = 0; i < val.length; i++) {
      ret[i] = val[i]
    }

    return ret
  }

  if (Array.isArray(val)) {
    return val.map(EJSON.clone)
  }

  if (isArguments(val)) {
    return Array.from(val).map(EJSON.clone)
  }

  // handle general user-defined typed Objects if they have a clone method
  if (isFunction(val.clone)) {
    return val.clone()
  }

  // handle other custom types
  if (EJSON._isCustomType(val)) {
    return EJSON.fromJSONValue(EJSON.clone(EJSON.toJSONValue(val)))
  }

  // handle other objects
  ret = {}

  keysOf(val).forEach(key => {
    ret[key] = EJSON.clone(val[key])
  })

  return ret
}
