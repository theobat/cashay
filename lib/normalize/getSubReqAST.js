'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getSubReqAST = undefined;

var _kinds = require('graphql/language/kinds');

var getSubReqAST = exports.getSubReqAST = function getSubReqAST(key, reqAST, unionType) {
  var subReqAST = void 0;
  var fields = reqAST.selectionSet.selections;
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (field.kind === _kinds.INLINE_FRAGMENT) {
      if (field.typeCondition.name.value !== unionType) continue;
      subReqAST = getSubReqAST(key, field);
    } else {
      var aliasOrFieldName = field.alias && field.alias.value || field.name.value;
      if (aliasOrFieldName === key) {
        subReqAST = field;
      }
    }
    if (subReqAST) {
      return subReqAST;
    }
  }
  throw new Error(key + ' was found in the query response, but not the request.\n    Did you optimistically add more fields than you originally requested?');
};