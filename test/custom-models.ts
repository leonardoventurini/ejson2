import { EJSON } from '../src/ejson'

class Address {
  city: string
  state: string

  constructor(city, state) {
    this.city = city
    this.state = state
  }

  typeName() {
    return 'Address'
  }

  toJSONValue() {
    return {
      city: this.city,
      state: this.state,
    }
  }
}

class Person {
  name: string
  dob: string
  address: string

  constructor(name, dob, address) {
    this.name = name
    this.dob = dob
    this.address = address
  }

  typeName() {
    return 'Person'
  }

  toJSONValue() {
    return {
      name: this.name,
      dob: EJSON.toJSONValue(this.dob),
      address: EJSON.toJSONValue(this.address),
    }
  }
}

class Holder {
  content: any

  constructor(content) {
    this.content = content
  }

  typeName() {
    return 'Holder'
  }

  toJSONValue() {
    return this.content
  }
}

const addTypes = () => {
  EJSON.addType(
    'Person',
    value =>
      new Person(
        value.name,
        EJSON.fromJSONValue(value.dob),
        EJSON.fromJSONValue(value.address),
      ),
  )
  EJSON.addType('Address', value => new Address(value.city, value.state))
  EJSON.addType('Holder', value => new Holder(value))
}

export const CustomModels = {
  Address,
  Person,
  Holder,

  addTypes,
}
