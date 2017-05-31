'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createBasicMutation;

var _printer = require('graphql/language/printer');

var _makeArgsFromVars = require('./makeArgsFromVars');

var _makeArgsFromVars2 = _interopRequireDefault(_makeArgsFromVars);

var _helperClasses = require('../helperClasses');

var _createVariableDefinitions = require('../createVariableDefinitions');

var _createVariableDefinitions2 = _interopRequireDefault(_createVariableDefinitions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createBasicMutation(mutationName, schema, variables) {
  var mutationFieldSchema = schema.mutationSchema.fields[mutationName];
  if (!mutationFieldSchema) {
    throw new Error(mutationName + ' not found in your mutation schema! Did you include it?');
  }
  var mutationArgs = (0, _makeArgsFromVars2.default)(mutationFieldSchema, variables);
  var context = { schema: schema, initialVariableDefinitions: [] };

  var _createVariableDefini = (0, _createVariableDefinitions2.default)(mutationArgs, mutationFieldSchema, false, context),
      variableDefinitions = _createVariableDefini.variableDefinitions;

  var mutationAST = new _helperClasses.MutationShell(mutationName, mutationArgs, variableDefinitions, true);
  return (0, _printer.print)(mutationAST);
}