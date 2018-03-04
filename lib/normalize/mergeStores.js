'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = mergeStores;

var _utils = require('../utils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var paginationArrayNames = new Set([_utils.FRONT, _utils.BACK, _utils.FULL]);

/**
 * check for overlap in docs, intelligently append keys
 * all the logic in here is to mitigate the problems with cursor-based pagination (duplicates, etc)
 * pagination should never have the same document twice
 * the question is, do we maintain the old order, or the new?
 * maintaining the old order ensures less jumping around & that the user won't have to scroll past the same thing twice
 * so if the new stuff has references to old stuff, delete em
 * then, stick em on the end
 */
var mergeSameArrays = function mergeSameArrays(targetArray, srcArray, isAppend) {
  var srcSet = new Set(srcArray);
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = targetArray[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var entry = _step.value;

      srcSet.delete(entry);
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

  var reducedSrcArr = [].concat(_toConsumableArray(srcSet));
  return isAppend ? targetArray.concat(reducedSrcArr) : reducedSrcArr.concat(targetArray);
};

/**
 * merging front and back is a little volatile because per mergeSameArrays, we keep the original order
 * it's possible, for example, for a post to get downvoted to hell, causing it to first appear in the front
 * but then later in the back. such is a pitfall of cursor-based arrays
 */
var mergeDifferentArrays = function mergeDifferentArrays(front, back) {
  var frontSet = new Set(front);
  var isComplete = false;
  for (var i = 0; i < back.length; i++) {
    var entry = back[i];
    if (frontSet.has(entry)) {
      isComplete = true;
      frontSet.delete(entry);
    }
  }
  if (isComplete) {
    var reducedFront = [].concat(_toConsumableArray(frontSet));
    return reducedFront.concat(back);
  }
};

/**
 * An exercise in combinatorics.
 * Specific logic on how to merge arrays
 * Many of these are edge cases, like merging a paginated array with a full array
 * */
var handleArrays = function handleArrays(target, src) {
  // merge similar
  var pageTarget = {};
  var pageSrc = {};
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = paginationArrayNames[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var arrType = _step2.value;

      pageTarget[arrType] = Array.isArray(target[arrType]);
      pageSrc[arrType] = Array.isArray(src[arrType]);
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

  if (pageTarget[_utils.FULL]) {
    if (pageSrc[_utils.FULL]) {
      target[_utils.FULL] = mergeSameArrays(target[_utils.FULL], src[_utils.FULL], true);
    } else if (pageSrc[_utils.FRONT]) {
      target[_utils.FULL] = mergeSameArrays(target[_utils.FULL], src[_utils.FRONT], false);
    } else if (pageSrc[_utils.BACK]) {
      target[_utils.FULL] = mergeSameArrays(target[_utils.FULL], src[_utils.BACK], true);
    }
  } else {
    if (pageSrc[_utils.FULL]) {
      target[_utils.FULL] = src[_utils.FULL];
    } else {
      if (pageTarget[_utils.FRONT] && pageSrc[_utils.FRONT]) {
        var targetArr = src[_utils.FRONT].EOF ? _utils.FULL : _utils.FRONT;
        target[targetArr] = mergeSameArrays(target[_utils.FRONT], src[_utils.FRONT], true);
      }
      if (pageTarget[_utils.BACK] && pageSrc[_utils.BACK]) {
        var _targetArr = src[_utils.BACK].BOF ? _utils.FULL : _utils.BACK;
        target[_targetArr] = mergeSameArrays(target[_utils.BACK], src[_utils.BACK], false);
      }
    }
  }

  if (!target[_utils.FRONT] && src[_utils.FRONT]) {
    target[_utils.FRONT] = src[_utils.FRONT];
  }
  if (!target[_utils.BACK] && src[_utils.BACK]) {
    target[_utils.BACK] = src[_utils.BACK];
  }

  // check to see if target has all the docs (but only if we got something new recently)
  if (target[_utils.FRONT] && target[_utils.BACK] && (src[_utils.FRONT] || src[_utils.BACK])) {
    var full = mergeDifferentArrays(target[_utils.FRONT], target[_utils.BACK]);
    if (full) {
      target[_utils.FULL] = full;
    }
  }
  if (target[_utils.FULL]) {
    delete target[_utils.FRONT];
    delete target[_utils.BACK];
  }
};

/**
 * A cashay array is an object that holds up to 2 arrays:
 * either full (not paginated) or front and/or back
 * */
var detectCashayArray = function detectCashayArray(src, allSrcKeys) {
  if (allSrcKeys.length < 1 || allSrcKeys.length > 2) return false;
  for (var i = 0; i < allSrcKeys.length; i++) {
    var srcKey = allSrcKeys[i];
    if (!paginationArrayNames.has(srcKey) || !Array.isArray(src[srcKey])) {
      return false;
    }
  }
  return true;
};

/**
 * A deep merge that has exclusive logic for merging arrays suitable for pagination
 * */
function mergeStores(state, src, isMutation) {
  // first shallow copy the state as a simple way to get the primitives, we'll later overwrite the pointers
  if (!src) return state;
  var target = _extends({}, state);
  var srcKeys = Object.keys(src);
  var isCashayArray = detectCashayArray(src, srcKeys);
  if (isCashayArray && !isMutation) {
    handleArrays(target, src);
  } else {
    for (var i = 0; i < srcKeys.length; i++) {
      var key = srcKeys[i];
      var srcProp = src[key];
      var targetProp = target[key];
      if ((0, _utils.isObject)(srcProp) && (0, _utils.isObject)(targetProp) && !(srcProp instanceof Date)) {
        var srcIsArray = Array.isArray(srcProp);
        var stateIsArray = Array.isArray(targetProp);
        if (!srcIsArray && !stateIsArray) {
          // if both the state and src are objects, merge them
          target[key] = _extends({}, mergeStores(targetProp, srcProp, isMutation));
        } else if (isCashayArray) {
          // this is a mutation, so the array length
          if (key === _utils.FRONT) {
            target[key] = [].concat(_toConsumableArray(targetProp.slice(0, srcProp.count)), _toConsumableArray(srcProp.slice()));
          } else if (key === _utils.BACK) {
            var spliceStart = targetProp.length - srcProp.count;
            target[key] = [].concat(_toConsumableArray(targetProp.slice(spliceStart)), _toConsumableArray(srcProp));
          }
        } else {
          // for 2 arrays that aren't cashay arrays, use a simple replace (can extend in the future)
          target[key] = srcProp;
        }
      } else {
        if (srcProp === _utils.REMOVAL_FLAG) {
          delete target[key];
        } else {
          // if there is a disagreement on the type of value, default to using the src
          target[key] = srcProp;
        }
      }
    }
  }
  return target;
};