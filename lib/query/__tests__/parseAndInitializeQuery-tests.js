'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

require('babel-register');

var _parseAndInitializeQuery = require('../parseAndInitializeQuery');

var _parseAndInitializeQuery2 = _interopRequireDefault(_parseAndInitializeQuery);

var _clientSchema = require('../../__tests__/clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

var _parseSortPrint = require('../../__tests__/parseSortPrint');

var _parseAndInitializeQueryData = require('./parseAndInitializeQuery-data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)('inline a fragment spread', function (t) {
  var initializedAST = (0, _parseAndInitializeQuery2.default)(_parseAndInitializeQueryData.fragmentQueryString, _clientSchema2.default, '_id');
  var actual = (0, _parseSortPrint.sortPrint)(initializedAST);
  var expected = (0, _parseSortPrint.parseSortPrint)(_parseAndInitializeQueryData.inlineQueryString);
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('add an id field to the request', function (t) {
  var initializedAST = (0, _parseAndInitializeQuery2.default)(_parseAndInitializeQueryData.inlineQueryStringWithoutId, _clientSchema2.default, '_id');
  var actual = (0, _parseSortPrint.sortPrint)(initializedAST);
  var expected = (0, _parseSortPrint.parseSortPrint)(_parseAndInitializeQueryData.inlineQueryString);
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('add a __typename field to the union request', function (t) {
  var initializedAST = (0, _parseAndInitializeQuery2.default)(_parseAndInitializeQueryData.unionQueryStringWithoutTypename, _clientSchema2.default, '_id');
  var actual = (0, _parseSortPrint.sortPrint)(initializedAST);
  var expected = (0, _parseSortPrint.parseSortPrint)(_parseAndInitializeQueryData.unionQueryString);
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('remove extra __typename and id fields from fragments', function (t) {
  var initializedAST = (0, _parseAndInitializeQuery2.default)(_parseAndInitializeQueryData.unionQueryStringWithExtraTypenameId, _clientSchema2.default, '_id');
  var actual = (0, _parseSortPrint.sortPrint)(initializedAST);
  var expected = (0, _parseSortPrint.parseSortPrint)(_parseAndInitializeQueryData.unionQueryString);
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('sort arguments by name', function (t) {
  var initializedAST = (0, _parseAndInitializeQuery2.default)(_parseAndInitializeQueryData.queryWithUnsortedArgs, _clientSchema2.default, '_id');
  var actual = (0, _parseSortPrint.sortPrint)(initializedAST);
  var expected = (0, _parseSortPrint.parseSortPrint)(_parseAndInitializeQueryData.queryWithSortedArgs);
  t.deepEqual(actual, expected);
});