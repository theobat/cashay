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
let unsubscribe = store.subscribe(getRecentPostsQueryCashay)

const getRecentPostsQuery = `
  query ($first: Int, $afterCursor: String){
    getRecentPosts (first:$first, afterCursor: $afterCursor) {
      _id
      title
    }
  }
`
const variables = {
  first: 10,
  afterCursor: '1411111111111' + 'chikachikow'
}
function getRecentPostsQueryCashay () {
  return cashay.query(getRecentPostsQuery, {
    op: 'getRecentPosts',
    variables,
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

getRecentPostsQueryCashay()
test('postCount query and mutation invalidation', t => {
  const firstCall = getRecentPostsQueryCashay()
  console.log(firstCall)
  return removePostByIdCashay().then(
    () => {
      return getRecentPostsQueryCashay()
    }
  ).then(function() {
        return new Promise(function (resolve) {
             setTimeout(resolve, 10)
        })
    }
  ).then(
    () => {
      const secondCall = getRecentPostsQueryCashay()
      console.log(secondCall)
    }
  )
})
