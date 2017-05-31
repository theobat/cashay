'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.mergeSelections = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

exports.default = mergeMutations;

var _kinds = require('graphql/language/kinds');

var _utils = require('../utils');

var _printer = require('graphql/language/printer');

function mergeMutations(cachedSingles) {
  var firstSingle = cachedSingles.pop();

  // deep copy to create the base AST (slow, but faster than a parse!)
  var mergedAST = (0, _utils.clone)(firstSingle);
  var mainOperation = mergedAST.definitions[0];
  var mainMutation = mainOperation.selectionSet.selections[0];

  // now add the new ASTs one-by-one
  for (var i = 0; i < cachedSingles.length; i++) {
    var single = cachedSingles[i];
    var nextOperation = single.definitions[0];
    var nextMutation = nextOperation.selectionSet.selections[0];
    mergeVariableDefinitions(mainOperation.variableDefinitions, nextOperation.variableDefinitions);
    mergeNewAST(mainMutation, nextMutation);
  }
  return (0, _printer.print)(mergedAST);
};

var mergeVariableDefinitions = function mergeVariableDefinitions(mainVarDefs, nextVarDefs) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    var _loop = function _loop() {
      var varDef = _step.value;

      var nextName = varDef.variable.name.value;
      var varDefInMain = mainVarDefs.find(function (def) {
        return def.variable.name.value === nextName;
      });
      if (!varDefInMain) {
        mainVarDefs.push(varDef);
      }
    };

    for (var _iterator = nextVarDefs[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      _loop();
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
};

var mergeNewAST = function mergeNewAST(target, src) {
  if (target.name.value !== src.name.value) {
    throw new Error('Cannot merge two different mutations: \n    ' + target.name.value + ' and ' + src.name.value + '.\n    Did you include the wrong componentId in the mutation call?\n    Make sure each mutation operation only calls a single mutation \n    and that customMutations are correct.');
  }
  mergeMutationArgs(target.arguments, src.arguments);
  mergeSelections(target.selectionSet.selections, src.selectionSet.selections);
};

/**
 * Mutates the targetSelections by adding srcSelections & excluding the duplicates
 */
var mergeSelections = exports.mergeSelections = function mergeSelections(targetSelections, srcSelections) {
  for (var i = 0; i < srcSelections.length; i++) {
    var selection = srcSelections[i];
    mergeSingleProp(targetSelections, selection);
  }
};

var mergeSingleProp = function mergeSingleProp(targetSelections, srcProp) {
  if (srcProp.kind === _kinds.INLINE_FRAGMENT) {
    var _ret2 = function () {
      // typeCondition is guaranteed to exist thanks to namespaceMutation
      var srcTypeCondition = srcProp.typeCondition.name.value;
      var targetFragment = targetSelections.find(function (field) {
        return field.kind === _kinds.INLINE_FRAGMENT && field.typeCondition.name.value === srcTypeCondition;
      });
      if (!targetFragment) {
        // by pushing a clone, we don't have to clone the srcProp beforehand, making for the smallest amount of cloning possible
        targetSelections.push((0, _utils.clone)(srcProp));
      } else {
        mergeSelections(targetFragment.selectionSet.selections, srcProp.selectionSet.selections);
      }
      return {
        v: void 0
      };
    }();

    if ((typeof _ret2 === 'undefined' ? 'undefined' : _typeof(_ret2)) === "object") return _ret2.v;
  }
  if (srcProp.alias) {
    // alias infers args, which means we can't join anything
    targetSelections.push((0, _utils.clone)(srcProp));
  } else {
    (function () {
      var propName = srcProp.name.value;
      var propInTarget = targetSelections.find(function (selection) {
        return !selection.alias && selection.name.value === propName;
      });
      if (propInTarget) {
        if (propInTarget.selectionSet) {
          mergeSelections(propInTarget.selectionSet.selections, srcProp.selectionSet.selections);
        }
      } else {
        targetSelections.push((0, _utils.clone)(srcProp));
      }
    })();
  }
};

/**
 * For the mutation itself, try to merge args
 * but for children of the mutation, don't
 */
var mergeMutationArgs = function mergeMutationArgs(targetArgs, srcArgs) {
  var _loop2 = function _loop2(i) {
    var srcArg = srcArgs[i];
    var targetArg = targetArgs.find(function (arg) {
      return arg.name.value === srcArg.name.value;
    });
    if (targetArg) {
      if (targetArg.value.kind === _kinds.OBJECT) {
        if (srcArg.value.kind === _kinds.OBJECT) {
          // handle input objects
          mergeMutationArgs(targetArg.value.fields, srcArg.value.fields);
        } else {
          throw new Error('Conflicting kind for argument: ' + targetArg.name.value);
        }
      } else if (targetArg.value.value !== srcArg.value.value) {
        throw new Error('Conflicting values for argument: ' + targetArg.name.value);
      }
    } else {
      targetArgs.push((0, _utils.clone)(srcArg));
    }
  };

  for (var i = 0; i < srcArgs.length; i++) {
    _loop2(i);
  }
};