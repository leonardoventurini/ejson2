import { EJSON } from './ejson'
import { expect, test } from 'vitest'

test('should be able to parse a JSON string', () => {
  const json = { date: new Date() }

  const stringified = EJSON.stringify(json)

  console.warn({ stringified })

  const parsed = EJSON.parse(stringified)

  expect(parsed.date).to.be.a('date')
})
