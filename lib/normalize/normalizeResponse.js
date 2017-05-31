'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _mergeStores = require('./mergeStores');

var _mergeStores2 = _interopRequireDefault(_mergeStores);

var _separateArgs2 = require('./separateArgs');

var _separateArgs3 = _interopRequireDefault(_separateArgs2);

var _getSubReqAST = require('./getSubReqAST');

var _utils = require('../utils');

var _kinds = require('graphql/language/kinds');

var _introspection = require('graphql/type/introspection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var UNION = _introspection.TypeKind.UNION;


var mapResponseToResult = function mapResponseToResult(nestedResult, response, fieldSchema, reqASTArgs, context) {
  if (!fieldSchema.args) return response;
  var paginationWords = context.paginationWords,
      variables = context.variables;

  var _separateArgs = (0, _separateArgs3.default)(fieldSchema, reqASTArgs, paginationWords, variables),
      regularArgs = _separateArgs.regularArgs,
      paginationArgs = _separateArgs.paginationArgs;

  if (paginationArgs) {
    var first = paginationArgs.first,
        last = paginationArgs.last;

    var arrName = first !== undefined ? _utils.FRONT : last !== undefined ? _utils.BACK : _utils.FULL;
    response = _defineProperty({}, arrName, response);
  }
  if (regularArgs === false) {
    return response;
  } else {
    var regularArgsString = (0, _utils.getRegularArgsKey)(regularArgs);
    var resultObj = _defineProperty({}, regularArgsString, response);
    return (0, _utils.isObject)(nestedResult) && !Array.isArray(nestedResult) ? (0, _mergeStores2.default)(nestedResult, resultObj) : resultObj;
  }
};

var visitObject = function visitObject(bag, subResponse, reqAST, subSchema, context) {
  var keys = Object.keys(subResponse);
  var reduction = {};
  var typenameField = reqAST && reqAST.selectionSet.selections.find(function (field) {
    return field.name.value === _utils.TYPENAME;
  });
  var typenameAlias = typenameField && typenameField.alias && typenameField.alias.value || _utils.TYPENAME;
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    if (key === typenameAlias) continue;
    if (reqAST) {
      var subReqAST = (0, _getSubReqAST.getSubReqAST)(key, reqAST, subResponse[typenameAlias]);
      var name = subReqAST.name.value;
      var cachedDirective = subReqAST.directives.find(function (d) {
        return d.name.value === _utils.CACHED;
      });
      if (cachedDirective) {
        var typeArg = cachedDirective.arguments.find(function (arg) {
          return arg.name.value === 'type';
        });
        var typeName = (0, _utils.getVariableValue)(typeArg, context.variables);

        var _parseCachedType = (0, _utils.parseCachedType)(typeName),
            type = _parseCachedType.type;

        var typeSchema = context.schema.types[type];
        visit(bag, subResponse[key], subReqAST, typeSchema, context);
      } else {
        var fieldSchema = (0, _utils.getFieldSchema)(subReqAST, subSchema, context.schema);
        var fieldType = (0, _utils.ensureRootType)(fieldSchema.type);
        // handle first recursion where things are stored in the query (sloppy)
        var _typeSchema = context.schema.types[fieldType.name] || subSchema.types[fieldType.name];
        var normalizedResponse = visit(bag, subResponse[key], subReqAST, _typeSchema, context);
        reduction[name] = mapResponseToResult(reduction[name], normalizedResponse, fieldSchema, subReqAST.arguments, context);
      }
    } else {
      // this is for subscriptions, since we don't explicitly have a request AST
      var _fieldSchema = subSchema.fields[key];
      var _fieldType = (0, _utils.ensureRootType)(_fieldSchema.type);
      var _typeSchema2 = context.schema.types[_fieldType.name];
      reduction[key] = visit(bag, subResponse[key], undefined, _typeSchema2, context);
    }
  }
  return reduction;
};
var visitEntity = function visitEntity(bag, subResponse, reqAST, subSchema, context, id) {
  var entityKey = subSchema.name;
  bag[entityKey] = bag[entityKey] || {};
  bag[entityKey][id] = bag[entityKey][id] || {};
  var normalized = visitObject(bag, subResponse, reqAST, subSchema, context);
  bag[entityKey][id] = (0, _mergeStores2.default)(bag[entityKey][id], normalized);
  return '' + entityKey + _utils.NORM_DELIMITER + id;
};

var visitIterable = function visitIterable(bag, subResponse, reqAST, subSchema, context) {
  var normalizedSubResponse = subResponse.map(function (res) {
    return visit(bag, res, reqAST, subSchema, context);
  });
  if (reqAST && reqAST.arguments && reqAST.arguments.length) {
    var _context$paginationWo = context.paginationWords,
        first = _context$paginationWo.first,
        last = _context$paginationWo.last;

    var paginationFlags = [{ word: first, flag: 'EOF' }, { word: last, flag: 'BOF' }];

    var _loop = function _loop(i) {
      var _paginationFlags$i = paginationFlags[i],
          word = _paginationFlags$i.word,
          flag = _paginationFlags$i.flag;

      var count = reqAST.arguments.find(function (arg) {
        return arg.name.value === word;
      });
      // allow count === 0
      if (count !== undefined) {
        var countVal = void 0;
        if (count.value.kind === _kinds.VARIABLE) {
          var variableDefName = count.value.name.value;
          countVal = +context.variables[variableDefName];

          // pass the count onto the normalized response to perform a slice during the state merge
          normalizedSubResponse.count = subResponse.count;

          // MUTATES CONTEXT VARIABLES. update the difference in the variables (passed on to redux state)
          context.variables[variableDefName] = subResponse.length;

          // MUTATES ORIGINAL DENORMALIZED RESPONSE. kinda ugly, but saves an additional tree walk.
          subResponse.count = subResponse.length;
        } else {
          countVal = +count.value.value;
        }
        if (normalizedSubResponse.length < countVal) {
          normalizedSubResponse[flag] = true;
        }
        return 'break';
      }
    };

    for (var i = 0; i < paginationFlags.length; i++) {
      var _ret = _loop(i);

      if (_ret === 'break') break;
    }
  }
  return normalizedSubResponse;
};

var visitUnion = function visitUnion(bag, subResponse, reqAST, subSchema, context) {
  var typenameField = reqAST.selectionSet.selections.find(function (field) {
    return field.name.value === _utils.TYPENAME;
  });
  var typenameAlias = typenameField.alias && typenameField.alias.value || _utils.TYPENAME;
  var concreteSubScema = context.schema.types[subResponse[typenameAlias]];
  return visit(bag, subResponse, reqAST, concreteSubScema, context);
};

var visit = function visit(bag, subResponse, reqAST, subSchema, context) {
  if (!(0, _utils.isObject)(subResponse) || subResponse instanceof Date) {
    return subResponse;
  }
  if (Array.isArray(subResponse)) {
    return visitIterable(bag, subResponse, reqAST, subSchema, context);
  }
  if (subSchema.kind === UNION) {
    return visitUnion(bag, subResponse, reqAST, subSchema, context);
  }
  var idFieldName = context.idFieldName;

  if (subSchema.fields[idFieldName]) {
    var id = subResponse[idFieldName];
    return visitEntity(bag, subResponse, reqAST, subSchema, context, id);
  }
  return visitObject(bag, subResponse, reqAST, subSchema, context);
};

exports.default = function (response, context, isSubscription) {
  var entities = {};
  var result = void 0;
  if (isSubscription) {
    result = visitEntity(entities, response, null, context.typeSchema, context, response[context.idFieldName]);
  } else {
    result = visitObject(entities, response, context.operation, context.schema.querySchema, context);
  }
  return {
    entities: entities,
    result: result
  };
};