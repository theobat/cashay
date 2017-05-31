'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeArgsFromVars;

var _helperClasses = require('../helperClasses');

var _kinds = require('graphql/language/kinds');

function makeArgsFromVars(mutationFieldSchema, variables) {
  var mutationArgs = [];
  var argKeys = Object.keys(mutationFieldSchema.args);
  for (var i = 0; i < argKeys.length; i++) {
    var argKey = argKeys[i];
    var schemaArg = mutationFieldSchema.args[argKey];
    if (variables.hasOwnProperty(schemaArg.name)) {
      var newArg = new _helperClasses.RequestArgument(schemaArg.name, _kinds.VARIABLE, schemaArg.name);
      mutationArgs.push(newArg);
    }
  }
  return mutationArgs;
};