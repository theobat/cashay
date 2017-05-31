'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = removeNamespacing;

var _utils = require('../utils');

function removeNamespacing(dataObj, componentId) {
  if (!(0, _utils.isObject)(dataObj)) {
    return dataObj;
  }
  var normalizedData = removeNamespacedFields(dataObj, componentId);
  var queryKeys = Object.keys(normalizedData);
  for (var i = 0; i < queryKeys.length; i++) {
    var queryKey = queryKeys[i];
    var normalizedProp = normalizedData[queryKey];
    if ((0, _utils.isObject)(normalizedProp)) {
      if (Array.isArray(normalizedProp)) {
        normalizedData[queryKey] = normalizedProp.map(function (prop) {
          return removeNamespacing(prop, componentId);
        });
      } else {
        normalizedData[queryKey] = removeNamespacing(normalizedProp, componentId);
      }
    }
  }
  return normalizedData;
}

var removeNamespacedFields = function removeNamespacedFields(dataObj, componentId) {
  var normalizedData = _extends({}, dataObj);
  var queryKeys = Object.keys(normalizedData);
  for (var i = 0; i < queryKeys.length; i++) {
    var queryKey = queryKeys[i];

    var _queryKey$split = queryKey.split(_utils.DELIMITER),
        _queryKey$split2 = _slicedToArray(_queryKey$split, 3),
        prefix = _queryKey$split2[0],
        fieldComponentId = _queryKey$split2[1],
        fieldNameOrAlias = _queryKey$split2[2];

    if (prefix === _utils.CASHAY) {
      if (fieldComponentId === componentId) {
        normalizedData[fieldNameOrAlias] = normalizedData[queryKey];
      }
      delete normalizedData[queryKey];
    }
  }
  return normalizedData;
};