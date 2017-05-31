'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = isMutationResponseScalar;

var _utils = require('../utils');

var _introspection = require('graphql/type/introspection');

var SCALAR = _introspection.TypeKind.SCALAR;
function isMutationResponseScalar(schema, mutationName) {
  var mutationFieldSchema = schema.mutationSchema.fields[mutationName];
  var mutationResponseType = (0, _utils.ensureRootType)(mutationFieldSchema.type);
  var mutationResponseSchema = schema.types[mutationResponseType.name];
  return mutationResponseSchema.kind === SCALAR;
}