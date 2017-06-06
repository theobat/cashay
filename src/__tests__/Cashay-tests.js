import test from 'ava';
import 'babel-register';
import 'babel-polyfill';
import clientSchema from './clientSchema.json';
import schema from './schema.js';
import cashay from '../Cashay'
import cashayReducer from '../normalize/duck';
import MockTransport from '../transports/__test__/MockTransport'
import {createStore, combineReducers} from 'redux'

// Initialize mockstore with empty state
const initialState = {}
const store = createStore(combineReducers({cashay: cashayReducer}), initialState)
cashay.create({schema: clientSchema, store, httpTransport: new MockTransport(schema)})

const getRecentPostsQuery = `
  query ($nay: String){
    getRecentPosts (nay: $nay) {
      _id
      title
    }
  }
`
const variables = {
  nay: 'test'
}

test('test bad argument', t => {
  try {
    cashay.query(getRecentPostsQuery, {
      op: 'getRecentPosts',
      variables
    })
    t.fail()
  } catch (e) {
    t.pass()
  }

})
