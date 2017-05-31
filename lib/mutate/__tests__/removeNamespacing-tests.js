'use strict';

require('babel-register');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _removeNamespacing = require('../removeNamespacing');

var _removeNamespacing2 = _interopRequireDefault(_removeNamespacing);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* variableDefinitions Tests */
(0, _ava2.default)('removes 2 irrelevant namespaces: 1 prefixed, 1 not', function (t) {
  var input = {
    "data": {
      "createPost": {
        "post": {
          "CASHAY_component1_title": "FOOIE EN ESPANOL!",
          "CASHAY_component1_reverseTitle": "EIOOF",
          "title": "FOOIE"
        }
      }
    }
  };
  var expected = {
    "data": {
      "createPost": {
        "post": {
          "title": "FOOIE EN ESPANOL!",
          "reverseTitle": "EIOOF"
        }
      }
    }
  };
  var actual = (0, _removeNamespacing2.default)(input, 'component1');
  t.deepEqual(actual, expected);
});