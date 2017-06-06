'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.printMinimalQuery = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _printer = require('graphql/language/printer');

var _kinds = require('graphql/language/kinds');

var _queryHelpers = require('./queryHelpers');

var _createVariableDefinitions = require('../createVariableDefinitions');

var _createVariableDefinitions2 = _interopRequireDefault(_createVariableDefinitions);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var printMinimalQuery = exports.printMinimalQuery = function printMinimalQuery(reqAST, idFieldName, variables, op, schema, forceFetch) {
  var context = {
    forceFetch: forceFetch,
    op: op,
    schema: schema
  };
  console.log((0, _printer.print)(reqAST));
  reqAST.variableDefinitions = minimizeQueryAST(reqAST, idFieldName, variables, schema.querySchema, [], context);
  console.log((0, _printer.print)(reqAST));
  return (0, _printer.print)(reqAST);
};

var unqueriableDirectives = [_utils.LIVE, _utils.CACHED];
var safeToSendDirectives = function safeToSendDirectives(directives) {
  for (var i = 0; i < directives.length; i++) {
    var directive = directives[i];
    if (unqueriableDirectives.includes(directive.name.value)) {
      return false;
    }
  }
  return true;
};

// mutates initialVariableDefinitions
var minimizeQueryAST = function minimizeQueryAST(reqAST, idFieldName, variables, subSchema) {
  var initialVariableDefinitions = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : [];
  var context = arguments[5];
  var selections = reqAST.selectionSet.selections;

  console.log(reqAST && reqAST.name && reqAST.name.value);
  for (var i = 0; i < selections.length; i++) {
    var field = selections[i];
    // if it has to go to the server, create some variable definitions and remove the pieces that don't have the required vars
    if ((field.sendToServer || context.forceFetch) && safeToSendDirectives(field.directives)) {
      var fieldSchema = subSchema.fields[field.name.value];
      if (field.arguments && field.arguments.length) {
        var createVarDefContext = _extends({}, context, { initialVariableDefinitions: initialVariableDefinitions });

        var _createVariableDefini = (0, _createVariableDefinitions2.default)(field.arguments, fieldSchema, false, createVarDefContext),
            variableDefinitions = _createVariableDefini.variableDefinitions;

        var allVarDefs = [].concat(_toConsumableArray(initialVariableDefinitions), _toConsumableArray(variableDefinitions));
        var missingRequiredVars = (0, _queryHelpers.getMissingRequiredVariables)(allVarDefs, variables);
        var hasMissingVar = findMissingVar(field.arguments, missingRequiredVars);
        if (hasMissingVar) {
          // remove fields that aren't given the vars they need to be successful
          selections[i] = undefined;
          continue;
        } else {
          // MUTATIVE
          initialVariableDefinitions.push.apply(initialVariableDefinitions, _toConsumableArray(variableDefinitions));
        }
      }
      if (field.selectionSet) {
        var fieldSchemaType = (0, _utils.ensureRootType)(fieldSchema.type);
        var nextSchema = context.schema.types[fieldSchemaType.name];
        // mutates initialVariableDefinitions
        minimizeQueryAST(field, idFieldName, variables, nextSchema, initialVariableDefinitions, context);
      }
    } else if (field.name.value !== idFieldName) {
      selections[i] = undefined;
    }
  }
  // clean up unnecessary children
  var minimizedFields = selections.filter(Boolean);

  // if there aren't any fields or maybe just an unnecessary id field, remove the req
  var firstField = minimizedFields[0];
  if (!firstField || minimizedFields.length === 1 && !firstField.sendToServer && firstField.name && firstField.name.value === idFieldName) {
    // reqAST.selectionSet = null;
  } else {
    reqAST.selectionSet.selections = minimizedFields;
  }
  // length will be >= than how it started
  return initialVariableDefinitions;
};

var findMissingVar = function findMissingVar(fieldArgs, missingRequiredVars) {
  for (var i = 0; i < fieldArgs.length; i++) {
    var fieldArg = fieldArgs[i];
    if (fieldArg.value.kind === _kinds.VARIABLE) {
      if (missingRequiredVars.includes(fieldArg.name.value)) {
        return true;
      }
    }
  }
};