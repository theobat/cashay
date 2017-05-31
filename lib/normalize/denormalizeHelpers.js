'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.maybeLiveQuery = exports.splitNormalString = exports.rebuildOriginalArgs = exports.sendChildrenToServer = exports.calculateSendToServer = exports.handleMissingData = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _kinds = require('graphql/language/kinds');

var _introspection = require('graphql/type/introspection');

var _getFieldState = require('./getFieldState');

var _getFieldState2 = _interopRequireDefault(_getFieldState);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UNION = _introspection.TypeKind.UNION,
    LIST = _introspection.TypeKind.LIST,
    SCALAR = _introspection.TypeKind.SCALAR,
    ENUM = _introspection.TypeKind.ENUM;
var handleMissingData = exports.handleMissingData = function handleMissingData(visitObject, field, nnFieldType, cachedDirective, context) {
  if (!cachedDirective) {
    sendChildrenToServer(field);
  }
  if (nnFieldType.kind === SCALAR) {
    return null;
  } else if (nnFieldType.kind === LIST) {
    return [];
  } else if (nnFieldType.kind === ENUM) {
    return '';
  } else {
    var typeSchema = context.schema.types[nnFieldType.name];
    if (nnFieldType.kind === UNION) {
      // since we don't know what the shape will look like, make it look like everything
      // that way, we don't have to code defensively in the view layer
      var possibleTypes = typeSchema.possibleTypes;

      var possibleTypesKeys = Object.keys(possibleTypes);
      var unionResponse = {};
      for (var i = 0; i < possibleTypesKeys.length; i++) {
        var possibleTypeKey = possibleTypesKeys[i];
        var _typeSchema = context.schema.types[possibleTypeKey];
        Object.assign(unionResponse, visitObject(unionResponse, field, _typeSchema, context));
      }
      return _extends({}, unionResponse, { __typename: null });
    }
    return visitObject({}, field, typeSchema, context);
  }
};

var calculateSendToServer = exports.calculateSendToServer = function calculateSendToServer(field, idFieldName) {
  var selections = field.selectionSet.selections;

  for (var i = 0; i < selections.length; i++) {
    var selection = selections[i];
    if (selection.kind === _kinds.INLINE_FRAGMENT) {
      calculateSendToServer(selection, idFieldName);
    }
    if (selection.sendToServer) {
      field.sendToServer = true;
    }
  }
};

var sendChildrenToServer = exports.sendChildrenToServer = function sendChildrenToServer(reqAST) {
  reqAST.sendToServer = true;
  if (!reqAST.selectionSet) {
    return;
  }
  reqAST.selectionSet.selections.forEach(function (child) {
    sendChildrenToServer(child);
  });
};

var rebuildOriginalArgs = exports.rebuildOriginalArgs = function rebuildOriginalArgs(reqAST) {
  if (reqAST.originalArguments) {
    reqAST.arguments = reqAST.originalArguments;
  }
  if (reqAST.selectionSet) {
    var fields = reqAST.selectionSet.selections;
    for (var i = 0; i < fields.length; i++) {
      rebuildOriginalArgs(fields[i]);
    }
  }
};

var splitNormalString = exports.splitNormalString = function splitNormalString(normalString) {
  var splitPoint = normalString.indexOf(_utils.NORM_DELIMITER);
  if (splitPoint !== -1) {
    return [normalString.substr(0, splitPoint), normalString.substr(splitPoint + _utils.NORM_DELIMITER.length)];
  } else {
    return [normalString];
  }
};

var maybeLiveQuery = exports.maybeLiveQuery = function maybeLiveQuery(source, fieldSchema, field, nnFieldType, context) {
  var fieldName = field.name.value;
  if (!(0, _utils.isLive)(field.directives)) {
    // if there's no results stored or being fetched, save some time & don't bother with the args
    return (0, _getFieldState2.default)(source[fieldName], fieldSchema, field, context);
  }
  var aliasOrFieldName = field.alias && field.alias.value || fieldName;
  var resolveChannelKey = context.resolveChannelKey,
      subscriber = context.subscriber,
      idFieldName = context.idFieldName,
      getState = context.getState,
      queryDep = context.queryDep,
      subscribe = context.subscribe,
      subscriptionDeps = context.subscriptionDeps,
      variables = context.variables;

  var result = getState().result;
  var topLevelSource = source === result;
  var fieldResolveChannelKey = resolveChannelKey && resolveChannelKey[aliasOrFieldName];
  var fieldSubscriber = subscriber && subscriber[aliasOrFieldName];
  var bestSubscriber = fieldSubscriber || context.defaultSubscriber;
  var makeChannelKey = fieldResolveChannelKey || (0, _utils.defaultResolveChannelKeyFactory)(idFieldName, topLevelSource);
  var channelKey = makeChannelKey(source, variables);
  var initialState = subscribe(aliasOrFieldName, channelKey, bestSubscriber, { returnType: nnFieldType });
  var subDep = (0, _utils.makeFullChannel)(aliasOrFieldName, channelKey);
  subscriptionDeps[subDep] = subscriptionDeps[subDep] || new Set();
  subscriptionDeps[subDep].add(queryDep);
  return result[aliasOrFieldName] && result[aliasOrFieldName][channelKey] || initialState.data;
};