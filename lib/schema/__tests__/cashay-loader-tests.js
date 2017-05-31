'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

require('babel-register');

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

var _cashayLoader = require('../cashay-loader');

var _cashayLoader2 = _interopRequireDefault(_cashayLoader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var MockLoaderParent = function () {
  function MockLoaderParent(loader, testCallback) {
    _classCallCheck(this, MockLoaderParent);

    this.loader = loader;
    this.callback = testCallback;
  }

  _createClass(MockLoaderParent, [{
    key: 'async',
    value: function async() {
      return this.callback;
    }
  }, {
    key: 'cacheable',
    value: function cacheable() {
      return;
    }
  }, {
    key: 'exec',
    value: function exec(content, resource) {
      return function () {
        return new Promise(function (resolve) {
          return resolve({ querySchema: "test document" });
        });
      };
    }
  }, {
    key: 'load',
    value: function load(testContent) {
      return this.loader(testContent);
    }
  }]);

  return MockLoaderParent;
}();

(0, _ava2.default)('cashay-loader is function', function (t) {
  t.plan(1);

  t.is(typeof _cashayLoader2.default === 'undefined' ? 'undefined' : _typeof(_cashayLoader2.default), 'function');
});

_ava2.default.cb('cashay-loader returns raw module object', function (t) {
  t.plan(2);

  var callback = function callback(errors, doc) {
    t.is(errors, null);
    t.regex(doc, /^module.exports = {/);
    t.end();
  };

  var loader = new MockLoaderParent(_cashayLoader2.default, callback);
  loader.load();
});