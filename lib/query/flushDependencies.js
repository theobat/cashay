"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = flushDependencies;

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

/**
 * walk the normalized response & grab the deps for each entity. put em all in a Set & flush it down the toilet
 */
function flushDependencies(entitiesDiff, denormalizedDeps, cachedQueries, op, key) {
  var keyFlush = makeFlushSet(entitiesDiff, denormalizedDeps, op, key);
  var componentKeys = Object.keys(keyFlush);
  for (var i = 0; i < componentKeys.length; i++) {
    var componentKey = componentKeys[i];
    var keysToFlush = keyFlush[componentKey];
    var cachedComponentQuery = cachedQueries[componentKey];
    if (cachedComponentQuery) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = keysToFlush[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var flushedKey = _step.value;

          cachedComponentQuery.responses[flushedKey] = undefined;
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }
}

/**
 * Crawl the dependency tree snagging up everything that will be invalidated
 * Safety checks required because subs affect queries, but not the other way around
 *
 */
var makeFlushSet = function makeFlushSet(entitiesDiff, denormalizedDeps, op, key) {
  var keyFlush = {};
  var typeKeys = Object.keys(entitiesDiff);
  for (var i = 0; i < typeKeys.length; i++) {
    var typeName = typeKeys[i];
    var typeInDependencyTree = denormalizedDeps[typeName];
    if (!typeInDependencyTree) continue;
    var newType = entitiesDiff[typeName];
    var entityKeys = Object.keys(newType);
    for (var j = 0; j < entityKeys.length; j++) {
      var entityName = entityKeys[j];
      var entityInDependencyTree = typeInDependencyTree[entityName];
      if (!entityInDependencyTree) continue;
      var entityInDependencyTreeKeys = Object.keys(entityInDependencyTree);
      for (var k = 0; k < entityInDependencyTreeKeys.length; k++) {
        var dependentComponent = entityInDependencyTreeKeys[k];
        var newDependencyKeySet = entityInDependencyTree[dependentComponent];
        var incumbant = keyFlush[dependentComponent] || new Set();
        keyFlush[dependentComponent] = new Set([].concat(_toConsumableArray(incumbant), _toConsumableArray(newDependencyKeySet)));
      }
    }
  }

  // ensure flushing the callee (if it's a sub it'll just get ignored later)
  if (op) {
    keyFlush[op] = keyFlush[op] || new Set();
    keyFlush[op].add(key);
  }
  return keyFlush;
};