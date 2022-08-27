import { EJSON } from './ejson'
import { assert, expect, test } from 'vitest'

test('should be able to parse a JSON string', () => {
  const json = { date: new Date() }

  const str = EJSON.stringify(json)

  const parsed = EJSON.parse(str)

  expect(parsed.date).to.be.a('date')
})

test('option: keyOrderSensitive', () => {
  assert.isTrue(
    EJSON.equals(
      {
        a: { b: 1, c: 2 },
        d: { e: 3, f: 4 },
      },
      {
        d: { f: 4, e: 3 },
        a: { c: 2, b: 1 },
      },
    ),
  )

  assert.isFalse(
    EJSON.equals(
      {
        a: { b: 1, c: 2 },
        d: { e: 3, f: 4 },
      },
      {
        d: { f: 4, e: 3 },
        a: { c: 2, b: 1 },
      },
      { keyOrderSensitive: true },
    ),
  )

  assert.isFalse(
    EJSON.equals(
      {
        a: { b: 1, c: 2 },
        d: { e: 3, f: 4 },
      },
      {
        a: { c: 2, b: 1 },
        d: { f: 4, e: 3 },
      },
      { keyOrderSensitive: true },
    ),
  )
  assert.isFalse(
    EJSON.equals({ a: {} }, { a: { b: 2 } }, { keyOrderSensitive: true }),
  )
  assert.isFalse(
    EJSON.equals({ a: { b: 2 } }, { a: {} }, { keyOrderSensitive: true }),
  )
})

test('nesting and literal', () => {
  const date = new Date()
  const obj = { $date: date }
  const eObj = EJSON.toJSONValue(obj)
  const roundTrip = EJSON.fromJSONValue(eObj)
  assert.deepEqual(obj, roundTrip)
})

test('equality', () => {
  assert.isTrue(EJSON.equals({ a: 1, b: 2, c: 3 }, { a: 1, c: 3, b: 2 }))
  assert.isFalse(EJSON.equals({ a: 1, b: 2 }, { a: 1, c: 3, b: 2 }))
  assert.isFalse(EJSON.equals({ a: 1, b: 2, c: 3 }, { a: 1, b: 2 }))
  assert.isFalse(EJSON.equals({ a: 1, b: 2, c: 3 }, { a: 1, c: 3, b: 4 }))
  assert.isFalse(EJSON.equals({ a: {} }, { a: { b: 2 } }))
  assert.isFalse(EJSON.equals({ a: { b: 2 } }, { a: {} }))

  /**
   * Objects and Arrays were previously mistaken, which is why
   * we add some extra tests for them here.
   */
  assert.isTrue(EJSON.equals([1, 2, 3, 4, 5], [1, 2, 3, 4, 5]))
  assert.isFalse(EJSON.equals([1, 2, 3, 4, 5], [1, 2, 3, 4]))
  assert.isFalse(EJSON.equals([1, 2, 3, 4], { 0: 1, 1: 2, 2: 3, 3: 4 }))
  assert.isFalse(EJSON.equals({ 0: 1, 1: 2, 2: 3, 3: 4 }, [1, 2, 3, 4]))
  assert.isFalse(EJSON.equals({}, []))
  assert.isFalse(EJSON.equals([], {}))
})

test('equality and falsiness', () => {
  assert.isTrue(EJSON.equals(null, null))
  assert.isTrue(EJSON.equals(undefined, undefined))
  assert.isFalse(EJSON.equals({ foo: 'foo' }, null))
  assert.isFalse(EJSON.equals(null, { foo: 'foo' }))
  assert.isFalse(EJSON.equals(undefined, { foo: 'foo' }))
  assert.isFalse(EJSON.equals({ foo: 'foo' }, undefined))
})

test('NaN and Inf', () => {
  assert.equal(EJSON.parse('{"$InfNaN": 1}'), Infinity)
  assert.equal(EJSON.parse('{"$InfNaN": -1}'), -Infinity)
  assert.isTrue(Number.isNaN(EJSON.parse('{"$InfNaN": 0}')))
  assert.equal(EJSON.parse(EJSON.stringify(Infinity)), Infinity)
  assert.equal(EJSON.parse(EJSON.stringify(-Infinity)), -Infinity)
  assert.isTrue(Number.isNaN(EJSON.parse(EJSON.stringify(NaN))))
  assert.isTrue(EJSON.equals(NaN, NaN))
  assert.isTrue(EJSON.equals(Infinity, Infinity))
  assert.isTrue(EJSON.equals(-Infinity, -Infinity))
  assert.isFalse(EJSON.equals(Infinity, -Infinity))
  assert.isFalse(EJSON.equals(Infinity, NaN))
  assert.isFalse(EJSON.equals(Infinity, 0))
  assert.isFalse(EJSON.equals(NaN, 0))

  assert.isTrue(
    EJSON.equals(EJSON.parse('{"a": {"$InfNaN": 1}}'), { a: Infinity }),
  )
  assert.isTrue(EJSON.equals(EJSON.parse('{"a": {"$InfNaN": 0}}'), { a: NaN }))
})

test('clone', () => {
  const cloneTest = (x: any) => {
    const y = EJSON.clone(x)

    assert.isTrue(EJSON.equals(x, y))

    assert.deepEqual(x, y)
  }

  cloneTest(null)
  cloneTest(undefined)
  cloneTest(42)
  cloneTest('asdf')
  cloneTest([1, 2, 3])
  cloneTest([1, 'fasdf', { foo: 42 }])
  cloneTest({ x: 42, y: 'asdf' })

  /**
   * The following is for compatibility reasons.
   */

  function testCloneArgs() {
    // eslint-disable-next-line prefer-rest-params
    const clonedArgs = EJSON.clone(arguments)
    assert.deepEqual(clonedArgs, [1, 2, 'foo', [4]])
  }

  // @ts-ignore
  testCloneArgs(1, 2, 'foo', [4])
})

test('stringify', () => {
  assert.equal(EJSON.stringify(null), 'null')
  assert.equal(EJSON.stringify(true), 'true')
  assert.equal(EJSON.stringify(false), 'false')
  assert.equal(EJSON.stringify(123), '123')
  assert.equal(EJSON.stringify('abc'), '"abc"')

  assert.equal(EJSON.stringify([1, 2, 3]), '[1,2,3]')
  assert.equal(
    EJSON.stringify([1, 2, 3], { indent: true }),
    '[\n  1,\n  2,\n  3\n]',
  )
  assert.equal(EJSON.stringify([1, 2, 3], { canonical: false }), '[1,2,3]')
  assert.equal(
    EJSON.stringify([1, 2, 3], { indent: true, canonical: false }),
    '[\n  1,\n  2,\n  3\n]',
  )

  assert.equal(
    EJSON.stringify([1, 2, 3], { indent: 4 }),
    '[\n    1,\n    2,\n    3\n]',
  )
  assert.equal(
    EJSON.stringify([1, 2, 3], { indent: '--' }),
    '[\n--1,\n--2,\n--3\n]',
  )

  assert.equal(
    EJSON.stringify({ b: [2, { d: 4, c: 3 }], a: 1 }, { canonical: true }),
    '{"a":1,"b":[2,{"c":3,"d":4}]}',
  )
  assert.equal(
    EJSON.stringify(
      { b: [2, { d: 4, c: 3 }], a: 1 },
      {
        indent: true,
        canonical: true,
      },
    ),
    '{\n' +
      '  "a": 1,\n' +
      '  "b": [\n' +
      '    2,\n' +
      '    {\n' +
      '      "c": 3,\n' +
      '      "d": 4\n' +
      '    }\n' +
      '  ]\n' +
      '}',
  )
  assert.equal(
    EJSON.stringify({ b: [2, { d: 4, c: 3 }], a: 1 }, { canonical: false }),
    '{"b":[2,{"d":4,"c":3}],"a":1}',
  )
  assert.equal(
    EJSON.stringify(
      { b: [2, { d: 4, c: 3 }], a: 1 },
      { indent: true, canonical: false },
    ),
    '{\n' +
      '  "b": [\n' +
      '    2,\n' +
      '    {\n' +
      '      "d": 4,\n' +
      '      "c": 3\n' +
      '    }\n' +
      '  ],\n' +
      '  "a": 1\n' +
      '}',
  )

  // @todo Handle circular structures.
  //
  // assert.throws(() => {
  //   const col = new Mongo.Collection('test')
  //   EJSON.stringify(col)
  // }, /Converting circular structure to JSON/)
})

test('parse', () => {
  assert.deepEqual(EJSON.parse('[1,2,3]'), [1, 2, 3])

  assert.throws(() => {
    EJSON.parse(null)
  }, /argument should be a string/)
})

test('regexp', () => {
  assert.deepEqual(EJSON.stringify(/foo/gi), '{"$regexp":"foo","$flags":"gi"}')

  const d = new RegExp('hello world', 'gi')

  assert.deepEqual(
    EJSON.stringify(d),
    '{"$regexp":"hello world","$flags":"gi"}',
  )

  const obj = { $regexp: 'foo', $flags: 'gi' }

  const eObj = EJSON.toJSONValue(obj)
  const roundTrip = EJSON.fromJSONValue(eObj)

  assert.deepEqual(obj, roundTrip)
})

test('handle objects with length property', () => {
  class Widget {
    length: number

    constructor() {
      this.length = 10
    }
  }

  const widget = new Widget()

  const toJsonWidget = EJSON.toJSONValue(widget)
  assert.deepEqual(widget, toJsonWidget)

  const fromJsonWidget = EJSON.fromJSONValue(widget)
  assert.deepEqual(widget, fromJsonWidget)

  const strWidget = EJSON.stringify(widget)
  assert.equal(strWidget, '{"length":10}')

  const parsedWidget = EJSON.parse('{"length":10}')
  assert.deepEqual({ length: 10 }, parsedWidget)

  // @ts-ignore
  assert.isFalse(EJSON.isBinary(widget))

  const widget2 = new Widget()

  assert.deepEqual(widget, widget2)

  const clonedWidget = EJSON.clone(widget)
  assert.deepEqual(widget, clonedWidget)
})
