"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fragmentQueryString = exports.fragmentQueryString = "\nquery {\n  getRecentPosts {\n    _id,\n    author {\n      ...getAuthor\n      _id\n    },\n  }\n}\n\nfragment getAuthor on AuthorType {\n  \tname\n}";

var inlineQueryString = exports.inlineQueryString = "\nquery {\n  getRecentPosts {\n    _id,\n    author {\n      ... on AuthorType {\n  \t    name\n      }\n      _id\n    },\n  }\n}";

var inlineQueryStringWithoutId = exports.inlineQueryStringWithoutId = "\nquery {\n  getRecentPosts {\n    author {\n      ... on AuthorType {\n  \t    name\n      }\n      _id\n    },\n  }\n}";

var unionQueryString = exports.unionQueryString = "\nquery {\n  getGroup(_id: \"g123\") {\n    _id\n    owner {\n      __typename\n      _id\n      ... on AuthorType {\n        name\n        twitterHandle\n      }\n    }\n  }\n}";

var unionQueryStringWithoutTypename = exports.unionQueryStringWithoutTypename = "\nquery {\n  getGroup(_id: \"g123\") {\n    _id\n    owner {\n      _id\n      ... on AuthorType {\n        name\n        twitterHandle\n      }\n    }\n  }\n}";

var unionQueryStringWithExtraTypenameId = exports.unionQueryStringWithExtraTypenameId = "\nquery {\n  getGroup(_id: \"g123\") {\n    _id\n    owner {\n      __typename\n      _id\n      ... on AuthorType {\n        __typename\n        _id\n        name\n        twitterHandle\n      }\n    }\n  }\n}";

var queryWithSortedArgs = exports.queryWithSortedArgs = "\nquery {\n  getLatestPost {\n    _id\n\t\ttitle(inReverse: true, language: \"english\")\n  }\n}";

var queryWithUnsortedArgs = exports.queryWithUnsortedArgs = "\nquery {\n  getLatestPost {\n    _id\n\t\ttitle(language: \"english\", inReverse: true)\n  }\n}";