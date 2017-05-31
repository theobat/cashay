'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

exports.default = namespaceMutation;

var _utils = require('../utils');

var _kinds = require('graphql/language/kinds');

var _helperClasses = require('../helperClasses');

var _createVariableDefinitions = require('../createVariableDefinitions');

var _createVariableDefinitions2 = _interopRequireDefault(_createVariableDefinitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function namespaceMutation(mutationAST, op) {
  var opStateVars = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var schema = arguments[3];

  var _teardownDocumentAST = (0, _utils.teardownDocumentAST)(mutationAST.definitions),
      operation = _teardownDocumentAST.operation,
      fragments = _teardownDocumentAST.fragments;

  var mainMutation = operation.selectionSet.selections[0];
  var fieldSchema = schema.mutationSchema.fields[mainMutation.name.value];
  var startingContext = { op: op, opStateVars: opStateVars, schema: schema, fragments: fragments, initialVariableDefinitions: [] };
  // query-level fields are joined, not namespaced, so we have to treat them differently

  var _createVariableDefini = (0, _createVariableDefinitions2.default)(mainMutation.arguments, fieldSchema, false, startingContext),
      initialVariableDefinitions = _createVariableDefini.variableDefinitions,
      variableEnhancers = _createVariableDefini.variableEnhancers;

  var context = _extends({}, startingContext, { fragments: fragments, initialVariableDefinitions: initialVariableDefinitions });
  operation.variableDefinitions = initialVariableDefinitions;
  var rootSchemaType = (0, _utils.ensureRootType)(fieldSchema.type);
  var subSchema = schema.types[rootSchemaType.name];
  if (mainMutation.selectionSet) {
    // MUTATES SELECTIONS, CONTEXT VARIABLE DEFS, AND VARIABLE ENHANCERS. AND IT'S REALLY HARD TO MAKE IT FUNCTIONAL & PERFORMANT
    namespaceAndInlineFrags(mainMutation.selectionSet.selections, subSchema, variableEnhancers, context);
  }

  // just take the operation & leave behind the fragment spreads, since we inlined them
  mutationAST.definitions = [operation];
  return { namespaceAST: mutationAST, variableEnhancers: variableEnhancers };
};

var namespaceAndInlineFrags = function namespaceAndInlineFrags(fieldSelections, typeSchema, variableEnhancers, context) {
  for (var i = 0; i < fieldSelections.length; i++) {
    var selection = fieldSelections[i];
    if (selection.kind === _kinds.FRAGMENT_SPREAD) {
      var fragment = (0, _utils.clone)(context.fragments[selection.name.value]);
      fieldSelections[i] = selection = (0, _utils.convertFragmentToInline)(fragment);
    }
    if (selection.kind === _kinds.INLINE_FRAGMENT) {
      // if the fragment is unnecessary, remove it
      if (selection.typeCondition === null) {
        fieldSelections.push.apply(fieldSelections, _toConsumableArray(selection.selectionSet.selections));
        // since we're pushing to the looped array, going in reverse won't save us from not having to change i
        fieldSelections.splice(i--, 1);
      } else {
        namespaceAndInlineFrags(selection.selectionSet.selections, typeSchema, variableEnhancers, context);
      }
      continue;
    }
    var selectionName = selection.name.value;
    if (selectionName.startsWith('__')) continue;
    var fieldSchema = typeSchema.fields[selectionName];
    if (selection.arguments && selection.arguments.length) {
      var _context$initialVaria;

      var aliasOrFieldName = selection.alias && selection.alias.value || selection.name.value;
      var namespaceAlias = (0, _utils.makeNamespaceString)(context.op, aliasOrFieldName);
      selection.alias = new _helperClasses.Name(namespaceAlias);
      var mutations = (0, _createVariableDefinitions2.default)(selection.arguments, fieldSchema, true, context);
      (_context$initialVaria = context.initialVariableDefinitions).push.apply(_context$initialVaria, _toConsumableArray(mutations.variableDefinitions));
      variableEnhancers.push.apply(variableEnhancers, _toConsumableArray(mutations.variableEnhancers));
    } else {
      // guarantee that props without args are also without aliases
      // that way, we can share fields across mutations & not make the server repeat the same action twice
      selection.alias = null;
    }
    if (selection.selectionSet) {
      var fieldType = (0, _utils.ensureRootType)(fieldSchema.type);
      var subSchema = context.schema.types[fieldType.name];
      namespaceAndInlineFrags(selection.selectionSet.selections, subSchema, variableEnhancers, context);
    }
  }
};