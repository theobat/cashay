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
let unsubscribe = store.subscribe(postCashayCountQuery)

const postCountQuery = `
  query {
    getPostCount
  }
`
function postCashayCountQuery () {
  return cashay.query(postCountQuery, {
    op: 'getPostCount',
    variables: {},
    customMutations: {
      removePostById: `
        mutation ($postId: String!) {
          removePostById (postId: $postId) {
            removedPostId
          }
        }
      `
    },
    mutationHandlers: {
      removePostById: (optimisticVariables, queryResponse, currentResponse, getEntities, invalidate) => {
        invalidate()
      }
    }
  })
}

function removePostByIdCashay () {
  return cashay.mutate('removePostById', {variables: {postId: 'p124'}})
}

postCashayCountQuery()
test('postCount query and mutation invalidation', t => {
  const firstCall = postCashayCountQuery()
  const originalCount = firstCall.data.getPostCount
  return removePostByIdCashay().then(
    () => {
      return postCashayCountQuery()
    }
  ).then(function() {
        return new Promise(function (resolve) {
             setTimeout(resolve, 10)
        })
    }
  ).then(
    () => {
      const secondCall = postCashayCountQuery()
      const newCount = secondCall.data.getPostCount
      const expectedCount = originalCount-1
      t.is(newCount, expectedCount)
    }
  )
})
