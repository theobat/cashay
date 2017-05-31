'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = parseAndInitializeQuery;

var _kinds = require('graphql/language/kinds');

var _utils = require('../utils');

var _introspection = require('graphql/type/introspection');

var _helperClasses = require('../helperClasses');

var ENUM = _introspection.TypeKind.ENUM,
    UNION = _introspection.TypeKind.UNION,
    SCALAR = _introspection.TypeKind.SCALAR,
    OBJECT = _introspection.TypeKind.OBJECT;


var validateCachedDirective = function validateCachedDirective(cachedDirective) {
  var argsArr = cachedDirective.arguments;
  var cachedArgs = {};
  for (var i = 0; i < argsArr.length; i++) {
    var arg = argsArr[i];
    var argName = arg.name.value;
    if (!_utils.CACHED_ARGS.includes(argName)) {
      throw new Error('@cached only accepts ' + JSON.stringify(_utils.CACHED_ARGS) + ' not ' + argName + '.');
    }
    cachedArgs[argName] = arg;
  }
  if (cachedArgs.id && cachedArgs.ids) {
    throw new Error('@entity can receive either an \'id\' or \'ids\' arg, not both');
  }
  if (!cachedArgs.type) {
    throw new Error('@entity requires a type arg.');
  }
};

function parseAndInitializeQuery(queryString, schema, idFieldName) {
  var ast = (0, _utils.parse)(queryString);

  var _teardownDocumentAST = (0, _utils.teardownDocumentAST)(ast.definitions),
      operation = _teardownDocumentAST.operation,
      fragments = _teardownDocumentAST.fragments;

  var catalogFields = [idFieldName, _utils.TYPENAME];
  var initializeQueryAST = function initializeQueryAST(fields, parentSchema) {
    for (var i = 0; i < fields.length; i++) {
      // convert fragment spreads into inline so we can minimize queries later
      var field = fields[i];
      if (field.kind === _kinds.FRAGMENT_SPREAD) {
        var fragment = (0, _utils.clone)(fragments[field.name.value]);
        field = fields[i] = (0, _utils.convertFragmentToInline)(fragment);
      }
      // if it's an inline fragment, set schema to the typecondition, or parentSchema if null
      if (field.kind === _kinds.INLINE_FRAGMENT) {
        var subSchema = field.typeCondition ? schema.types[field.typeCondition.name.value] : parentSchema;
        var children = field.selectionSet.selections;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          var _loop = function _loop() {
            var fieldToRemove = _step.value;

            var idx = children.findIndex(function (child) {
              return child.name && child.name.value === fieldToRemove;
            });
            if (idx !== -1) {
              children.splice(idx, 1);
            }
          };

          for (var _iterator = catalogFields[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
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

        initializeQueryAST(children, subSchema);
        continue;
      }
      // sort args once here to make sure the key is the same in the store w/o sorting later
      if (field.arguments && field.arguments.length) {
        field.arguments.sort(function (a, b) {
          return a.name.value > b.name.value;
        });
      }
      var cachedDirective = field.directives && field.directives.find(function (d) {
        return d.name.value === _utils.CACHED;
      });
      if (field.selectionSet) {
        var _children = field.selectionSet.selections;
        // if no resolve function is present, then it might just be a sort or filter
        if (cachedDirective) {
          validateCachedDirective(cachedDirective);
        } else {
          var fieldSchema = (0, _utils.getFieldSchema)(field, parentSchema, schema);
          var rootFieldSchema = (0, _utils.ensureRootType)(fieldSchema.type);
          var typeSchema = schema.types[rootFieldSchema.name];
          var fieldsToAdd = typeSchema.kind === UNION ? catalogFields : typeSchema.fields[idFieldName] ? [idFieldName] : [];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            var _loop2 = function _loop2() {
              var fieldToAdd = _step2.value;

              var child = _children.find(function (child) {
                return child.name && child.name.value === fieldToAdd;
              });
              if (!child) {
                _children.push(new _helperClasses.Field({ name: fieldToAdd }));
              }
            };

            for (var _iterator2 = fieldsToAdd[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              _loop2();
            }
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2.return) {
                _iterator2.return();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          initializeQueryAST(_children, typeSchema);
        }
      } else if (cachedDirective) {
        throw new Error('@entity can only be applied to an object or array');
      } else if (field.name.value !== _utils.TYPENAME && parentSchema.kind === OBJECT) {
        // naively rule out unions, we can deal with those later
        var _fieldSchema = (0, _utils.getFieldSchema)(field, parentSchema, schema);
        var _rootFieldSchema = (0, _utils.ensureRootType)(_fieldSchema.type);
        if (_rootFieldSchema.kind !== ENUM && _rootFieldSchema.kind !== SCALAR) {
          throw new Error('Field ' + _rootFieldSchema.name + ' is an object but doesn\'t have a sub selection.');
        }
      }
    }
  };
  initializeQueryAST(operation.selectionSet.selections, schema.querySchema);
  ast.definitions = [operation];
  return ast;
};