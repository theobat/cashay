'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

require('babel-register');

require('babel-polyfill');

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

// Initialize mockstore with empty state
var initialState = {};
var store = (0, _redux.createStore)((0, _redux.combineReducers)({ cashay: _duck2.default }), initialState);
_Cashay2.default.create({ schema: _clientSchema2.default, store: store, httpTransport: new _MockTransport2.default(_schema2.default) });
var unsubscribe = store.subscribe(getRecentPostsQueryCashay);

var getRecentPostsQuery = '\n  query ($first: Int, $afterCursor: String){\n    getRecentPosts (first:$first, afterCursor: $afterCursor) {\n      _id\n      title\n    }\n  }\n';
var variables = {
  first: 10,
  afterCursor: '1411111111111' + 'chikachikow'
};
function getRecentPostsQueryCashay() {
  return _Cashay2.default.query(getRecentPostsQuery, {
    op: 'getRecentPosts',
    variables: variables,
    customMutations: {
      removePostById: '\n        mutation ($postId: String!) {\n          removePostById (postId: $postId) {\n            removedPostId\n          }\n        }\n      '
    },
    mutationHandlers: {
      removePostById: function removePostById(optimisticVariables, queryResponse, currentResponse, getEntities, invalidate) {
        invalidate();
      }
    }
  });
}

function removePostByIdCashay() {
  return _Cashay2.default.mutate('removePostById', { variables: { postId: 'p124' } });
}

getRecentPostsQueryCashay();
(0, _ava2.default)('postCount query and mutation invalidation', function (t) {
  var firstCall = getRecentPostsQueryCashay();
  console.log(firstCall);
  return removePostByIdCashay().then(function () {
    return getRecentPostsQueryCashay();
  }).then(function () {
    return new Promise(function (resolve) {
      setTimeout(resolve, 10);
    });
  }).then(function () {
    var secondCall = getRecentPostsQueryCashay();
    console.log(secondCall);
  });
});