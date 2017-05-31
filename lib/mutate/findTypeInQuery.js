'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = findTypeInQuery;

var _kinds = require('graphql/language/kinds');

var _utils = require('../utils');

/**
 * Traverses a query AST operation looking for a specific type (for objects) or name (for scalars)
 * Uses a BFS since return values are likely high up the tree & scalars can break as soon as a matching name is found
 *
 * @param {String} typeName the type of GraphQL object to look for
 * @param {Object} operation the request AST's definition to traverse
 * @param {Object} schema the cashay client schema
 * @param {String} [matchName] if provided, it will match by typeName AND matchName (used for scalars)
 *
 * @returns {Array} a bag full of selections whose children will be added to the mutation response
 */
function findTypeInQuery(typeName, operation, schema, matchName) {
  var bag = [];
  var queue = [];
  var next = {
    operation: operation,
    typeSchema: schema.querySchema
  };
  while (next) {
    var _next = next,
        _operation = _next.operation,
        typeSchema = _next.typeSchema;

    if (_operation.selectionSet) {
      var selections = _operation.selectionSet.selections;

      for (var i = 0; i < selections.length; i++) {
        var selection = selections[i];
        var subSchema = void 0;
        if (selection.kind === _kinds.INLINE_FRAGMENT) {
          subSchema = typeSchema;
        } else {
          var selectionName = selection.name.value;
          var cachedDirective = selection.directives.find(function (d) {
            return d.name.value === 'cached';
          });
          if (cachedDirective) {
            var typeArg = cachedDirective.arguments.find(function (arg) {
              return arg.name.value === 'type';
            });
            // this will throw if type isn't static
            var _typeName = (0, _utils.getVariableValue)(typeArg);

            var _parseCachedType = (0, _utils.parseCachedType)(_typeName),
                type = _parseCachedType.type;

            subSchema = schema.types[type];
          } else {
            var fieldSchema = typeSchema.fields[selectionName];
            var rootFieldType = (0, _utils.ensureRootType)(fieldSchema.type);
            subSchema = schema.types[rootFieldType.name];
          }
          if (subSchema.name === typeName) {
            if (matchName) {
              var fieldNameOrAlias = selection.alias && selection.alias.value || selectionName;
              if (matchName === fieldNameOrAlias) {
                bag[0] = selection;
                return bag;
              }
            } else {
              bag.push(selection);
            }
          }
        }
        queue.push({
          operation: selection,
          typeSchema: subSchema
        });
      }
    }
    next = queue.shift();
  }
  return bag;
};