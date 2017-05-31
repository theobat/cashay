'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = denormalizeStore;

var _introspection = require('graphql/type/introspection');

var _kinds = require('graphql/language/kinds');

var _utils = require('../utils');

var _denormalizeHelpers = require('./denormalizeHelpers');

var _getCachedFieldState = require('./getCachedFieldState');

var _getCachedFieldState2 = _interopRequireDefault(_getCachedFieldState);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ENUM = _introspection.TypeKind.ENUM,
    LIST = _introspection.TypeKind.LIST,
    SCALAR = _introspection.TypeKind.SCALAR;


var arrayMetadata = ['BOF', 'EOF', 'count'];
var isPrimitive = function isPrimitive(kind) {
  return kind === SCALAR || kind === ENUM;
};
var visitObject = function visitObject() {
  var subState = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
  var reqAST = arguments[1];
  var parentTypeSchema = arguments[2];
  var context = arguments[3];
  var reduction = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : {};

  if (typeof subState === 'string') {
    var _splitNormalString = (0, _denormalizeHelpers.splitNormalString)(subState),
        _splitNormalString2 = _slicedToArray(_splitNormalString, 2),
        typeName = _splitNormalString2[0],
        docId = _splitNormalString2[1];

    var _context$getState = context.getState(),
        entities = _context$getState.entities;
    // code defensively because an @cached query may want something that the subscription hasn't returned yet


    subState = entities[typeName] && entities[typeName][docId] || _defineProperty({}, context.idFieldName, '');
    parentTypeSchema = context.schema.types[typeName];
  }
  // default to subState for denorming the persisted store subscriptions
  var fields = reqAST ? reqAST.selectionSet.selections : Object.keys(subState);
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (!reqAST) {
      // we're mocking data from a sub
      // TODO recursively denormalize & exit early if not found
      reduction[field] = subState[field];
      continue;
    }
    if (field.kind === _kinds.INLINE_FRAGMENT) {
      // TODO handle null typeCondition?
      if (field.typeCondition.name.value === parentTypeSchema.name) {
        // only follow through if it's the correct union subtype
        visitObject(subState, field, parentTypeSchema, context, reduction);
      }
      continue;
    }
    var fieldName = field.name.value;
    var aliasOrFieldName = field.alias && field.alias.value || fieldName;
    if (field.name.value === _utils.TYPENAME) {
      reduction[aliasOrFieldName] = parentTypeSchema.name;
    } else {
      var cachedDirective = field.directives && field.directives.find(function (d) {
        return d.name.value === _utils.CACHED;
      });

      if (cachedDirective) {
        var cachedDirectiveArgs = (0, _utils.makeCachedArgs)(cachedDirective.arguments, context.variables, context.schema);

        var _parseCachedType = (0, _utils.parseCachedType)(cachedDirectiveArgs.type),
            type = _parseCachedType.type;

        var typeSchema = context.schema.types[type];
        var fieldState = (0, _getCachedFieldState2.default)(subState, cachedDirectiveArgs, field, context);
        if (Array.isArray(fieldState)) {
          reduction[aliasOrFieldName] = visitIterable(fieldState, field, typeSchema, context, aliasOrFieldName);
        } else {
          reduction[aliasOrFieldName] = visitObject(fieldState, field, typeSchema, context);
        }
        continue;
      }
      var fieldSchema = (0, _utils.getFieldSchema)(field, parentTypeSchema, context.schema);
      var nnFieldType = (0, _utils.ensureTypeFromNonNull)(fieldSchema.type);

      var hasData = subState.hasOwnProperty(fieldName);
      if (hasData || (0, _utils.isLive)(field.directives)) {
        var _fieldState = (0, _denormalizeHelpers.maybeLiveQuery)(subState, fieldSchema, field, nnFieldType, context);
        var rootFieldType = (0, _utils.ensureRootType)(nnFieldType);
        var _typeSchema = context.schema.types[rootFieldType.name];
        if (isPrimitive(nnFieldType.kind) || subState[fieldName] === null) {
          reduction[aliasOrFieldName] = visitScalar(_fieldState, context.coerceTypes[_typeSchema.name]);
        } else {
          if (nnFieldType.kind === LIST) {
            if (_fieldState) {
              reduction[aliasOrFieldName] = visitIterable(_fieldState, field, _typeSchema, context, aliasOrFieldName);
            } else {
              reduction[aliasOrFieldName] = [visitObject(_fieldState, field, _typeSchema, context)];
            }
          } else {
            reduction[aliasOrFieldName] = visitObject(_fieldState, field, _typeSchema, context);
          }
        }
      } else {
        reduction[aliasOrFieldName] = (0, _denormalizeHelpers.handleMissingData)(visitObject, field, nnFieldType, cachedDirective, context);
      }
    }
  }
  if (reqAST && fields) {
    (0, _denormalizeHelpers.calculateSendToServer)(reqAST, context.idFieldName);
  }
  return reduction;
};

var visitIterable = function visitIterable(subState, reqAST, typeSchema, context, aliasOrFieldName) {
  // for each value in the array, get the denormalized item
  var mappedState = [];
  // the array could be a bunch of objects, or primitives
  var loopFunc = isPrimitive(typeSchema.kind) ? function (res) {
    return visitScalar(res, context.coerceTypes[typeSchema.name]);
  } : function (res) {
    return visitObject(res, reqAST, typeSchema, context);
  };

  for (var i = 0; i < subState.length; i++) {
    mappedState[i] = loopFunc(subState[i]);
  }

  // copy over metadata for smart pagination
  for (var _i = 0; _i < arrayMetadata.length; _i++) {
    var metadataName = arrayMetadata[_i];
    if (subState[metadataName]) {
      mappedState[metadataName] = subState[metadataName];
    }
  }

  var sort = context.sort,
      filter = context.filter;

  var sortFn = sort && sort[aliasOrFieldName];
  var filterFn = filter && filter[aliasOrFieldName];
  if (filterFn) {
    mappedState = mappedState.filter(filterFn);
  }
  if (sortFn) {
    mappedState = mappedState.sort(sortFn);
  }
  return mappedState;
};

var visitScalar = function visitScalar(subState, coercion) {
  return coercion ? coercion(subState) : subState;
};

function denormalizeStore(context) {
  var getState = context.getState,
      querySchema = context.schema.querySchema,
      operation = context.operation,
      normalizedResult = context.normalizedResult;

  if (normalizedResult) {
    // this is for rehydrating subscriptions
    var visitor = Array.isArray(normalizedResult) ? visitIterable : visitObject;
    return visitor(normalizedResult, null, {}, context);
  }
  return visitObject(getState().result, operation, querySchema, context);
};