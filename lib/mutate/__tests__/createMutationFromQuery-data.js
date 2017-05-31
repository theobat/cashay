"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var queryCommentsForPostId = exports.queryCommentsForPostId = "\nquery($postId: String!) {\n  comments: getCommentsByPostId(postId: $postId) {\n    _id\n  }\n}";

var mutationForCommentQueryNoVars = exports.mutationForCommentQueryNoVars = "\nmutation {\n  createComment {\n    _id\n  }\n}";

var mutationForCommentQuery = exports.mutationForCommentQuery = "\nmutation {\n  createComment (_id: $_id, postId: $postId, content: $content) {\n    _id\n  }\n}";

var queryMultipleComments = exports.queryMultipleComments = "\nquery($postId: String!, $postId2: String!) {\n  comments: getCommentsByPostId(postId: $postId) {\n    _id\n  }\n  comments2: getCommentsByPostId(postId: $postId2) {\n    createdAt\n  }\n}";

var mutationForMultipleComments = exports.mutationForMultipleComments = "\nmutation {\n  createComment (_id: $_id, postId: $postId, content: $content) {\n    _id\n    createdAt\n  }\n}";

var queryPost = exports.queryPost = "\n  query($first: Int!) {\n    getRecentPosts(count: $first) {\n      _id,\n    }\n  }";

var mutatePost = exports.mutatePost = "\nmutation {\n  createPost {\n    post {\n      _id\n    }\n  }\n}";

var queryPostWithFieldVars = exports.queryPostWithFieldVars = "\n  query($first: Int!, $defaultLanguage: String, $secondaryLanguage: String) {\n    getRecentPosts(count: $first) {\n      title(language: $defaultLanguage),\n      secondaryTitle: title(language: $secondaryLanguage)\n    }\n  }";

var mutatePostWithFieldVars = exports.mutatePostWithFieldVars = "\nmutation {\n  createPost {\n    post {\n      title(language: $defaultLanguage),\n      secondaryTitle: title(language: $secondaryLanguage)\n    }\n  }\n}";

var queryPostCount = exports.queryPostCount = "\n  query {\n    getPostCount\n  }";

var mutatePostCount = exports.mutatePostCount = "\nmutation {\n  createPost {\n    postCount\n  }\n}";

var queryPostCountAliased = exports.queryPostCountAliased = "\n  query {\n    postCount: getPostCount\n  }";

var queryPostWithInlineFieldVars = exports.queryPostWithInlineFieldVars = "\n  query($first: Int!, $defaultLanguage: String, $secondaryLanguage: String) {\n    getRecentPosts(count: $first) {\n      ... on PostType {\n        title(language: $defaultLanguage),\n        secondaryTitle: title(language: $secondaryLanguage)\n      }\n    }\n  }";

var mutatePostWithInlineFieldVars = exports.mutatePostWithInlineFieldVars = "\nmutation {\n  createPost {\n    post {\n      ... on PostType {\n        title(language: $defaultLanguage),\n        secondaryTitle: title(language: $secondaryLanguage)\n      }\n    }\n  }\n}";

var queryMultiplePosts = exports.queryMultiplePosts = "\nquery {\n  getLatestPost {\n    _id\n  }\n  getRecentPosts {\n    createdAt\n  }\n}";

var mutationForMultiplePosts = exports.mutationForMultiplePosts = "\nmutation {\n  createPost {\n    post {\n      _id\n      createdAt\n    }\n  }\n}";