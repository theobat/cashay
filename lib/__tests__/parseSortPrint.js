'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sortAST = exports.sortPrint = exports.parseSortPrint = undefined;

var _parser = require('graphql/language/parser');

var _printer = require('graphql/language/printer');

var _utils = require('../utils');

/**
 * This is a stupid little function that sorts fields by alias & then by name
 * That way, testing equality is easy
 */
var parseSortPrint = exports.parseSortPrint = function parseSortPrint(graphQLString) {
  var ast = (0, _parser.parse)(graphQLString, { noLocation: true, noSource: true });
  return sortPrint(ast);
};

var sortPrint = exports.sortPrint = function sortPrint(ast) {
  var _teardownDocumentAST = (0, _utils.teardownDocumentAST)(ast.definitions),
      operation = _teardownDocumentAST.operation;

  recurse(operation.selectionSet.selections);
  return (0, _printer.print)(ast);
};

var sortAST = exports.sortAST = function sortAST(ast) {
  var _teardownDocumentAST2 = (0, _utils.teardownDocumentAST)(ast.definitions),
      operation = _teardownDocumentAST2.operation;

  recurse(operation.selectionSet.selections);
  return ast;
};

var recurse = function recurse(astSelections) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = astSelections[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var selection = _step.value;

      if (selection.selectionSet) {
        recurse(selection.selectionSet.selections);
      }
    }
  } catch (err) {
    _didIteratorError = true;
    _iteratorError = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion && _iterator.return) {
        _iterator.return();
      }
    } finally {
      if (_didIteratorError) {
        throw _iteratorError;
      }
    }
  }

  astSelections.sort(sortFields);
};

// if true, b moves forward
var sortFields = function sortFields(a, b) {
  if (a.alias) {
    if (b.alias) {
      // if both have aliases, sort them alphabetically
      return a.alias.value > b.alias.value;
    }
    // if a has an alias, put it ahead of b
    return false;
  } else if (b.alias) {
    // if b has an alias, put it ahead of a
    return true;
  }
  if (a.name) {
    if (b.name) {
      // if both have names, sort them alphabetically
      return a.name.value > b.name.value;
    }
    // if a has a name, put it ahead of b
    return false;
  } else if (b.name) {
    // if b has a name, put it ahead of a
    return true;
  }
  if (a.selectionSet) {
    if (b.selectionSet) {
      // if both are inline frags, sort by the length
      return a.selectionSet.selections.length > b.selectionSet.selections.length;
    }
    return false;
  } else if (b.selectionSet) {
    return true;
  }
};
// inline frags don't have names, so just stick em at the end
// const sortField = field => (field.alias && field.alias.value) ||
// (field.name && field.name.value) ||
// (field.selectionSet.selections[0].name && field.selectionSet.selections[0].name.value) ||
// Infinity;