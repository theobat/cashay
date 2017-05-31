'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = processSubscriptionDoc;

var _utils = require('../utils');

var _duck = require('../normalize/duck');

var _normalizeResponse3 = require('../normalize/normalizeResponse');

var _normalizeResponse4 = _interopRequireDefault(_normalizeResponse3);

var _introspection = require('graphql/type/introspection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var UNION = _introspection.TypeKind.UNION;


var getSafeHandler = function getSafeHandler(handler, idxInCache) {
  if (handler !== _utils.UPSERT) return handler;
  return idxInCache === -1 ? _utils.ADD : _utils.UPDATE;
};

var immutableRemove = function immutableRemove(arr, idx) {
  return [].concat(_toConsumableArray(arr.slice(0, idx)), _toConsumableArray(arr.slice(idx + 1)));
};

var immutableUpdate = function immutableUpdate(arr, idx, updatedDoc) {
  return [].concat(_toConsumableArray(arr.slice(0, idx)), [updatedDoc], _toConsumableArray(arr.slice(idx + 1)));
};

var checkCanDelete = function checkCanDelete(document, oldDenormResult, context) {
  var entities = context.entities,
      typeSchema = context.typeSchema,
      idFieldName = context.idFieldName;

  var typeName = typeSchema.kind === UNION ? oldDenormResult.data.__typename : typeSchema.name;
  var docId = document[idFieldName];
  var oldEntity = entities[typeName] && entities[typeName][docId];
  // protect against 2 remove calls coming in quickly
  if (!oldEntity) return false;
  var docKeys = Object.keys(document);
  for (var i = 0; i < docKeys.length; i++) {
    var key = docKeys[i];
    if (oldEntity[key] !== document[key]) {
      return false;
    }
  }
  return true;
};

function processSubscriptionDoc(handler, document, oldDenormResult, oldNormResult, context) {
  var idFieldName = context.idFieldName,
      typeSchema = context.typeSchema;

  var docId = document[idFieldName];
  var isList = Array.isArray(oldDenormResult.data);
  if (isList) {
    var idxInCache = oldNormResult.findIndex(function (normDoc) {
      return normDoc.endsWith(docId);
    });
    var safeHandler = getSafeHandler(handler, idxInCache);
    if (safeHandler === _utils.ADD) {
      var normalizedDoc = (0, _normalizeResponse4.default)(document, context, true);
      return {
        actionType: _duck.ADD_SUBSCRIPTION,
        denormResult: oldDenormResult.data.concat(document),
        oldDoc: null,
        newDoc: document,
        normEntities: normalizedDoc.entities,
        normResult: oldNormResult.concat(normalizedDoc.result)
      };
    } else if (safeHandler === _utils.REMOVE) {
      var oldDoc = oldDenormResult.data[idxInCache];
      // const canDelete = checkCanDelete(document, oldDenormResult, context);
      // const typeName = typeSchema.kind === UNION ? oldDoc.__typename : typeSchema.name;
      return {
        actionType: _duck.REMOVE_SUBSCRIPTION,
        denormResult: immutableRemove(oldDenormResult.data, idxInCache),
        oldDoc: oldDoc,
        newDoc: null,
        normEntities: {},
        // cannot safely remove here because another sub or @cached query might also use this doc
        // normEntities: canDelete ? {[typeName]: {[docId]: REMOVAL_FLAG}} : {},
        normResult: immutableRemove(oldNormResult, idxInCache)
      };
    } else if (safeHandler === _utils.UPDATE) {
      var _oldDoc = oldDenormResult.data[idxInCache];
      // this shallow merge will break if the doc has nested docs
      var mergedDoc = _extends({}, _oldDoc, document);
      if ((0, _utils.shallowEqual)(_oldDoc, mergedDoc)) return;
      var _normalizedDoc = (0, _normalizeResponse4.default)(mergedDoc, context, true);
      return {
        actionType: _duck.UPDATE_SUBSCRIPTION,
        denormResult: immutableUpdate(oldDenormResult.data, idxInCache, mergedDoc),
        oldDoc: _oldDoc,
        newDoc: mergedDoc,
        normEntities: _normalizedDoc.entities,
        normResult: immutableUpdate(oldNormResult, idxInCache, _normalizedDoc.result)
      };
    }
  } else {
    var _safeHandler = handler === _utils.UPSERT ? _utils.UPDATE : handler;
    if (_safeHandler === _utils.ADD) {
      var _normalizeResponse = (0, _normalizeResponse4.default)(document, context, true),
          normEntities = _normalizeResponse.entities,
          normResult = _normalizeResponse.result;

      return {
        actionType: _duck.ADD_SUBSCRIPTION,
        denormResult: document,
        oldDoc: null,
        newDoc: document,
        normEntities: normEntities,
        normResult: normResult
      };
    } else if (_safeHandler === _utils.UPDATE) {
      var _mergedDoc = _extends({}, oldDenormResult.data, document);
      if ((0, _utils.shallowEqual)(oldDenormResult.data, _mergedDoc)) return;

      var _normalizeResponse2 = (0, _normalizeResponse4.default)(_mergedDoc, context, true),
          _normEntities = _normalizeResponse2.entities,
          _normResult = _normalizeResponse2.result;

      return {
        actionType: _duck.UPDATE_SUBSCRIPTION,
        denormResult: _mergedDoc,
        oldDoc: oldDenormResult.data,
        newDoc: _mergedDoc,
        normEntities: _normEntities,
        normResult: _normResult
      };
    } else if (_safeHandler === _utils.REMOVE) {
      var typeName = typeSchema.kind === UNION ? oldDenormResult.data.__typename : typeSchema.name;
      return {
        actionType: _duck.REMOVE_SUBSCRIPTION,
        denormResult: null,
        oldDoc: oldDenormResult.data,
        newDoc: null,
        normEntities: _defineProperty({}, typeName, _defineProperty({}, docId, _utils.REMOVAL_FLAG)),
        normResult: null
      };
    }
  }
};