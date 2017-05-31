'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createMutationFromQuery;

var _utils = require('../utils');

var _helperClasses = require('../helperClasses');

var _mergeMutations = require('./mergeMutations');

var _introspection = require('graphql/type/introspection');

var _findTypeInQuery = require('./findTypeInQuery');

var _findTypeInQuery2 = _interopRequireDefault(_findTypeInQuery);

var _makeArgsFromVars = require('./makeArgsFromVars');

var _makeArgsFromVars2 = _interopRequireDefault(_makeArgsFromVars);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

var SCALAR = _introspection.TypeKind.SCALAR;
function createMutationFromQuery(operation, mutationName) {
  var mutationVariables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  var schema = arguments[3];

  var mutationFieldSchema = schema.mutationSchema.fields[mutationName];
  var mutationResponseType = (0, _utils.ensureRootType)(mutationFieldSchema.type);
  var mutationResponseSchema = schema.types[mutationResponseType.name];

  // generating a mutation string requires guessing at what field arguments to pass in
  // if the variables object includes something with the same name as the arg name, that's probably a fair heuristic
  var mutationArgs = (0, _makeArgsFromVars2.default)(mutationFieldSchema, mutationVariables);
  var mutationAST = new _helperClasses.MutationShell(mutationName, mutationArgs);

  // Assume the mutationResponseSchema is a single type (opposed to a payload full of many types)
  var simpleSelections = trySimplePayload(mutationResponseSchema.name, operation, schema);
  if (simpleSelections) {
    mutationAST.definitions[0].selectionSet.selections[0].selectionSet.selections = simpleSelections;
    return mutationAST;
  }

  // guess it's full of many types!
  return tryComplexPayload(mutationAST, operation, mutationResponseSchema, schema);
};

var trySimplePayload = function trySimplePayload(typeName, operation, schema) {
  var selectionsInQuery = (0, _findTypeInQuery2.default)(typeName, operation, schema);
  if (selectionsInQuery.length) {
    var allSelections = flattenFoundSelections(selectionsInQuery);
    // TODO for simple payloads, I think pushing a clone of allSelections is good enough
    return createMergedCopy(allSelections);
  }
};

var tryComplexPayload = function tryComplexPayload(mutationAST, operation, mutationResponseSchema, schema) {
  var atLeastOne = false;

  // the payload itself isn't used, since it's just a shell for the many fields inside
  // technically, this could (should?) be recursive, but cashay enforces best practices
  // and putting an abstract inside an abstract is wrong
  var payloadFieldKeys = Object.keys(mutationResponseSchema.fields);

  for (var i = 0; i < payloadFieldKeys.length; i++) {
    var payloadFieldKey = payloadFieldKeys[i];
    var payloadField = mutationResponseSchema.fields[payloadFieldKey];
    var rootPayloadFieldType = (0, _utils.ensureRootType)(payloadField.type);

    // For scalars, make sure the names match (don't want a million strings in the mutation request)
    var matchName = rootPayloadFieldType.kind === SCALAR && payloadField.name;
    var selectionsInQuery = (0, _findTypeInQuery2.default)(rootPayloadFieldType.name, operation, schema, matchName);
    if (selectionsInQuery.length) {
      atLeastOne = true;
      var allSelections = matchName ? selectionsInQuery : flattenFoundSelections(selectionsInQuery);
      var mutationField = void 0;
      if (matchName) {
        mutationField = new _helperClasses.Field({ name: matchName });
      } else {
        var newSelections = createMergedCopy(allSelections);
        // make a payload field into a mutation field
        mutationField = new _helperClasses.Field({ name: payloadFieldKey, selections: newSelections });
      }
      mutationAST.definitions[0].selectionSet.selections[0].selectionSet.selections.push(mutationField);
    }
  }
  if (!atLeastOne) {
    throw new Error('Could not generate a mutation from ' + operation.selectionSet.selections[0].name.value + '. \n    Verify that ' + mutationResponseSchema.name + ' is correct and the schema is updated. \n    If it includes scalars, make sure those are aliased in the query.');
  }
  return mutationAST;
};

var flattenFoundSelections = function flattenFoundSelections(selectionsInQuery) {
  var allSelections = [];
  for (var i = 0; i < selectionsInQuery.length; i++) {
    var selections = selectionsInQuery[i].selectionSet.selections;

    allSelections.push.apply(allSelections, _toConsumableArray(selections));
  }
  return allSelections;
};

var createMergedCopy = function createMergedCopy(allSelections) {
  var firstSelection = allSelections.pop();
  if (!firstSelection) return;
  var targetSelections = [(0, _utils.clone)(firstSelection)];
  (0, _mergeMutations.mergeSelections)(targetSelections, allSelections);
  return targetSelections;
};