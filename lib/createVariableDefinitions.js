'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = createVariableDefinitions;

var _utils = require('./utils');

var _kinds = require('graphql/language/kinds');

var _helperClasses = require('./helperClasses');

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createVariableDefinitions(argsToDefine, fieldSchema, isNamespaced, context) {
  var initialVariableDefinitions = context.initialVariableDefinitions,
      op = context.op,
      opStateVars = context.opStateVars,
      schema = context.schema;

  var variableDefinitions = [];
  var variableEnhancers = [];
  var bagArgs = function bagArgs(argsToDefine, fieldSchema) {
    for (var i = 0; i < argsToDefine.length; i++) {
      var arg = argsToDefine[i];
      var argName = arg.name.value;
      var argKind = arg.value.kind;
      if (argKind === _kinds.VARIABLE) {
        (function () {
          var variableName = arg.value.name.value;
          var variableDefOfArg = initialVariableDefinitions.find(function (def) {
            return def.variable.name.value === variableName;
          });
          if (isNamespaced) {
            // namespace the variable definitions & create the enhancer for each
            var namespaceKey = (0, _utils.makeNamespaceString)(op, variableName);
            if (!variableDefOfArg) {
              var newVariableDef = makeVariableDefinition(argName, namespaceKey, fieldSchema);
              variableDefinitions.push(newVariableDef);
            }
            var variableEnhancer = enhancerFactory(opStateVars, variableName, namespaceKey);
            variableEnhancers.push(variableEnhancer);
          } else if (!variableDefOfArg) {
            var _newVariableDef = makeVariableDefinition(argName, variableName, fieldSchema);
            variableDefinitions.push(_newVariableDef);
          }
        })();
      } else if (argKind === _kinds.OBJECT) {
        var argSchema = fieldSchema.args[argName];
        var rootArgType = (0, _utils.ensureRootType)(argSchema.type);
        var subSchema = schema.types[rootArgType.name];
        bagArgs(arg.value.fields, subSchema);
      }
    }
  };
  bagArgs(argsToDefine, fieldSchema);
  return { variableDefinitions: variableDefinitions, variableEnhancers: variableEnhancers };
};

var makeVariableDefinition = function makeVariableDefinition(argName, variableName, fieldSchema) {
  // we're not sure whether we're inside an arg or an input object
  var fields = fieldSchema.args || fieldSchema.inputFields;
  var argSchema = fields[argName];
  if (!argSchema) {
    throw new Error('Invalid argument: ' + argName);
  }
  return new _helperClasses.VariableDefinition(variableName, argSchema.type);
};

var enhancerFactory = function enhancerFactory(opStateVars, variableName, namespaceKey) {
  return function (variablesObj) {
    return _extends({}, variablesObj, _defineProperty({}, namespaceKey, opStateVars[variableName]));
  };
};