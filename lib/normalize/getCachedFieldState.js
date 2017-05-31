'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getCachedFieldState;

var _utils = require('../utils');

var _introspection = require('graphql/type/introspection');

var UNION = _introspection.TypeKind.UNION;


var stringifyEntity = function stringifyEntity(type, id) {
  return '' + type + _utils.NORM_DELIMITER + id;
};

var makeDefaultResolver = function makeDefaultResolver(id, idFieldName) {
  if (Array.isArray(id)) {
    return function (doc) {
      return id.includes(doc[idFieldName]);
    };
  } else {
    return function (doc) {
      return doc[idFieldName] === id;
    };
  }
};

var initCachedDeps = function initCachedDeps(cachedDeps, types, queryDep, resolver) {
  // uses types in the event of a union
  for (var i = 0; i < types.length; i++) {
    var type = types[i];
    cachedDeps[type] = cachedDeps[type] || {};
    cachedDeps[type][queryDep] = cachedDeps[type][queryDep] || new Set();
    cachedDeps[type][queryDep].add(resolver);
  }
};

var resolveFromState = function resolveFromState(resolver, possibleTypes, isArray, entities) {
  var result = isArray ? [] : {};
  for (var t = 0; t < possibleTypes.length; t++) {
    var type = possibleTypes[t];
    var typeEntities = entities[type];
    if (!typeEntities) continue;
    var docIds = Object.keys(typeEntities);
    for (var i = 0; i < docIds.length; i++) {
      var docId = docIds[i];
      var doc = typeEntities[docId];
      if (resolver(doc)) {
        var stringifiedDoc = stringifyEntity(type, docId);
        if (isArray) {
          result.push(stringifiedDoc);
        } else {
          return stringifiedDoc;
        }
      }
    }
  }
  // if not everything loaded & we just wanted 1, we want to return an object
  return result;
};

function getCachedFieldState(source, cachedDirectiveArgs, field, context) {
  var cachedDeps = context.cachedDeps,
      resolveCached = context.resolveCached,
      getState = context.getState,
      idFieldName = context.idFieldName,
      queryDep = context.queryDep;

  var _parseCachedType = (0, _utils.parseCachedType)(cachedDirectiveArgs.type),
      type = _parseCachedType.type,
      typeIsList = _parseCachedType.typeIsList;

  var typeSchema = context.schema.types[type];
  var isUnion = typeSchema.kind === UNION;
  var possibleTypes = isUnion ? Object.keys(typeSchema.possibleTypes) : [type];

  var _getState = getState(),
      entities = _getState.entities;

  var aliasOrFieldName = field.alias && field.alias.value || field.name.value;
  var cacheResolverFactory = resolveCached && resolveCached[aliasOrFieldName];
  var resolver = cacheResolverFactory && cacheResolverFactory(source, cachedDirectiveArgs);

  if (isUnion && typeof resolver !== 'function') {
    throw new Error('@cached requires resolveCached to return a function for union types.');
  }

  // standard resolver function that completes in O(n) time for n docs in the state[type]
  if (typeof resolver === 'function') {
    initCachedDeps(cachedDeps, possibleTypes, queryDep, resolver);
    return resolveFromState(resolver, possibleTypes, typeIsList, entities);
  }

  // no factory means we need to make a default one based off of id/ids.
  // use resolveCached because they could just return something falsy
  if (!cacheResolverFactory) {
    var id = cachedDirectiveArgs.id,
        ids = cachedDirectiveArgs.ids;

    if (!id && !ids) {
      throw new Error('Must supply either id, ids or resolveCached for ' + aliasOrFieldName);
    }
    var idLookup = ids || id;
    var isArray = idLookup === ids;
    if (isArray !== typeIsList) {
      var reqArg = typeIsList ? 'ids' : 'id';
      throw new Error('Type ' + cachedDirectiveArgs.type + ' requires a \'resolveCached\' or the \'' + reqArg + ' arg');
    }
    var _depResolver = makeDefaultResolver(idLookup, idFieldName);
    initCachedDeps(cachedDeps, possibleTypes, queryDep, _depResolver);
    return isArray ? ids.map(function (id) {
      return stringifyEntity(type, id);
    }) : stringifyEntity(type, id);
  }

  var depResolver = makeDefaultResolver(resolver, idFieldName);
  // a resolver that looks for a single document
  if (typeof resolver === 'string') {
    if (typeIsList) {
      throw new Error('Type ' + cachedDirectiveArgs.type + ' requires your resolveCached to return a single id');
    }
    initCachedDeps(cachedDeps, possibleTypes, queryDep, depResolver);
    return stringifyEntity(type, resolver);
  }

  // a resolver that looks for a series of documents
  if (Array.isArray(resolver)) {
    if (!typeIsList) {
      throw new Error('Type ' + cachedDirectiveArgs.type + ' requires your resolveCached to return an array');
    }
    initCachedDeps(cachedDeps, possibleTypes, queryDep, depResolver);
    return resolver.map(function (id) {
      return stringifyEntity(type, id);
    });
  }
  return {};
};