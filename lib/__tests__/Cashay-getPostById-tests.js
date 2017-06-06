'use strict';

require('babel-register');

require('babel-polyfill');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _clientSchema = require('./clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

var _schema = require('./schema.js');

var _schema2 = _interopRequireDefault(_schema);

var _Cashay = require('../Cashay');

var _Cashay2 = _interopRequireDefault(_Cashay);

var _duck = require('../normalize/duck');

var _duck2 = _interopRequireDefault(_duck);

var _MockTransport = require('../transports/__test__/MockTransport');

var _MockTransport2 = _interopRequireDefault(_MockTransport);

var _redux = require('redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Note: this test fails if graphql returns null for a getPostByi

// Initialize mockstore with empty state
var initialState = {};
var store = (0, _redux.createStore)((0, _redux.combineReducers)({ cashay: _duck2.default }), initialState);
_Cashay2.default.create({ schema: _clientSchema2.default, store: store, httpTransport: new _MockTransport2.default(_schema2.default) });
var unsubscribe = store.subscribe(postCashayQuery);

var postQuery = '\n  query ($postId: String!) {\n    getPostById (_id: $postId) {\n      _id\n      content\n      title\n    }\n  }\n';
var key = 'p124';
var variables = { postId: key };

function postCashayQuery() {
  return _Cashay2.default.query(postQuery, {
    op: 'getPostById',
    variables: variables,
    key: key,
    customMutations: {
      removePostById: '\n        mutation ($postId: String!) {\n          removePostById (postId: $postId) {\n            removedPostId\n          }\n        }\n      '
    },
    mutationHandlers: {
      removePostById: function removePostById(optimisticVariables, queryResponse, currentResponse, getEntities, invalidate) {
        console.log('removePostById mutationHandlers');
        invalidate();
        // console.log({optimisticVariables, queryResponse, currentResponse, getEntities})
      }
    }
  });
}

function removePostByIdCashay() {
  return _Cashay2.default.mutate('removePostById', { variables: { postId: 'p124' } });
}

postCashayQuery();
(0, _ava2.default)('getPost - mutation to remove it - invalidate getPost - verify it is gone', function (t) {
  var firstCall = postCashayQuery();
  return removePostByIdCashay().then(function () {
    console.log('post mutation');
    return postCashayQuery();
  }).then(function () {
    return new Promise(function (resolve) {
      setTimeout(resolve, 10);
    });
  }).then(function () {
    var secondCall = postCashayQuery();
    console.log(secondCall);
  });
});