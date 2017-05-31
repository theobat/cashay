"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var front3Query = exports.front3Query = "\nquery {\n  getRecentPosts(first:3) {\n    _id,\n    cursor\n  }\n}";

var front4Query = exports.front4Query = "\nquery {\n  getRecentPosts(first:4) {\n    _id,\n    cursor\n  }\n}";

var front3Response = exports.front3Response = {
  "data": {
    "getRecentPosts": [{
      "_id": "p126",
      "cursor": "1444444444444chikachikow"
    }, {
      "_id": "p125",
      "cursor": "1433333333333chikachikow"
    }, {
      "_id": "p124",
      "cursor": "1422222222222chikachikow"
    }]
  }
};

var front3LocalResponseFn = exports.front3LocalResponseFn = function front3LocalResponseFn(requestAmount) {
  var base = {

    "data": {
      "getRecentPosts": [{
        "_id": "p126",
        "cursor": "1444444444444chikachikow"
      }, {
        "_id": "p125",
        "cursor": "1433333333333chikachikow"
      }, {
        "_id": "p124",
        "cursor": "1422222222222chikachikow"
      }]
    }
  };
  base.data.getRecentPosts.BOF = true;
  base.data.getRecentPosts.EOF = true;
  if (requestAmount !== undefined) {
    base.data.getRecentPosts.count = requestAmount;
  }
  return base;
};

var front3Store = exports.front3Store = {
  "entities": {
    "PostType": {
      "p126": {
        "_id": "p126",
        "cursor": "1444444444444chikachikow"
      },
      "p125": {
        "_id": "p125",
        "cursor": "1433333333333chikachikow"
      },
      "p124": {
        "_id": "p124",
        "cursor": "1422222222222chikachikow"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      front: ["PostType::p126", "PostType::p125", "PostType::p124"]
    }
  }
};

var front2After3Query = exports.front2After3Query = "\nquery {\n  getRecentPosts(first:2, afterCursor: \"1422222222222chikachikow\") {\n    _id,\n    cursor\n  }\n}";

var front1After3Response = exports.front1After3Response = {
  "data": {
    "getRecentPosts": [{
      "_id": "p123",
      "cursor": "1411111111111chikachikow"
    }]
  }
};

var front2After3StoreFn = exports.front2After3StoreFn = function front2After3StoreFn() {
  var base = {
    "entities": {
      "PostType": {
        "p123": {
          "_id": "p123",
          "cursor": "1411111111111chikachikow"
        }
      }
    },
    "result": {
      "getRecentPosts": {
        "front": ["PostType::p123"]
      }
    }
  };
  base.result.getRecentPosts.front.EOF = true;
  // base.result.getRecentPosts.front.count = 1;
  return base;
};

var front1After3Store = exports.front1After3Store = {
  entities: {
    PostType: {
      p123: {
        _id: "p123",
        cursor: "1411111111111chikachikow"
      }
    }
  },
  result: {
    getRecentPosts: {
      front: ["PostType::p123"]
    }
  }
};

var front1After4Query = exports.front1After4Query = "\nquery {\n  getRecentPosts(first:1, afterCursor: \"1411111111111chikachikow\") {\n    _id,\n    cursor\n  }\n}";

var front1After4Response = exports.front1After4Response = {
  "data": {
    "getRecentPosts": []
  }
};

var front1After4StoreFn = exports.front1After4StoreFn = function front1After4StoreFn() {
  var base = {
    "entities": {},
    "result": {
      "getRecentPosts": {
        "front": []
      }
    }
  };
  base.result.getRecentPosts.front.EOF = true;
  return base;
};

var back1After4StoreFn = exports.back1After4StoreFn = function back1After4StoreFn() {
  var base = {
    "entities": {},
    "result": {
      "getRecentPosts": {
        "back": []
      }
    }
  };
  base.result.getRecentPosts.back.EOF = true;
  return base;
};