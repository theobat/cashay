'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

require('babel-register');

var _clientSchema = require('../../__tests__/clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

var _normalizeResponse = require('../normalizeResponse');

var _normalizeResponse2 = _interopRequireDefault(_normalizeResponse);

var _utils = require('../../utils');

var _dataUnion = require('./data-union');

var _dataPaginationFront = require('./data-pagination-front');

var _dataPaginationBack = require('./data-pagination-back');

var _data = require('./data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)('normalizes unions', function (t) {
  var queryAST = (0, _utils.parse)(_dataUnion.unionQueryString);
  var context = (0, _utils.buildExecutionContext)(queryAST, { idFieldName: '_id', schema: _clientSchema2.default, paginationWords: _data.paginationWords });
  var actual = (0, _normalizeResponse2.default)(_dataUnion.unionResponse.data, context);
  var expected = _dataUnion.unionStoreFull;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('normalize pagination: front 3', function (t) {
  var queryAST = (0, _utils.parse)(_dataPaginationFront.front3Query);
  var context = (0, _utils.buildExecutionContext)(queryAST, { idFieldName: '_id', schema: _clientSchema2.default, paginationWords: _data.paginationWords });
  var actual = (0, _normalizeResponse2.default)(_dataPaginationFront.front3Response.data, context);
  var expected = _dataPaginationFront.front3Store;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('normalize back pagination: back 3', function (t) {
  var queryAST = (0, _utils.parse)(_dataPaginationBack.back3Query);
  var context = (0, _utils.buildExecutionContext)(queryAST, { idFieldName: '_id', schema: _clientSchema2.default, paginationWords: _data.paginationWords });
  var actual = (0, _normalizeResponse2.default)(_dataPaginationBack.back3Response.data, context);
  var expected = _dataPaginationBack.back3Store;
  t.deepEqual(actual, expected);
});