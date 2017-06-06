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

var getRecentPostsQuery = '\n  query ($nay: String){\n    getRecentPosts (nay: $nay) {\n      _id\n      title\n    }\n  }\n';
var variables = {
  nay: 'test'
};

(0, _ava2.default)('test bad argument', function (t) {
  try {
    _Cashay2.default.query(getRecentPostsQuery, {
      op: 'getRecentPosts',
      variables: variables
    });
    t.fail();
  } catch (e) {
    t.pass();
  }
});