"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var createCommentWithId = exports.createCommentWithId = "\n  mutation {\n    createComment(postId: $postId, content: \"foo\") {\n      _id,\n    }\n  }";

var createCommentDifferentArg = exports.createCommentDifferentArg = "\n  mutation {\n    createComment(postId: $postIdz) {\n      _id,\n    }\n  }";

var badArg = exports.badArg = "\n  mutation {\n    createComment(postIdz: $postIdz) {\n      _id,\n    }\n  }";

var createMembers = exports.createMembers = "mutation {\n    createMembers(members: $newMembers) {\n      __typename\n    }\n  }";

var mixHardSoftArgs = exports.mixHardSoftArgs = "\n  mutation {\n    createPost(newPost: {_id: $postIdz}) {\n      _id,\n    }\n  }";

var nestedFragmentSpreads = exports.nestedFragmentSpreads = "\nmutation {\n  createPost(newPost: {_id: \"129\"}) {\n    post {\n      ... {\n        ...spreadLevel1\n      }\n    }\n  }\n}\nfragment spreadLevel1 on PostType {\n  \t... {\n      ...spreadLevel2\n    }\n}\nfragment spreadLevel2 on PostType {\n  createdAt\n}";

var postSpanishTitle = exports.postSpanishTitle = "\n  mutation {\n    createPost(newPost: {_id: \"129\"}) {\n      post {\n        title(language:\"spanish\")\n        englishTitle: title(language:\"english\")\n      }\n    }\n  }";

var postSpanishTitleVars = exports.postSpanishTitleVars = "\n  mutation {\n    createPost(newPost: {_id: $newPostId}) {\n      post {\n        title(language: $defaultLanguage),\n        englishTitle: title(language: $secondaryLanguage)\n      }\n    }\n  }";

var mixPostFieldArgs = exports.mixPostFieldArgs = "\n  mutation {\n    createPost(newPost: {_id: \"123\"}) {\n      post {\n        createdAt(dateOptions: {day: $day, month: true, year: $year})\n      }\n    }\n  }";