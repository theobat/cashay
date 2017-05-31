"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fullResponse = exports.fullResponse = {
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
    }, {
      "_id": "p123",
      "cursor": "1411111111111chikachikow"
    }]
  }
};

var fullPostStore = exports.fullPostStore = {
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
      },
      "p123": {
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      "full": ["PostType::p126", "PostType::p125", "PostType::p124", "PostType::p123"]
    }
  }
};

var front4PostStore = exports.front4PostStore = {
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
      },
      "p123": {
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      "front": ["PostType::p126", "PostType::p125", "PostType::p124", "PostType::p123"]
    }
  }
};

var back4PostStore = exports.back4PostStore = {
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
      },
      "p123": {
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      "back": ["PostType::p126", "PostType::p125", "PostType::p124", "PostType::p123"]
    }
  }
};

var back1Query = exports.back1Query = "\nquery {\n  getRecentPosts(last:1) {\n    _id,\n    cursor\n  }\n}";

var back1Skip1Query = exports.back1Skip1Query = "\nquery {\n  getRecentPosts(last:1, beforeCursor:\"1411111111111chikachikow\") {\n    _id,\n    cursor\n  }\n}";

var back1Store = exports.back1Store = {
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
      back: ["PostType::p123"]
    }
  }
};

var back1StoreNoCursor = exports.back1StoreNoCursor = {
  entities: {
    PostType: {
      p123: {
        _id: "p123"
      }
    }
  },
  result: {
    getRecentPosts: {
      back: ["PostType::p123"]
    }
  }
};

var back1NoCursorDenormalizedFn = exports.back1NoCursorDenormalizedFn = function back1NoCursorDenormalizedFn() {
  var base = {
    "getRecentPosts": [{
      "_id": "p123",
      "cursor": null
    }]
  };
  base.getRecentPosts.BOF = true;
  base.getRecentPosts.EOF = true;
  base.getRecentPosts.count = 1;
  return base;
};

var front3Back1Store = exports.front3Back1Store = {
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
      },
      "p123": {
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
      }
    }
  },
  result: {
    getRecentPosts: {
      back: ["PostType::p123"],
      front: ["PostType::p126", "PostType::p125", "PostType::p124"]
    }
  }
};

var back1QueryBadArgs = exports.back1QueryBadArgs = "\nquery {\n  getRecentPosts(last:1, afterCursor:\"foo\") {\n    _id,\n    cursor\n  }\n}";

var front1After3DenormalizedFn = exports.front1After3DenormalizedFn = function front1After3DenormalizedFn(requestAmount) {
  var base = {
    data: {
      "getRecentPosts": [{
        "_id": "p123",
        "cursor": "1411111111111chikachikow"
      }]
    }
  };
  base.data.getRecentPosts.EOF = true;
  if (requestAmount !== undefined) {
    base.data.getRecentPosts.count = requestAmount;
  }
  return base;
};

var front4PostStoreNoCursors = exports.front4PostStoreNoCursors = {
  "entities": {
    "PostType": {
      "p126": {
        "_id": "p126"
      },
      "p125": {
        "_id": "p125"
      },
      "p124": {
        "_id": "p124"
      },
      "p123": {
        "_id": "p123"
      }
    }
  },
  "result": {
    "getRecentPosts": {
      "front": ["PostType::p126", "PostType::p125", "PostType::p124", "PostType::p123"]
    }
  }
};

var back4PostStoreNoLastCursor = exports.back4PostStoreNoLastCursor = {
  "entities": {
    "PostType": {
      "p126": {
        "_id": "p126"
      },
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
      "back": ["PostType::p126", "PostType::p125", "PostType::p124", "PostType::p123"]
    }
  }
};