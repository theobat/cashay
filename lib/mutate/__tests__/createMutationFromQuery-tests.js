'use strict';

require('babel-register');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _clientSchema = require('../../__tests__/clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

var _createMutationFromQuery = require('../createMutationFromQuery');

var _createMutationFromQuery2 = _interopRequireDefault(_createMutationFromQuery);

var _parseSortPrint = require('../../__tests__/parseSortPrint');

var _utils = require('../../utils');

var _createMutationFromQueryData = require('./createMutationFromQuery-data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)('creates basic mutation from a query of many comments', function (t) {
  var queryAST = (0, _utils.parse)(_createMutationFromQueryData.queryCommentsForPostId);
  var expected = (0, _parseSortPrint.parseSortPrint)(_createMutationFromQueryData.mutationForCommentQueryNoVars);
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createComment', {}, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates arguments from mutation variables', function (t) {
  var queryAST = (0, _utils.parse)(_createMutationFromQueryData.queryCommentsForPostId);
  var expected = (0, _parseSortPrint.parseSortPrint)(_createMutationFromQueryData.mutationForCommentQuery);
  var variables = {
    _id: 'a321',
    postId: 'p123',
    content: 'X'
  };
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createComment', variables, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates basic mutation from multi-part query', function (t) {
  var queryMultipleComments = '\n  query($postId: String!, $postId2: String!) {\n    comments: getCommentsByPostId(postId: $postId) {\n      _id\n    }\n    comments2: getCommentsByPostId(postId: $postId2) {\n      createdAt\n    }\n  }';
  var mutationForMultipleComments = '\n  mutation {\n    createComment (_id: $_id, postId: $postId, content: $content) {\n      _id\n      createdAt\n    }\n  }';

  var queryAST = (0, _utils.parse)(queryMultipleComments);
  var expected = (0, _parseSortPrint.parseSortPrint)(mutationForMultipleComments);
  var variables = {
    _id: 'a321',
    postId: 'p123',
    content: 'X'
  };
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createComment', variables, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates payload mutation including an object', function (t) {
  var queryPost = '\n  query($first: Int!) {\n    getRecentPosts(count: $first) {\n      _id,\n    }\n  }';
  var mutatePost = '\n  mutation {\n    createPost {\n      post {\n        _id\n      }\n    }\n  }';
  var queryAST = (0, _utils.parse)(queryPost);
  var expected = (0, _parseSortPrint.parseSortPrint)(mutatePost);
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createPost', {}, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('throws if no mutation can be created', function (t) {
  var queryAST = (0, _utils.parse)(_createMutationFromQueryData.queryPostCount);
  t.throws(function () {
    return (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createPost', {}, _clientSchema2.default);
  });
});

(0, _ava2.default)('creates payload mutation including a scalar matched by name', function (t) {
  var queryPostCountAliased = '\n  query {\n    postCount: getPostCount\n  }';
  var mutatePostCount = '\n  mutation {\n    createPost {\n      postCount\n    }\n  }';
  var queryAST = (0, _utils.parse)(queryPostCountAliased);
  var expected = (0, _parseSortPrint.parseSortPrint)(mutatePostCount);
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createPost', {}, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates payload mutation including an object with args', function (t) {
  var queryPostWithFieldVars = '\n  query($first: Int!, $defaultLanguage: String, $secondaryLanguage: String) {\n    getRecentPosts(count: $first) {\n      title(language: $defaultLanguage),\n      secondaryTitle: title(language: $secondaryLanguage)\n    }\n  }';
  var mutatePostWithFieldVars = '\n  mutation {\n    createPost {\n      post {\n        title(language: $defaultLanguage),\n        secondaryTitle: title(language: $secondaryLanguage)\n      }\n    }\n  }';
  var queryAST = (0, _utils.parse)(queryPostWithFieldVars);
  var expected = (0, _parseSortPrint.parseSortPrint)(mutatePostWithFieldVars);
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createPost', {}, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates payload mutation when query has inline fragment', function (t) {
  var queryPostWithInlineFieldVars = '\n  query($first: Int!, $defaultLanguage: String, $secondaryLanguage: String) {\n    getRecentPosts(count: $first) {\n      ... on PostType {\n        title(language: $defaultLanguage),\n        secondaryTitle: title(language: $secondaryLanguage)\n      }\n    }\n  }';
  var mutatePostWithInlineFieldVars = '\n  mutation {\n    createPost {\n      post {\n        ... on PostType {\n          title(language: $defaultLanguage),\n          secondaryTitle: title(language: $secondaryLanguage)\n        }\n      }\n    }\n  }';
  var queryAST = (0, _utils.parse)(queryPostWithInlineFieldVars);
  var expected = (0, _parseSortPrint.parseSortPrint)(mutatePostWithInlineFieldVars);
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createPost', {}, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates payload mutation from multi-part query', function (t) {
  var queryAST = (0, _utils.parse)(_createMutationFromQueryData.queryMultiplePosts);
  var expected = (0, _parseSortPrint.parseSortPrint)(_createMutationFromQueryData.mutationForMultiplePosts);
  var actualAST = (0, _createMutationFromQuery2.default)(queryAST.definitions[0], 'createPost', {}, _clientSchema2.default);
  var actual = (0, _parseSortPrint.sortPrint)(actualAST);
  t.is(actual, expected);
});