"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var back3Query = exports.back3Query = "\nquery {\n  getRecentPosts(last:3) {\n    _id,\n    cursor\n  }\n}";

var back3Response = exports.back3Response = {
  "data": {
    "getRecentPosts": [{
      "_id": "p125",
      "cursor": "1433333333333chikachikow"
    }, {
      "_id": "p124",
      "cursor": "1422222222222chikachikow"
    }, {
      "_id": "p123",
      "cursor": "1411111111111chikachikow"
    }]
  }
};

var back3Store = exports.back3Store = {
  "entities": {
    "PostType": {
      "p125": {
        "_id": "p125",
        "cursor": "1433333333333chikachikow"
      },
      "p124": {
        "_id": "p124",
        "cursor": "1422222222222chikachikow"
      },
      "p123": {
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      "back": ["PostType::p125", "PostType::p124", "PostType::p123"]
    }
  }
};

var back2After3Query = exports.back2After3Query = "\nquery {\n  getRecentPosts(last:2, beforeCursor: \"1433333333333chikachikow\") {\n    _id,\n    cursor\n  }\n}";

var back1After3Response = exports.back1After3Response = {
  "data": {
    "getRecentPosts": [{
      "_id": "p126",
      "cursor": "1444444444444chikachikow"
    }]
  }
};

var back2After3StoreFn = exports.back2After3StoreFn = function back2After3StoreFn() {
  var base = {
    "entities": {
      "PostType": {
        "p126": {
          "_id": "p126",
          "cursor": "1444444444444chikachikow"
        }
      }
    },
    "result": {
      "getRecentPosts": {
        "back": ["PostType::p126"]
      }
    }
  };
  base.result.getRecentPosts.back.BOF = true;
  return base;
};

var back4 = exports.back4 = "\nquery {\n  getRecentPosts(last:4) {\n    _id,\n    cursor\n  }\n}";

var back1After3Store = exports.back1After3Store = {
  "entities": {
    "PostType": {
      "p126": {
        "_id": "p126",
        "cursor": "1444444444444chikachikow"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      "back": ["PostType::p126"]
    }
  }
};

var back1After4Query = exports.back1After4Query = "\nquery {\n  getRecentPosts(last:1, beforeCursor: \"1444444444444chikachikow\") {\n    _id,\n    cursor\n  }\n}";

var back1After4Response = exports.back1After4Response = {
  "data": {
    "getRecentPosts": []
  }
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
  base.result.getRecentPosts.back.BOF = true;
  return base;
};

var back4ResponseFn = exports.back4ResponseFn = function back4ResponseFn(requestAmount) {
  var base = {
    data: {
      "getRecentPosts": [{
        "_id": "p126",
        "cursor": "1444444444444chikachikow"
      }, {
        "_id": "p125",
        "cursor": "1433333333333chikachikow"
      }, {
        "_id": "p124",
        "cursor": "1422222222222chikachikow"
      }, {
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
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