'use strict';

require('babel-register');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _mergeMutations = require('../mergeMutations');

var _mergeMutations2 = _interopRequireDefault(_mergeMutations);

var _parseSortPrint = require('../../__tests__/parseSortPrint');

var _mergeMutationsData = require('./mergeMutations-data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* Tests */
(0, _ava2.default)('throws when merging 2 different mutations', function (t) {
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createCommentWithId, _mergeMutationsData.createPostWithPostTitleAndCount]);
  t.throws(function () {
    return (0, _mergeMutations2.default)(cachedSingles);
  });
});

(0, _ava2.default)('throws when args are of a different kind', function (t) {
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createPostWithBadArgKind, _mergeMutationsData.createPostWithIncompleteArgs]);
  t.throws(function () {
    return (0, _mergeMutations2.default)(cachedSingles);
  });
});

(0, _ava2.default)('merge fields from 2 simple mutation results', function (t) {
  var expectedRaw = '\n  mutation($postId: String!, $content: String!) {\n    createComment(postId: $postId, content: $content) {\n      content\n      _id\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createCommentWithId, _mergeMutationsData.createCommentWithContent]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('merge nested fields from 2 simple payloads', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        _id\n        title\n      }\n      postCount\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createPostWithPostTitleAndCount, _mergeMutationsData.createPostWithPostId]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('merge mutation args', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        _id\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createPostWithPostId, _mergeMutationsData.createPostWithIncompleteArgs]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('throw if incomplete mutation args have different values', function (t) {
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createPostWithIncompleteArgs, _mergeMutationsData.createPostWithDifferentId]);
  t.throws(function () {
    return (0, _mergeMutations2.default)(cachedSingles);
  });
});

(0, _ava2.default)('add an alias when fields have conflicting args', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        CASHAY_component1_title: title(language:"spanish")\n        title\n      }\n      postCount\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createPostWithPostTitleAndCount, _mergeMutationsData.createPostWithSpanishTitle]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('add an alias when fields have conflicting args (reverse order)', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        CASHAY_component0_title: title(language:"spanish")\n        title\n      }\n      postCount\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createPostWithSpanishTitle, _mergeMutationsData.createPostWithPostTitleAndCount]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('merge a typed inline fragment into an existing one', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129"}) {\n      post {\n        ... on PostType {\n          title\n          category\n        }\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.typedInlineFrag1, _mergeMutationsData.typedInlineFrag2]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('merge a typed inline fragment when the target does not have one', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        _id\n        ... on PostType {\n          title\n        }\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.typedInlineFrag1, _mergeMutationsData.createPostWithPostId]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});

(0, _ava2.default)('merge a new variableDefinition', function (t) {
  var expectedRaw = '\n  mutation($postId: String!, $content: String!, $_id: String!) {\n    createComment(postId: $postId, content: $content, _id: $_id) {\n      _id,\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var cachedSingles = (0, _mergeMutationsData.parseAndNamespace)([_mergeMutationsData.createCommentWithId2, _mergeMutationsData.createCommentWithId]);
  var actual = (0, _parseSortPrint.parseSortPrint)((0, _mergeMutations2.default)(cachedSingles));
  t.is(actual, expected);
});