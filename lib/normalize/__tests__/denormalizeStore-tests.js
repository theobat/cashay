'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

require('babel-register');

var _utils = require('../../utils');

var _denormalizeStore = require('../denormalizeStore');

var _denormalizeStore2 = _interopRequireDefault(_denormalizeStore);

var _dataUnion = require('./data-union');

var _data = require('./data');

var _clientSchema = require('../../__tests__/clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

var _dataPagination = require('./data-pagination');

var _dataPaginationBack = require('./data-pagination-back');

var _dataPaginationFront = require('./data-pagination-front');

var _parseAndInitializeQuery = require('../../query/parseAndInitializeQuery');

var _parseAndInitializeQuery2 = _interopRequireDefault(_parseAndInitializeQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var idFieldName = '_id';

(0, _ava2.default)('denormalize store from recursive union request', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_dataUnion.unionQueryString, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _dataUnion.unionStoreFull;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = _dataUnion.unionResponse.data;

  t.deepEqual(actual, expected);
});

(0, _ava2.default)('denormalize store when the query returns a scalar (String)', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_data.queryPostCount, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _data.storedPostCount;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = { "postCount": 4 };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('denormalize store with missing scalar data', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_dataPagination.back1Query, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _dataPagination.back1StoreNoCursor;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = (0, _dataPagination.back1NoCursorDenormalizedFn)();
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('denormalize store with missing entity and array', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_dataUnion.unionQueryString, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _dataUnion.unionStoreMissingOwnerMembers;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = _dataUnion.unionMissingOwnerMembersDenormalized;
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('throws on bad pagination args', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_dataPagination.back1QueryBadArgs, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _dataPagination.back1Store;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords
  });
  t.throws(function () {
    return (0, _denormalizeStore2.default)(context);
  }, 'Supplying pagination cursors to cashay is not supported. undefined');
});

(0, _ava2.default)('denormalize store with scalar fields with args', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_data.queryWithSortedArgs, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _data.storeFromSortedArgs;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords,
    variables: { reverse: true, lang: "spanish" }
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = _data.responseFromSortedArgs.data;

  t.deepEqual(actual, expected);
});

(0, _ava2.default)('get a page from a full store (back)', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_dataPaginationBack.back4, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _dataPagination.fullPostStore;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords,
    variables: { reverse: true, lang: "spanish" }
  });
  var actual = (0, _denormalizeStore2.default)(context);

  var _back4ResponseFn = (0, _dataPaginationBack.back4ResponseFn)(4),
      expected = _back4ResponseFn.data;

  t.deepEqual(actual, expected);
});

(0, _ava2.default)('request an array that does not exist in the state', function (t) {
  var queryAST = (0, _parseAndInitializeQuery2.default)(_dataPagination.back1Query, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _data.emptyInitialState;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default,
    paginationWords: _data.paginationWords,
    variables: { reverse: true, lang: "spanish" }
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = { "getRecentPosts": [] };
  t.deepEqual(actual, expected);
});

(0, _ava2.default)('flag sendToServer = true for array of objects', function (t) {
  var rawQuery = '\n  query {\n    getPostById (_id: "p126") {\n      _id\n      keywordsMentioned {\n        word\n      }\n    }\n  }';
  var queryAST = (0, _parseAndInitializeQuery2.default)(rawQuery, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return _data.emptyInitialState;
    },
    idFieldName: idFieldName,
    schema: _clientSchema2.default
  });
  (0, _denormalizeStore2.default)(context);
  //                                    getPostById ->           keywordsMentioned ->       word
  t.true(context.operation.selectionSet.selections[0].selectionSet.selections[1].selectionSet.selections[0].sendToServer);
});

(0, _ava2.default)('Same query with another argument', function (t) {
  var rawQuery = '\n  query {\n    getCommentsByPostId {\n      _id\n      postId\n      content\n    }\n  }';
  var queryAST = (0, _parseAndInitializeQuery2.default)(rawQuery, _clientSchema2.default, idFieldName);
  var context = (0, _utils.buildExecutionContext)(queryAST, {
    variables: { "postId": "p126" },
    coerceTypes: _data.coerceTypes,
    getState: function getState() {
      return { entities: {}, result: { getCommentsByPostId: { '"postId": "p123"': [] } } };
    },
    idFieldName: idFieldName,
    paginationWords: _data.paginationWords,
    schema: _clientSchema2.default
  });
  var actual = (0, _denormalizeStore2.default)(context);
  var expected = { getCommentsByPostId: [{ _id: null, postId: null, content: null }] };
  t.deepEqual(actual, expected);
});