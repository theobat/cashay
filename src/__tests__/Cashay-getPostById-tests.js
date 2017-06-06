import 'babel-register';
import 'babel-polyfill';
import test from 'ava';
import clientSchema from './clientSchema.json';
import schema from './schema.js';
import cashay from '../Cashay'
import cashayReducer from '../normalize/duck';
import MockTransport from '../transports/__test__/MockTransport'
import {createStore, combineReducers} from 'redux'

// Note: this test fails if graphql returns null for a getPostByi

// Initialize mockstore with empty state
const initialState = {}
const store = createStore(combineReducers({cashay: cashayReducer}), initialState)
cashay.create({schema: clientSchema, store, httpTransport: new MockTransport(schema)})
let unsubscribe = store.subscribe(postCashayQuery)

const postQuery = `
  query ($postId: String!) {
    getPostById (_id: $postId) {
      _id
      content
      title
    }
  }
`
const key = 'p124'
const variables = {postId: key}

function postCashayQuery () {
  return cashay.query(postQuery, {
    op: 'getPostById',
    variables,
    key,
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
        console.log('removePostById mutationHandlers')
        invalidate()
        // console.log({optimisticVariables, queryResponse, currentResponse, getEntities})
      }
    }
  })
}

function removePostByIdCashay () {
  return cashay.mutate('removePostById', {variables: {postId: 'p124'}})
}

postCashayQuery()
test('getPost - mutation to remove it - invalidate getPost - verify it is gone', t => {
  const firstCall = postCashayQuery()
  return removePostByIdCashay().then(
    () => {
      console.log('post mutation')
      return postCashayQuery()
    }
  ).then(function() {
        return new Promise(function (resolve) {
             setTimeout(resolve, 10)
        })
    }
  ).then(
    () => {
      const secondCall = postCashayQuery()
      console.log(secondCall)
    }
  )
})
