'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPostWithCrazyFrags2 = exports.typedInlineFrag2 = exports.typedInlineFrag1 = exports.createPostWithSpanishTitle = exports.createPostWithDifferentId = exports.createPostWithBadArgKind = exports.createPostWithIncompleteArgs = exports.createPostWithPostId = exports.createPostWithPostTitleAndCount = exports.createCommentWithContent = exports.createCommentWithId2 = exports.createCommentWithId = exports.parseAndNamespace = undefined;

var _utils = require('../../utils');

var _namespaceMutation2 = require('../namespaceMutation');

var _namespaceMutation3 = _interopRequireDefault(_namespaceMutation2);

var _clientSchema = require('../../__tests__/clientSchema.json');

var _clientSchema2 = _interopRequireDefault(_clientSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var parseAndNamespace = exports.parseAndNamespace = function parseAndNamespace(cachedSingles) {
  return cachedSingles.map(function (single, idx) {
    var ast = (0, _utils.parse)(single);
    var componentId = 'component' + idx;

    var _namespaceMutation = (0, _namespaceMutation3.default)(ast, componentId, {}, _clientSchema2.default),
        namespaceAST = _namespaceMutation.namespaceAST;

    return namespaceAST;
  });
};

var createCommentWithId = exports.createCommentWithId = '\n  mutation($postId: String!, $content: String!) {\n    createComment(postId: $postId, content: $content) {\n      _id,\n    }\n  }';

var createCommentWithId2 = exports.createCommentWithId2 = '\n  mutation($postId: String!, $content: String!, $_id: String!) {\n    createComment(postId: $postId, content: $content, _id: $_id) {\n      _id,\n    }\n  }';

var createCommentWithContent = exports.createCommentWithContent = '\n  mutation($postId: String!, $content: String!) {\n    createComment(postId: $postId, content: $content) {\n      content\n    }\n  }';

var createPostWithPostTitleAndCount = exports.createPostWithPostTitleAndCount = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        title\n      }\n      postCount\n    }\n  }';

var createPostWithPostId = exports.createPostWithPostId = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        _id\n      }\n    }\n  }';

var createPostWithIncompleteArgs = exports.createPostWithIncompleteArgs = '\n  mutation {\n    createPost(newPost: {_id: "129"}) {\n      post {\n        _id\n      }\n    }\n  }';

var createPostWithBadArgKind = exports.createPostWithBadArgKind = '\n  mutation {\n    createPost(newPost: "foo") {\n      post {\n        _id\n      }\n    }\n  }';

var createPostWithDifferentId = exports.createPostWithDifferentId = '\n  mutation {\n    createPost(newPost: {_id: "130"}) {\n      post {\n        _id\n      }\n    }\n  }';

var createPostWithSpanishTitle = exports.createPostWithSpanishTitle = '\n  mutation {\n    createPost(newPost: {_id: "129", author: "a123", content: "X", title:"Y", category:"hot stuff"}) {\n      post {\n        title(language:"spanish")\n      }\n    }\n  }';

var typedInlineFrag1 = exports.typedInlineFrag1 = '\nmutation {\n  createPost(newPost: {_id: "129"}) {\n    post {\n      ... on PostType {\n        title\n      }\n    }\n  }\n}';

var typedInlineFrag2 = exports.typedInlineFrag2 = '\nmutation {\n  createPost(newPost: {_id: "129"}) {\n    post {\n      ... on PostType {\n        category\n      }\n    }\n  }\n}';

var createPostWithCrazyFrags2 = exports.createPostWithCrazyFrags2 = '\nmutation {\n  createPost(newPost: {_id: "129", author: "a123", content: "Hii", title:"Sao", category:"hot stuff"}) {\n    post {\n      ...{\n        _id\n      }\n      ...spreadLevel1\n    }\n  }\n}\nfragment spreadLevel1 on PostType {\n  \t... {\n      category\n      ...spreadLevel2\n    }\n}\nfragment spreadLevel2 on PostType {\n  title(language:"spanish")\n}';