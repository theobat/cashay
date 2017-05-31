"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = hasMatchingVariables;
function hasMatchingVariables(variables, matchingSet) {
  var varKeys = Object.keys(variables);
  if (varKeys.length !== matchingSet.size) return false;
  for (var i = 0; i < varKeys.length; i++) {
    var varKey = varKeys[i];
    if (!matchingSet.has(varKey)) return false;
  }
  return true;
};