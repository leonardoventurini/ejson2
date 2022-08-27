import { EJSON } from './ejson'
import { assert, test } from 'vitest'
import { CustomModels } from '../test/custom-models'

const testSameConstructors = (someObj, compareWith) => {
  assert.deepEqual(someObj.constructor, compareWith.constructor)

  if (typeof someObj === 'object') {
    Object.keys(someObj).forEach(key => {
      const value = someObj[key]
      testSameConstructors(value, compareWith[key])
    })
  }
}

const testReallyEqual = (someObj, compareWith) => {
  assert.deepEqual(someObj, compareWith)
  testSameConstructors(someObj, compareWith)
}

const testRoundTrip = someObj => {
  const str = EJSON.stringify(someObj)

  const roundTrip = EJSON.parse(str)

  testReallyEqual(someObj, roundTrip)
}

const testCustomObject = someObj => {
  testRoundTrip(someObj)
  testReallyEqual(someObj, EJSON.clone(someObj))
}

test('custom types', () => {
  CustomModels.addTypes()

  const address = new CustomModels.Address('Montreal', 'Quebec')

  testCustomObject({ address: address })

  // Test that difference is detected even if they
  // have similar toJSONValue results:
  const nakedA = { city: 'Montreal', state: 'Quebec' }

  assert.notEqual(nakedA, address)
  assert.notEqual(address, nakedA)

  const holder = new CustomModels.Holder(nakedA)

  assert.deepEqual(holder.toJSONValue(), address.toJSONValue()) // sanity check

  // @ts-ignore
  assert.notEqual(holder, address)
  // @ts-ignore
  assert.notEqual(address, holder)

  const d = new Date()
  const obj = new CustomModels.Person('John Doe', d, address)

  testCustomObject(obj)

  // Test clone is deep:
  const clone = EJSON.clone(obj)
  clone.address.city = 'Sherbrooke'
  assert.notEqual(obj, clone)
})
