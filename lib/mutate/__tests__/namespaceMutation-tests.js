'use strict';

require('babel-register');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _clientSchema = require('../../__tests__/clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

var _namespaceMutation9 = require('../namespaceMutation');

var _namespaceMutation10 = _interopRequireDefault(_namespaceMutation9);

var _parseSortPrint = require('../../__tests__/parseSortPrint');

var _utils = require('../../utils');

var _namespaceMutationData = require('./namespaceMutation-data');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* variableDefinitions Tests */
(0, _ava2.default)('creates simple variableDefinitions from mutation arguments, ignore hardcoded args', function (t) {
  var expectedRaw = '\n  mutation($postId: String!) {\n    createComment(postId: $postId, content: "foo") {\n      _id,\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.createCommentWithId);

  var _namespaceMutation = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});

(0, _ava2.default)('throws when trying to pass in a bogus argument', function (t) {
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.badArg);
  t.throws(function () {
    return (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default);
  });
});

(0, _ava2.default)('creates variableDefinitions with different names', function (t) {
  var expectedRaw = '\n  mutation($postIdz: String!) {\n    createComment(postId: $postIdz) {\n      _id,\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.createCommentDifferentArg);

  var _namespaceMutation2 = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation2.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});

(0, _ava2.default)('allows for variables inside hardcoded object args', function (t) {
  var expectedRaw = '\n  mutation($postIdz: String!) {\n    createPost(newPost: {_id: $postIdz}) {\n      _id,\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.mixHardSoftArgs);

  var _namespaceMutation3 = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation3.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});

(0, _ava2.default)('creates required list variableDefinitions from mutation arguments', function (t) {
  var expectedRaw = 'mutation ($newMembers: [NewMember!]!) {\n    createMembers(members: $newMembers) {\n      __typename\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.createMembers);

  var _namespaceMutation4 = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation4.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});

/* Inlining Tests */
(0, _ava2.default)('turns all fragment spreads to inline fragments', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129"}) {\n      post {\n        ... on PostType {\n          ... on PostType {\n            createdAt\n          }\n        }\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.nestedFragmentSpreads);

  var _namespaceMutation5 = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation5.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});

/* Namespacing Tests */
(0, _ava2.default)('aliases all fields with arguments', function (t) {
  var expectedRaw = '\n  mutation {\n    createPost(newPost: {_id: "129"}) {\n      post {\n        CASHAY_component1_title: title(language:"spanish"),\n        CASHAY_component1_englishTitle: title(language:"english")\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.postSpanishTitle);

  var _namespaceMutation6 = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation6.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});

(0, _ava2.default)('augments the variables object with required fields from state', function (t) {
  var expectedRaw = '\n  mutation ($newPostId: String!, $CASHAY_component1_defaultLanguage: String, $CASHAY_component1_secondaryLanguage: String) {\n    createPost(newPost: {_id: $newPostId}) {\n      post {\n        CASHAY_component1_title: title(language: $defaultLanguage),\n        CASHAY_component1_englishTitle: title(language: $secondaryLanguage)\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.postSpanishTitleVars);
  var stateVars = {
    defaultLanguage: 'spanish',
    secondaryLanguage: 'english'
  };

  var _namespaceMutation7 = (0, _namespaceMutation10.default)(mutationAST, 'component1', stateVars, _clientSchema2.default),
      namespaceAST = _namespaceMutation7.namespaceAST,
      variableEnhancers = _namespaceMutation7.variableEnhancers;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  var actualVariables = variableEnhancers.reduce(function (reduction, enhancer) {
    return enhancer(reduction);
  }, {});
  var expectedVariables = {
    CASHAY_component1_defaultLanguage: 'spanish',
    CASHAY_component1_secondaryLanguage: 'english'
  };
  t.is(actual, expected);
  t.deepEqual(actualVariables, expectedVariables);
});

(0, _ava2.default)('allows for field variables inside hardcoded object args', function (t) {
  var expectedRaw = '\n  mutation($CASHAY_component1_day: Boolean, $CASHAY_component1_year: Boolean) {\n    createPost(newPost: {_id: "123"}) {\n      post {\n        CASHAY_component1_createdAt: createdAt(dateOptions: {day: $day, month: true, year: $year})\n      }\n    }\n  }';
  var expected = (0, _parseSortPrint.parseSortPrint)(expectedRaw);
  var mutationAST = (0, _utils.parse)(_namespaceMutationData.mixPostFieldArgs);

  var _namespaceMutation8 = (0, _namespaceMutation10.default)(mutationAST, 'component1', {}, _clientSchema2.default),
      namespaceAST = _namespaceMutation8.namespaceAST;

  var actual = (0, _parseSortPrint.sortPrint)(namespaceAST);
  t.is(actual, expected);
});