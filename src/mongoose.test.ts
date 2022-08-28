import { expect, test } from 'vitest'
import { EJSON } from './ejson'

/**
 * Mock ObjectId object.
 */
class ObjectId {
  constructor(private readonly id: string) {}

  toString() {
    return this.id
  }
}

class model {
  $__ = {
    foo: 'bar',
  }

  constructor(public readonly _doc: any) {}
}

test('should convert mongoose ids to string', () => {
  const id = new ObjectId('5f9b9b9b9b9b9b9b9b9b9b9b')

  const json = EJSON.stringify({ id })

  expect(json).to.be.equals('{"id":"5f9b9b9b9b9b9b9b9b9b9b9b"}')

  expect(EJSON.parse(json)).to.be.deep.equals({ id: id.toString() })
})

test('should convert mongoose models to plain objects', () => {
  const doc = new model({ hello: 'world' })

  const json = EJSON.stringify(doc)

  expect(json).to.be.equals('{"hello":"world"}')

  expect(EJSON.parse(json)).to.be.deep.equals(doc._doc)
})
