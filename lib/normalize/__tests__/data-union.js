"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var unionQueryString = exports.unionQueryString = "\nquery {\n  getGroup(_id: \"g123\") {\n    _id\n    owner {\n      __typename\n      ... on AuthorType {\n        _id\n        name\n        twitterHandle\n      }\n    }\n    members {\n      __typename\n      ... on AuthorType {\n        _id\n        name\n      }\n      ... on Group {\n        _id\n        members {\n          __typename\n          ... on AuthorType {\n            _id\n            name\n          }\n        }\n      }\n    }\n  }\n}";

var unionResponse = exports.unionResponse = {
  "data": {
    "getGroup": {
      "_id": "g123",
      "owner": {
        "__typename": "AuthorType",
        "_id": "a123",
        "name": "Matt K",
        "twitterHandle": "@__mattk"
      },
      "members": [{
        "__typename": "AuthorType",
        "_id": "a123",
        "name": "Matt K"
      }, {
        "__typename": "AuthorType",
        "_id": "a124",
        "name": "Joe J"
      }]
    }
  }
};

var unionStoreFull = exports.unionStoreFull = {
  "entities": {
    "Group": {
      "g123": {
        "_id": "g123",
        "owner": "AuthorType::a123",
        "members": ["AuthorType::a123", "AuthorType::a124"]
      }
    },
    "AuthorType": {
      "a123": {
        "_id": "a123",
        "name": "Matt K",
        "twitterHandle": "@__mattk"
      },
      "a124": {
        "_id": "a124",
        "name": "Joe J"
      }
    }
  },
  "result": {
    "getGroup": {
      "{\"_id\":\"g123\"}": "Group::g123"
    }
  }
};

var unionStoreMissingOwnerMembers = exports.unionStoreMissingOwnerMembers = {
  "entities": {
    "Group": {
      "g123": {
        "_id": "g123"
      }
    },
    "AuthorType": {
      "a124": {
        "_id": "a124",
        "name": "Joe J"
      }
    }
  },
  "result": {
    "getGroup": {
      "{\"_id\":\"g123\"}": "Group::g123"
    }
  }
};

var unionMissingOwnerMembersDenormalized = exports.unionMissingOwnerMembersDenormalized = {
  "getGroup": {
    "_id": "g123",
    "owner": {
      "__typename": null,
      "_id": null,
      "name": null,
      "twitterHandle": null
    },
    "members": []
  }
};