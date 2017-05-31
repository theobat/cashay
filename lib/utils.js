'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.parseCachedType = exports.shallowEqual = exports.getTypeName = exports.getVariableValue = exports.makeCachedArgs = exports.makeFullChannel = exports.defaultResolveChannelKeyFactory = exports.getFieldSchema = exports.isLive = exports.without = exports.makeNamespaceString = exports.getVariables = exports.getStateVars = exports.teardownDocumentAST = exports.buildExecutionContext = exports.parse = exports.convertFragmentToInline = exports.checkMutationInSchema = exports.makeErrorFreeResponse = exports.shallowPlus1Clone = exports.clone = exports.isObject = exports.getRegularArgsKey = exports.ensureRootType = exports.ensureTypeFromNonNull = exports.CACHED_ARGS = exports.CACHED = exports.LOCAL = exports.LOCAL_FILTER = exports.LOCAL_SORT = exports.LIVE = exports.UNSUBSCRIBED = exports.READY = exports.SUBSCRIBING = exports.COMPLETE = exports.LOADING = exports.AFTER = exports.BEFORE = exports.LAST = exports.FIRST = exports.REMOVE = exports.UPSERT = exports.UPDATE = exports.ADD = exports.FULL = exports.BACK = exports.FRONT = exports.REMOVAL_FLAG = exports.NORM_DELIMITER = exports.DELIMITER = exports.CASHAY = exports.TYPENAME = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _kinds = require('graphql/language/kinds');

var _introspection = require('graphql/type/introspection');

var _parser = require('graphql/language/parser');

var NON_NULL = _introspection.TypeKind.NON_NULL,
    UNION = _introspection.TypeKind.UNION;
var TYPENAME = exports.TYPENAME = '__typename';
var CASHAY = exports.CASHAY = 'CASHAY';
var DELIMITER = exports.DELIMITER = '_';
var NORM_DELIMITER = exports.NORM_DELIMITER = '::';
var REMOVAL_FLAG = exports.REMOVAL_FLAG = '___CASHAY_REMOVAL_FLAG___';

/* redux store array constants */
var FRONT = exports.FRONT = 'front';
var BACK = exports.BACK = 'back';
var FULL = exports.FULL = 'full';

/* subscription handler names */
var ADD = exports.ADD = 'add';
var UPDATE = exports.UPDATE = 'update';
var UPSERT = exports.UPSERT = 'upsert';
var REMOVE = exports.REMOVE = 'remove';

/* default pagination argsuments */
var FIRST = exports.FIRST = 'first';
var LAST = exports.LAST = 'last';
var BEFORE = exports.BEFORE = 'before';
var AFTER = exports.AFTER = 'after';

/* status for queries */
var LOADING = exports.LOADING = 'loading';
var COMPLETE = exports.COMPLETE = 'complete';

/* status for subscriptions */
var SUBSCRIBING = exports.SUBSCRIBING = 'subscribing';
var READY = exports.READY = 'ready';
var UNSUBSCRIBED = exports.UNSUBSCRIBED = 'unsubscribed';

/* directives */
var LIVE = exports.LIVE = 'live';
var LOCAL_SORT = exports.LOCAL_SORT = 'localSort';
var LOCAL_FILTER = exports.LOCAL_FILTER = 'localFilter';
var LOCAL = exports.LOCAL = 'local';
var CACHED = exports.CACHED = 'cached';
var CACHED_ARGS = exports.CACHED_ARGS = ['id', 'ids', 'type'];

var ensureTypeFromNonNull = exports.ensureTypeFromNonNull = function ensureTypeFromNonNull(type) {
  return type.kind === NON_NULL ? type.ofType : type;
};

var ensureRootType = exports.ensureRootType = function ensureRootType(type) {
  while (type.ofType) {
    type = type.ofType;
  }return type;
};

var getRegularArgsKey = exports.getRegularArgsKey = function getRegularArgsKey(regularArgs) {
  return regularArgs && (Object.keys(regularArgs).length ? JSON.stringify(regularArgs) : '');
};

var isObject = exports.isObject = function isObject(val) {
  return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
};

var clone = exports.clone = function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
};

// export const scalarSafeClone = maybeObj => isObject(maybeObj) ? clone(maybeObj) : maybeObj;

var shallowPlus1Clone = exports.shallowPlus1Clone = function shallowPlus1Clone(obj) {
  if (!isObject(obj)) return obj;
  var dataKeys = Object.keys(obj);
  var newObj = {};
  for (var i = 0; i < dataKeys.length; i++) {
    var key = dataKeys[i];
    var prop = obj[key];
    var propClone = prop;
    if (Array.isArray(prop)) {
      propClone = prop.slice();
    } else if (isObject(prop)) {
      propClone = _extends({}, prop);
    }
    newObj[key] = propClone;
  }
  return newObj;
};

var makeErrorFreeResponse = exports.makeErrorFreeResponse = function makeErrorFreeResponse(cachedResponse) {
  var status = cachedResponse.status,
      setVariables = cachedResponse.setVariables;

  return {
    data: shallowPlus1Clone(cachedResponse.data),
    setVariables: setVariables,
    status: status
  };
};

var checkMutationInSchema = exports.checkMutationInSchema = function checkMutationInSchema(rootMutation, mutationName) {
  var mutationSchema = rootMutation.fields[mutationName];
  if (!mutationSchema) {
    throw new Error('Invalid mutation: ' + mutationName + '.\n    Did you make a typo or forget to update your schema?');
  }
};

var convertFragmentToInline = exports.convertFragmentToInline = function convertFragmentToInline(fragment) {
  delete fragment.name;
  fragment.kind = _kinds.INLINE_FRAGMENT;
  return fragment;
};

var parse = exports.parse = function parse(graphQLString) {
  return (0, _parser.parse)(graphQLString, { noLocation: true, noSource: true });
};

var buildExecutionContext = exports.buildExecutionContext = function buildExecutionContext(queryAST, params) {
  var clonedAST = clone(queryAST);

  var _teardownDocumentAST = teardownDocumentAST(clonedAST.definitions),
      operation = _teardownDocumentAST.operation,
      fragments = _teardownDocumentAST.fragments;

  return _extends({ operation: operation, fragments: fragments }, params);
};

var teardownDocumentAST = exports.teardownDocumentAST = function teardownDocumentAST(astDefinitions) {
  var operation = void 0;
  var fragments = {};
  for (var i = 0; i < astDefinitions.length; i++) {
    var definition = astDefinitions[i];
    if (definition.kind === _kinds.OPERATION_DEFINITION) {
      if (operation) {
        throw new Error('Multiple operations not supported');
      }
      operation = definition;
    } else if (definition.kind === _kinds.FRAGMENT_DEFINITION) {
      fragments[definition.name.value] = definition;
    }
  }
  if (!operation) {
    throw new Error('Must provide an operation.');
  }
  return { operation: operation, fragments: fragments };
};

/**
 * stateVars is the name for the variables stored in the redux state, which are the most current variables for an op.
 * @param {Object} cashayState the result of this.getState(), usually equivalent to store.getState().cashay
 * @param {Object} op the name of the container full of keys
 * @param {Object} key the key for the specified op, defaults to ''
 * */
var getStateVars = exports.getStateVars = function getStateVars(cashayState, op, key) {
  // explicitly return undefined so we can use default values in functions
  return cashayState.ops[op] && cashayState.ops[op][key] && cashayState.ops[op][key].variables || undefined;
};

var getVariables = exports.getVariables = function getVariables() {
  var initialVariables = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var cashayState = arguments[1];
  var op = arguments[2];
  var key = arguments[3];
  var cachedResponse = arguments[4];

  var stateVars = getStateVars(cashayState, op, key) || {};
  var newInitialVariables = resolveInitialVariables(cashayState, initialVariables, cachedResponse);
  // make the stateVars override the likely stale UD vars, but if the UD vars have something that used to be undefined, keep it
  return _extends({}, newInitialVariables, stateVars);
};

var resolveInitialVariables = function resolveInitialVariables(cashayState, initialVariables, cachedResponse) {
  var variableNames = Object.keys(initialVariables);
  var newVariables = {};
  for (var i = 0; i < variableNames.length; i++) {
    var variableName = variableNames[i];
    var value = initialVariables[variableName];
    newVariables[variableName] = typeof value === 'function' ? safeValue(cachedResponse, value, cashayState) : value;
  }
  return newVariables;
};

var safeValue = function safeValue(response, cb, cashayState) {
  return response && response.data && cb(response.data, cashayState);
};

var makeNamespaceString = exports.makeNamespaceString = function makeNamespaceString(op, name) {
  var d = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : DELIMITER;
  return '' + CASHAY + d + op + d + name;
};

var without = exports.without = function without(obj, exclusions) {
  var objKeys = Object.keys(obj);
  var newObj = {};
  for (var i = 0; i < objKeys.length; i++) {
    var key = objKeys[i];
    if (!exclusions.includes(key)) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};

var isLive = exports.isLive = function isLive(directives) {
  return Boolean(directives && directives.find(function (d) {
    return d.name.value === LIVE;
  }));
};

var getFieldSchema = exports.getFieldSchema = function getFieldSchema(field, maybeTypeSchema, schema) {
  var fieldName = field.name.value;
  var liveDirective = isLive(field.directives);
  var typeSchema = liveDirective ? schema.subscriptionSchema : maybeTypeSchema;
  var fieldSchema = typeSchema.fields[fieldName];
  if (!fieldSchema) {
    throw new Error(fieldName + ' isn\'t in the schema. Did you update your client schema?');
  }
  return fieldSchema;
};

var defaultResolveChannelKeyFactory = exports.defaultResolveChannelKeyFactory = function defaultResolveChannelKeyFactory(idFieldName, topLevelSource) {
  return function (source, args) {
    if (!topLevelSource) {
      return source[idFieldName] || '';
    } else {
      return args[idFieldName] ? args[idFieldName] : args[Object.keys(args)[0]] || '';
    }
  };
};

var makeFullChannel = exports.makeFullChannel = function makeFullChannel(channel, channelKey) {
  return channelKey ? '' + channel + NORM_DELIMITER + channelKey : channel;
};

var makeCachedArgs = exports.makeCachedArgs = function makeCachedArgs(argsArr, variables, schema) {
  var cachedArgs = {};
  for (var i = 0; i < argsArr.length; i++) {
    var arg = argsArr[i];
    var argName = arg.name.value;
    cachedArgs[argName] = getVariableValue(arg, variables);
  }
  if (cachedArgs.id && typeof cachedArgs.id !== 'string') {
    throw new Error('@cached \'id\' arg requires a string');
  }
  if (cachedArgs.ids && !Array.isArray(cachedArgs.ids)) {
    throw new Error('@cached \'ids\' arg requires an array');
  }

  var _parseCachedType = parseCachedType(cachedArgs.type),
      type = _parseCachedType.type;

  var typeSchema = schema.types[type];
  if (!typeSchema) {
    throw new Error('@cached type ' + type + ' does not exist in your schema!');
  }
  return cachedArgs;
};

var getVariableValue = exports.getVariableValue = function getVariableValue(arg, variables) {
  return arg.value.kind === _kinds.VARIABLE ? variables[arg.value.name.value] : arg.value.value;
};

var getTypeName = exports.getTypeName = function getTypeName(typeSchema, updatedData, doc) {
  if (typeSchema.kind === UNION) {
    var typeName = updatedData.__typename;
    if (!typeName) {
      throw new Error('Cannot determine typeName for incoming document ' + doc + '.');
    }
    return typeName;
  }
  return typeSchema.name;
};

var shallowEqual = exports.shallowEqual = function shallowEqual(obj1, obj2) {
  // obj1 is guaranteed to be different than obj2, so no need to check strict eq
  var obj1Keys = Object.keys(obj1);
  var obj2Keys = Object.keys(obj2);
  if (obj1Keys.length !== obj2Keys.length) return false;
  for (var i = 0; i < obj1Keys.length; i++) {
    var key = obj1Keys[i];
    if (obj1[key] !== obj2[key]) return false;
  }
  return true;
};

var parseCachedType = exports.parseCachedType = function parseCachedType(type) {
  if (type.startsWith('[')) {
    return {
      type: type.substr(1, type.length - 2),
      typeIsList: true
    };
  } else {
    return {
      type: type,
      typeIsList: false
    };
  }
};