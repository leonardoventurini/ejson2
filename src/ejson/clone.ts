import {
  isArguments,
  isFunction,
  isObject,
  isObjectAndNotNull,
  keysOf,
} from '../utils'
import { EJSON } from './index'

export const clone = _val => {
  const set = new WeakSet()

  function internalClone(val) {
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

    if (val.constructor.name === 'ObjectId' && isFunction(val.toString)) {
      return val.toString()
    }

    if (val.constructor.name === 'model' && isObject(val._doc)) {
      return internalClone(val._doc)
    }

    if (EJSON.isBinary(val)) {
      ret = EJSON.newBinary(val.length)

      for (let i = 0; i < val.length; i++) {
        ret[i] = val[i]
      }

      return ret
    }

    function cloneArray(arr: any[]) {
      set.add(arr)

      return arr
        .map(val => {
          if (isObjectAndNotNull(val)) {
            if (set.has(val as object)) {
              return undefined
            }
            set.add(val as object)
          }

          return clone(val)
        })
        .filter(val => val !== undefined)
    }

    if (Array.isArray(val)) {
      return cloneArray(val)
    }

    if (isArguments(val)) {
      set.add(val)

      return cloneArray(Array.from(val))
    }

    // handle general user-defined typed Objects if they have a clone method
    if (isFunction(val.clone)) {
      return val.clone()
    }

    // handle other custom types
    if (EJSON._isCustomType(val)) {
      return EJSON.fromJSONValue(internalClone(EJSON.toJSONValue(val)))
    }

    set.add(val)

    ret = {}

    keysOf(val).forEach(key => {
      if (isObjectAndNotNull(val[key])) {
        if (set.has(val[key])) return
        set.add(val[key])
      }

      ret[key] = internalClone(val[key])
    })

    return ret
  }

  return internalClone(_val)
}
