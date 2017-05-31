'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.VariableDefinition = exports.RequestArgument = exports.MutationShell = exports.Field = exports.Name = exports.CachedQuery = exports.CachedSubscription = exports.CachedMutation = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _kinds = require('graphql/language/kinds');

var _introspection = require('graphql/type/introspection');

var _duck = require('./normalize/duck');

var _denormalizeStore = require('./normalize/denormalizeStore');

var _denormalizeStore2 = _interopRequireDefault(_denormalizeStore);

var _parseAndInitializeQuery = require('./query/parseAndInitializeQuery');

var _parseAndInitializeQuery2 = _interopRequireDefault(_parseAndInitializeQuery);

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LIST = _introspection.TypeKind.LIST,
    NON_NULL = _introspection.TypeKind.NON_NULL;

var CachedMutation = exports.CachedMutation = function () {
  function CachedMutation() {
    _classCallCheck(this, CachedMutation);

    this.fullMutation = undefined;
    this.activeQueries = {};
    this.variableEnhancers = [];
    this.variableSet = new Set();
    this.singles = {};
  }

  _createClass(CachedMutation, [{
    key: 'clear',
    value: function clear(clearSingles) {
      this.fullMutation = undefined;
      this.variableEnhancers = [];
      this.variableSet.clear();
      if (clearSingles) {
        this.singles = {};
      }
    }
  }]);

  return CachedMutation;
}();

var CachedSubscription = exports.CachedSubscription = function CachedSubscription(subscriptionString, key, deps) {
  _classCallCheck(this, CachedSubscription);

  this.ast = (0, _utils.parse)(subscriptionString);
  this.deps = deps;
  this.responses = _defineProperty({}, key, {});
};

var CachedQuery = exports.CachedQuery = function () {
  function CachedQuery(queryString, schema, idFieldName, refetch, key) {
    _classCallCheck(this, CachedQuery);

    this.ast = (0, _parseAndInitializeQuery2.default)(queryString, schema, idFieldName);
    this.refetch = refetch;
    this.responses = _defineProperty({}, key, {});
  }

  /**
   * create a denormalized document from local data
   * it also turns frags to inline, and flags missing objects and variableDefinitions in context.operation
   */


  _createClass(CachedQuery, [{
    key: 'createResponse',
    value: function createResponse(context, op, key, dispatch, getState, forceFetch) {
      var data = (0, _denormalizeStore2.default)(context);
      var isComplete = !forceFetch && !context.operation.sendToServer;
      this.responses[key] = {
        data: data,
        setVariables: this.setVariablesFactory(op, key, dispatch, getState),
        status: isComplete ? _utils.COMPLETE : _utils.LOADING
      };
    }
  }, {
    key: 'setVariablesFactory',
    value: function setVariablesFactory(op, key, dispatch, getState) {
      var _this = this;

      return function (cb) {
        // trigger an invalidation
        _this.responses[key] = undefined;
        var cashayState = getState();
        var stateVars = (0, _utils.getStateVars)(cashayState, op, key) || {};
        var variables = _extends({}, stateVars, cb(stateVars));
        var payload = { ops: _defineProperty({}, op, _defineProperty({}, key, { variables: variables })) };

        // trigger a recompute
        dispatch({
          type: _duck.SET_VARIABLES,
          payload: payload
        });
      };
    }
  }]);

  return CachedQuery;
}();

var SelectionSet = function SelectionSet() {
  var selections = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];

  _classCallCheck(this, SelectionSet);

  this.kind = _kinds.SELECTION_SET;
  this.selections = selections;
};

var Name = exports.Name = function Name(value) {
  _classCallCheck(this, Name);

  this.kind = _kinds.NAME;
  this.value = value;
};

var Field = exports.Field = function Field(_ref) {
  var alias = _ref.alias,
      args = _ref.args,
      directives = _ref.directives,
      name = _ref.name,
      selections = _ref.selections;

  _classCallCheck(this, Field);

  this.kind = _kinds.FIELD;
  this.alias = alias;
  this.arguments = args;
  this.directives = directives;
  this.name = new Name(name);
  this.selectionSet = selections ? new SelectionSet(selections) : null;
};

var MutationShell = exports.MutationShell = function MutationShell(mutationName) {
  var mutationArgs = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var variableDefinitions = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
  var isEmpty = arguments[3];

  _classCallCheck(this, MutationShell);

  this.kind = _kinds.DOCUMENT;
  this.definitions = [{
    kind: _kinds.OPERATION_DEFINITION,
    operation: 'mutation',
    variableDefinitions: variableDefinitions,
    directives: [],
    selectionSet: new SelectionSet([new Field({
      args: mutationArgs,
      name: mutationName,
      selections: isEmpty ? null : []
    })])
  }];
};

var RequestArgument = exports.RequestArgument = function RequestArgument(nameValue, valueKind, valueValue) {
  _classCallCheck(this, RequestArgument);

  this.kind = _kinds.ARGUMENT;
  this.name = new Name(nameValue);
  this.value = {
    kind: valueKind
  };
  if (valueKind === _kinds.VARIABLE) {
    this.value.name = new Name(valueValue);
  } else {
    this.value.value = valueValue;
  }
};

var VariableDefinition = exports.VariableDefinition = function VariableDefinition(variableName, argType) {
  _classCallCheck(this, VariableDefinition);

  this.kind = _kinds.VARIABLE_DEFINITION;
  this.type = processArgType(argType);
  this.variable = {
    kind: _kinds.VARIABLE,
    name: new Name(variableName)
  };
};

var processArgType = function processArgType(argType) {
  var vardefType = {};
  if (argType.kind === NON_NULL) {
    vardefType.kind = _kinds.NON_NULL_TYPE;
    vardefType.type = processArgType(argType.ofType);
  } else if (argType.kind === LIST) {
    vardefType.kind = _kinds.LIST_TYPE;
    vardefType.type = processArgType(argType.ofType);
  } else {
    vardefType.kind = _kinds.NAMED_TYPE;
    vardefType.name = new Name(argType.name);
  }
  return vardefType;
};