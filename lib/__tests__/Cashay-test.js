'use strict';

require('babel-register');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _clientSchema = require('./clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)('caches a partial query result', function (t) {
  t.is(1, 1);
});