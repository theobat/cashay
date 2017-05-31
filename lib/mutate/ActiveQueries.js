'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _utils = require('../utils');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ActiveQueries = function () {
  function ActiveQueries(mutationName, possibleComponentObj, cachedQueries, mutationHandlers) {
    _classCallCheck(this, ActiveQueries);

    (0, _utils.isObject)(possibleComponentObj) ? this.makeDefinedComponentsToUpdate(cachedQueries, possibleComponentObj) : this.makeDefaultComponentsToUpdate(cachedQueries, mutationName, mutationHandlers);
  }

  _createClass(ActiveQueries, [{
    key: 'makeDefinedComponentsToUpdate',
    value: function makeDefinedComponentsToUpdate(cachedQueries, possibleComponentObj) {
      var possibleComponentKeys = Object.keys(possibleComponentObj);
      for (var i = 0; i < possibleComponentKeys.length; i++) {
        var op = possibleComponentKeys[i];
        if (cachedQueries[op]) {
          // remove falsy values, bring over the key or true
          this[op] = possibleComponentObj[op] === true ? '' : possibleComponentObj[op];
        }
      }
    }
  }, {
    key: 'makeDefaultComponentsToUpdate',
    value: function makeDefaultComponentsToUpdate(cachedQueries, mutationName, mutationHandlers) {
      var mutationHandlerObj = mutationHandlers[mutationName] || {};
      // if (!mutationHandlerObj) {
      //   throw new Error(`Did you forget to add mutation handlers to your queries for ${mutationName}?`)
      // }
      var listeningOps = Object.keys(mutationHandlerObj);
      for (var i = 0; i < listeningOps.length; i++) {
        var op = listeningOps[i];
        if (cachedQueries[op]) {
          var responses = cachedQueries[op].responses;

          var listeningKeys = Object.keys(responses);
          if (listeningKeys.length === 1) {
            this[op] = listeningKeys[0];
          } else if (listeningKeys.length > 1) {
            throw new Error(op + ' has more than 1 instance.\n          For ' + mutationName + ', please include an \'ops\' object in your options');
          }
        }
      }
    }
  }]);

  return ActiveQueries;
}();

exports.default = ActiveQueries;
;