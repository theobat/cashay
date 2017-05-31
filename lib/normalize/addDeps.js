'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = addDeps;

var _utils = require('../utils');

function addDeps(normalizedResponse, op, key, normalizedDeps, denormalizedDeps) {
  // get the previous set
  // create a Set of normalized locations in entities (eg 'Post.123')
  var newNormalizedDeps = makeNormalizedDeps(normalizedResponse.entities);
  var oldNormalizedDeps = void 0;
  normalizedDeps[op] = normalizedDeps[op] || {};
  var opDeps = normalizedDeps[op];
  oldNormalizedDeps = opDeps[key];
  opDeps[key] = newNormalizedDeps;
  var newUniques = void 0;
  if (!oldNormalizedDeps) {
    newUniques = newNormalizedDeps;
  } else {
    // create 2 Sets that are the left/right diff of old and new
    newUniques = new Set();
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = newNormalizedDeps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var dep = _step.value;

        if (oldNormalizedDeps.has(dep)) {
          oldNormalizedDeps.delete(dep);
        } else {
          newUniques.add(dep);
        }
      }

      // remove old deps
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

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = oldNormalizedDeps[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _dep = _step2.value;

        var _dep$split = _dep.split(_utils.DELIMITER),
            _dep$split2 = _slicedToArray(_dep$split, 2),
            typeName = _dep$split2[0],
            entityName = _dep$split2[1];

        var entityDep = denormalizedDeps[typeName][entityName];
        entityDep[op].delete(key);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  }

  // add new deps
  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = newUniques[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var _dep2 = _step3.value;

      var _dep2$split = _dep2.split(_utils.DELIMITER),
          _dep2$split2 = _slicedToArray(_dep2$split, 2),
          typeName = _dep2$split2[0],
          entityName = _dep2$split2[1];

      denormalizedDeps[typeName] = denormalizedDeps[typeName] || {};
      denormalizedDeps[typeName][entityName] = denormalizedDeps[typeName][entityName] || {};
      denormalizedDeps[typeName][entityName][op] = denormalizedDeps[typeName][entityName][op] || new Set();
      denormalizedDeps[typeName][entityName][op].add(key);
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }
}

var makeNormalizedDeps = function makeNormalizedDeps(entities) {
  var typeKeys = Object.keys(entities);
  var normalizedDeps = new Set();
  for (var i = 0; i < typeKeys.length; i++) {
    var typeName = typeKeys[i];
    var entityKeys = Object.keys(entities[typeName]);
    for (var j = 0; j < entityKeys.length; j++) {
      var entityName = entityKeys[j];
      var dep = '' + typeName + _utils.DELIMITER + entityName;
      normalizedDeps.add(dep);
    }
  }
  return normalizedDeps;
};