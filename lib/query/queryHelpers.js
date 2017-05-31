'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.equalPendingQueries = exports.getMissingRequiredVariables = exports.invalidateMutationsOnNewQuery = exports.shortenNormalizedResponse = undefined;

var _kinds = require('graphql/language/kinds');

var _utils = require('../utils');

/*
 * reduce the fields to merge into the state
 * doing this here means a smaller flushSet and fewer invalidations
 * currently we mutate normalizedResponse. it may be worthwhile to make this pure
 * */
var shortenNormalizedResponse = exports.shortenNormalizedResponse = function shortenNormalizedResponse(normalizedResponse, cashayState) {
  // TODO rewrite by recurisvely finding the outer join
  // const {entities} = normalizedResponse;
  // const diff = {};
  // if (!entities) return;
  // const typeKeys = Object.keys(entities);
  // for (let i = 0; i < typeKeys.length; i++) {
  //   const typeName = typeKeys[i];
  //   const typeInResponse = entities[typeName];
  //   const typeInState = cashayState.entities[typeName];
  //   // const typeInDiff = diff[typeName];
  //   if (!typeInState) {
  //     diff[typeName] = typeInResponse;
  //     continue;
  //   }
  //   diff[typeName] = diff[typeName] || {};
  //   const typeInDiff = diff[typeName];
  //   const typeKeys = Object.keys(typeInResponse);
  //   for (let j = 0; j < typeKeys.length; j++) {
  //     const entityName = typeKeys[j];
  //     const entityInState = typeInState[entityName];
  //     const entityInRespose = typeInResponse[entityName];
  //     if (!entityInState) {
  //       typeInDiff[entityName] = entityInRespose;
  //       continue;
  //     }
  //     diff[entityName] = diff[entityName]
  //     const newEntity = typeInResponse[entityName];
  //     // entityInState could be a superset of newEntity and we'd still want to remove newEntity
  //     // so, we can't use a single stringify comparison, we have to walk each item in newEntity
  //     // and remove items that are deepEqual (since an entity can have a nested array or object)
  //     const reducedNewEntity = deepEqualAndReduce(entityInState, newEntity);
  //   }
  // }
  return Object.keys(normalizedResponse).length && normalizedResponse;
};

/*
 * Returns a copy of the newEntity that does not include any props where the value of both are equal
 */
var deepEqualAndReduce = function deepEqualAndReduce(state, newEntity) {
  var reducedNewItem = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

  var propsToCheck = Object.keys(newEntity);
  for (var i = 0; i < propsToCheck.length; i++) {
    var propName = propsToCheck[i];
    var newEntityProp = newEntity[propName];

    // it the prop doesn't exist in state, put it there
    if (!state.hasOwnProperty(propName)) {
      reducedNewItem[propName] = newEntityProp;
      continue;
    }

    // strict-equal must come after hasOwnProperty because the two could be null
    var stateProp = state[propName];
    if (stateProp === newEntityProp) {
      continue;
    }

    // if they're not equal, it could be an array, object, or scalar
    if (Array.isArray(newEntityProp)) {
      if (Array.isArray(stateProp) && newEntityProp.length === stateProp.length) {
        //  an array of objects here is wrong. Better to be performant for those who play by the rules
        var isShallowEqual = true;
        for (var _i = 0; _i < newEntityProp.length; _i++) {
          if (newEntityProp[_i] !== stateProp[_i]) {
            isShallowEqual = false;
            break;
          }
        }
        if (!isShallowEqual) {
          // TODO either recurse or jsonEquals this
          reducedNewItem[propName] = newEntityProp;
        }
      } else {
        reducedNewItem[propName] = newEntityProp;
      }
    } else if ((0, _utils.isObject)(newEntityProp)) {
      if ((0, _utils.isObject)(stateProp)) {
        // they're both objects, we must go deeper
        reducedNewItem[propName] = deepEqualAndReduce(stateProp, newEntityProp);
      } else {
        reducedNewItem[propName] = newEntityProp;
      }
    } else {
      // they're non-equal scalars
      reducedNewItem[propName] = newEntityProp;
    }
  }
  return reducedNewItem;
};

/**
 * Mutation ASTs are generated, aggregated, printed, and cached for performance.
 * When a new query comes along, the mutation might need to request additional fields for it
 * If this happens, we need to invalidate the cached mutation
 *
 * @param {String} op the query operation that is affecting the mutation
 * @param {Object} cachedMutations the mutations that are cached in the singleton
 *
 */
var invalidateMutationsOnNewQuery = exports.invalidateMutationsOnNewQuery = function invalidateMutationsOnNewQuery(op, cachedMutations) {
  var activeMutations = Object.keys(cachedMutations);
  for (var i = 0; i < activeMutations.length; i++) {
    var mutationName = activeMutations[i];
    var mutation = cachedMutations[mutationName];
    // TODO handle logic for keys?
    if (mutation.activeQueries[op]) {
      mutation.clear();
    }
  }
};

var getMissingRequiredVariables = exports.getMissingRequiredVariables = function getMissingRequiredVariables(variableDefinitions, variables) {
  var missingVars = [];
  for (var i = 0; i < variableDefinitions.length; i++) {
    var def = variableDefinitions[i];
    if (def.type.kind === _kinds.NON_NULL_TYPE) {
      var defKey = def.variable.name.value;
      var variableVal = variables[defKey];
      if (variableVal === undefined || variableVal === null) {
        missingVars.push(defKey);
      }
    }
  }
  return missingVars;
};

var equalPendingQueries = exports.equalPendingQueries = function equalPendingQueries(baseQuery, _ref) {
  var op = _ref.op,
      key = _ref.key,
      variables = _ref.variables;
  var baseComponent = baseQuery.op,
      baseKey = baseQuery.key,
      baseVariables = baseQuery.variables;

  if (baseComponent !== op) return false;
  if (key !== baseKey) return false;
  var baseVariablesKeys = Object.keys(baseVariables);
  var variablesKeys = Object.keys(variables);
  if (baseVariablesKeys.length !== variablesKeys.length) return false;
  // this is just a heuristic that doesn't check variable values.
  // that's OK because unique queries with unique variables shouldn't share the same op name
  // Also, calling a query twice with different vars before you get the results of the first is an unsupported anti-pattern
  return true;
};