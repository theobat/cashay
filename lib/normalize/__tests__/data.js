'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var emptyInitialState = exports.emptyInitialState = {
  entities: {},
  result: {}
};

var paginationWords = exports.paginationWords = {
  first: 'first',
  last: 'last',
  before: 'beforeCursor',
  after: 'afterCursor'
};

var coerceTypes = exports.coerceTypes = {
  DateTime: function DateTime(val) {
    return new Date(val);
  }
};

var queryWithSortedArgs = exports.queryWithSortedArgs = '\nquery ($reverse: Boolean, $lang: String) {\n  getLatestPost {\n    _id\n\t\ttitle(inReverse: $reverse, language: $lang)\n  }\n}';

var responseFromSortedArgs = exports.responseFromSortedArgs = {
  "data": {
    "getLatestPost": {
      "_id": "p126",
      "title": "!LONAPSE NE ?atad dezilamroned erots yahsac seod woH"
    }
  }
};

var storeFromSortedArgs = exports.storeFromSortedArgs = {
  "entities": {
    "PostType": {
      "p126": {
        "_id": "p126",
        "title": {
          "{\"inReverse\":true,\"language\":\"spanish\"}": "!LONAPSE NE ?atad dezilamroned erots yahsac seod woH"
        }
      }
    }
  },
  "result": {
    "getLatestPost": "PostType::p126"
  }
};

var queryPostCount = exports.queryPostCount = '\n  query {\n    postCount: getPostCount\n  }';

var storedPostCount = exports.storedPostCount = {
  "result": {
    "getPostCount": 4
  }
};