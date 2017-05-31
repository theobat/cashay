'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = separateArgs;

var _kinds = require('graphql/language/kinds');

var _introspection = require('graphql/type/introspection');

var _utils = require('../utils');

var LIST = _introspection.TypeKind.LIST;


var acceptsArgs = function acceptsArgs(fieldSchema, paginationWords, paginationWordKeys) {
  var acceptsPaginationArgs = false;
  var acceptsRegularArgs = false;
  for (var i = 0; i < paginationWordKeys.length; i++) {
    var key = paginationWordKeys[i];
    var pageWord = paginationWords[key];
    if (fieldSchema.args[pageWord]) {
      acceptsPaginationArgs = true;
    } else {
      acceptsRegularArgs = true;
    }
  }
  return { acceptsPaginationArgs: acceptsPaginationArgs, acceptsRegularArgs: acceptsRegularArgs };
};
/**
 * Determine whether the arguments provided are going to be used for pagination
 * @param {Object} fieldSchema a piece of the GraphQL client schema for the particular field
 * @param {Array} reqASTArgs the arguments coming from the request AST
 * @param {Object} paginationWords an object containing the 4 pagination meanings & the user-defined words they use
 * @param {Object} variables the variables to forward onto the GraphQL server
 * */
function separateArgs(fieldSchema, reqASTArgs, paginationWords, variables) {
  if (!fieldSchema.args) {
    throw new Error(fieldSchema.name + ' does not support arguments. Check your GraphQL query.');
  }
  var responseType = (0, _utils.ensureTypeFromNonNull)(fieldSchema.type);
  var regularArgs = {};
  var paginationArgs = {};
  var paginationWordKeys = Object.keys(paginationWords);

  var _acceptsArgs = acceptsArgs(fieldSchema, paginationWords, paginationWordKeys),
      acceptsPaginationArgs = _acceptsArgs.acceptsPaginationArgs,
      acceptsRegularArgs = _acceptsArgs.acceptsRegularArgs;

  var hasPagination = false;

  var _loop = function _loop(i) {
    var arg = reqASTArgs[i];
    // if cashay added this argument, ignore it
    // TODO figure out another way. i hate checking constructors.
    if (arg.constructor.name === 'RequestArgument') return 'continue';
    var argName = arg.name.value;
    if (!fieldSchema.args[argName]) {
      throw new Error(fieldSchema.name + ' does not support ' + argName);
    }
    var argValue = (0, _utils.getVariableValue)(arg, variables);
    if (argValue === undefined) return 'continue';
    var paginationMeaning = paginationWordKeys.find(function (pageWord) {
      return paginationWords[pageWord] === argName;
    });
    if (paginationMeaning) {
      if (paginationMeaning === _utils.BEFORE || paginationMeaning === _utils.AFTER) {
        throw new Error('Supplying pagination cursors to cashay is not supported. ' + variables);
      }
      if (hasPagination === true) {
        throw new Error('Only one pagination argument can be supplied at a time. ' + variables);
      }
      if (responseType.kind !== LIST) {
        throw new Error(fieldSchema.name + ' is not a List. ' + variables + ' should not contain pagination args');
      }
      paginationArgs[paginationMeaning] = +argValue;
      hasPagination = true;
    } else {
      regularArgs[argName] = argValue;
    }
  };

  for (var i = 0; i < reqASTArgs.length; i++) {
    var _ret = _loop(i);

    if (_ret === 'continue') continue;
  }
  return {
    regularArgs: acceptsRegularArgs && regularArgs,
    paginationArgs: acceptsPaginationArgs && paginationArgs
  };
};