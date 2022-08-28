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

test('should convert mongoose ids to string', () => {
  const id = new ObjectId('5f9b9b9b9b9b9b9b9b9b9b9b')

  const json = EJSON.stringify({ id })

  expect(json).to.be.equals('{"id":"5f9b9b9b9b9b9b9b9b9b9b9b"}')

  expect(EJSON.parse(json)).to.be.deep.equals({ id: id.toString() })
})
