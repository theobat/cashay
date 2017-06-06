'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _duck = require('./normalize/duck');

var _denormalizeStore = require('./normalize/denormalizeStore');

var _denormalizeStore2 = _interopRequireDefault(_denormalizeStore);

var _denormalizeHelpers = require('./normalize/denormalizeHelpers');

var _normalizeResponse = require('./normalize/normalizeResponse');

var _normalizeResponse2 = _interopRequireDefault(_normalizeResponse);

var _printMinimalQuery = require('./query/printMinimalQuery');

var _queryHelpers = require('./query/queryHelpers');

var _utils = require('./utils');

var _mergeStores = require('./normalize/mergeStores');

var _mergeStores2 = _interopRequireDefault(_mergeStores);

var _helperClasses = require('./helperClasses');

var _flushDependencies = require('./query/flushDependencies');

var _flushDependencies2 = _interopRequireDefault(_flushDependencies);

var _namespaceMutation3 = require('./mutate/namespaceMutation');

var _namespaceMutation4 = _interopRequireDefault(_namespaceMutation3);

var _createMutationFromQuery = require('./mutate/createMutationFromQuery');

var _createMutationFromQuery2 = _interopRequireDefault(_createMutationFromQuery);

var _removeNamespacing = require('./mutate/removeNamespacing');

var _removeNamespacing2 = _interopRequireDefault(_removeNamespacing);

var _makeFriendlyStore = require('./mutate/makeFriendlyStore');

var _makeFriendlyStore2 = _interopRequireDefault(_makeFriendlyStore);

var _addDeps = require('./normalize/addDeps');

var _addDeps2 = _interopRequireDefault(_addDeps);

var _mergeMutations = require('./mutate/mergeMutations');

var _mergeMutations2 = _interopRequireDefault(_mergeMutations);

var _ActiveQueries = require('./mutate/ActiveQueries');

var _ActiveQueries2 = _interopRequireDefault(_ActiveQueries);

var _createBasicMutation = require('./mutate/createBasicMutation');

var _createBasicMutation2 = _interopRequireDefault(_createBasicMutation);

var _hasMatchingVariables = require('./mutate/hasMatchingVariables');

var _hasMatchingVariables2 = _interopRequireDefault(_hasMatchingVariables);

var _processSubscriptionDoc = require('./subscribe/processSubscriptionDoc');

var _processSubscriptionDoc2 = _interopRequireDefault(_processSubscriptionDoc);

var _isMutationResponseScalar = require('./mutate/isMutationResponseScalar');

var _isMutationResponseScalar2 = _interopRequireDefault(_isMutationResponseScalar);

var _introspection = require('graphql/type/introspection');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var LIST = _introspection.TypeKind.LIST,
    SCALAR = _introspection.TypeKind.SCALAR,
    UNION = _introspection.TypeKind.UNION;

var defaultGetToState = function defaultGetToState(store) {
  return store.getState().cashay;
};
var defaultPaginationWords = {
  before: 'before',
  after: 'after',
  first: 'first',
  last: 'last'
};

var defaultCoerceTypes = {
  DateTime: function DateTime(val) {
    return new Date(val);
  }
};

var Cashay = function () {
  function Cashay() {
    var _this = this;

    _classCallCheck(this, Cashay);

    this._getTypeFactory = function (op, key) {
      return function (typeName) {
        var cashayState = _this.getState();
        var rawState = cashayState.entities[typeName];
        if (!rawState) {
          throw new Error(typeName + ' does not exist in your cashay data state entities!');
        }

        // TODO using stateVars is wrong because vars could be static in the query, instead we need to check the schema + varDefs + vars
        var stateVars = (0, _utils.getStateVars)(cashayState, op, key);
        if (!stateVars) {
          return rawState;
        }
        var context = {
          paginationWords: _this.paginationWords,
          variables: stateVars,
          skipTransform: true,
          schema: _this.schema
        };
        return (0, _makeFriendlyStore2.default)(rawState, typeName, context);
      };
    };

    // many mutations can share the same mutationName, making it hard to cache stuff without adding complexity
    // we can assume that a mutationName + the components it affects = a unique, reproduceable fullMutation
    // const example = {
    //   [mutationName]: {
    //     activeQueries: {
    //       [op]: key
    //     },
    //     fullMutation: MutationString,
    //     variableEnhancers: [variableEnhancerFn],
    //     singles: {
    //       [op]: {
    //          ast: MutationAST,
    //          variableEnhancers: [variableEnhancerFn]
    //       }
    //     }
    //   }
    // }
    this.cachedMutations = {};

    // the object to hold the denormalized query responses
    this.cachedQueries = {
      // [op]: {
      //   ast,
      //   refetch: FunctionToRefetchQuery,
      //   responses: {
      //     [key = '']: DenormalizedResponse
      //   }
      // }
    };

    // the object to hold the subscription stream
    // const example = {
    //   [subscriptionString]: {
    //     [key = '']: DataAndUnsub
    //   }
    // };
    this.cachedSubscriptions = {};

    // a flag thrown by the invalidate function and reset when that query is added to the queue
    this._willInvalidateListener = false;

    // const example = {
    //   [mutationName]: {
    //     [op]: mutationHandlerFn
    //   }
    // }
    this.mutationHandlers = {};

    // denormalized deps is an object that matches the cashayState.entities
    // instead of an object of values, it holds an object of of Sets of keys for every query affected by a change
    // the value of each UID is a set of components
    // const example = {
    //   Pets: {
    //     1: {
    //       [op]: Set(['key1', 'key2'])
    //     }
    //   }
    // }
    this.denormalizedDeps = {};

    // the deps used by mutations to determine what branches of the state tree to invalidate from a mutation
    // const example = {
    //   [op]: {
    //     [key]: Set(...['Pets.1', 'Pets.2'])
    //   }
    // }
    this.normalizedDeps = {};

    // each subscription holds an object with all the query ops that require it
    this.subscriptionDeps = {
      // [`channel::channelKey`]: Set([op::key, op::key])
    };

    // these are the deps required for @cached directives. The user-defined resolveCachedX
    // is run against the new doc & if the doc was or is true, the query is invalidated.
    this.cachedDeps = {
      // [entity]: {
      //   [op::key]: Set(resolveCached)
      // }
    };
    // a Set of minimized query strings. Identical strings are ignored
    // this could be improved to minimize traffic, but it favors fast and cheap for now
    this.pendingQueries = new Set();

    this.unsubscribeHandlers = {
      // [channel]: {
      //   [key]: UnsubscribeFn
      // }
    };
  }

  _createClass(Cashay, [{
    key: 'clear',
    value: function clear() {
      this.cachedMutations = {};
      this.cachedQueries = {};
      this.cachedSubscriptions = {};
      this._willInvalidateListener = false;
      this.mutationHandlers = {};
      this.denormalizedDeps = {};
      this.normalizedDeps = {};
      this.subscriptionDeps = {};
      this.cachedDeps = {};
      this.pendingQueries = new Set();
      this.unsubscribeHandlers = {};
      if (this.store) {
        this.store.dispatch({ type: _duck.CLEAR });
      }
    }

    /**
     * The primary method to begin using the singleton
     *
     * @param {Object} coerceTypes an object full of methods names matching GraphQL types. It takes in a single scalar value
     * and returns the output. This is useful for things like converting dates from strings to numbers or Date types.
     * @param {Function} getToState a function to get to the cashayState.
     * Useful if your store is not a POJO or if your reducer isn't called `cashay`
     * @param {HTTPTransport} httpTransport an instance of an HTTPTransport used to connect cashay to your server
     * @param {string} idFieldName name of the unique identifier for your documents, defaults to `id`, is `_id` for MongoDB
     * @param {Object} paginationWords reserved arguments for cusor-based pagination
     * @param {Transport} priorityTransport an instance of a Transport used to connect cashay to your server.
     * Takes prioirty over httpTransport. Useful for server-side rendering and sockets.
     * @param {Object} schema the client graphQL schema
     * @param {Object} store the redux store
     * @param {Function} subscriber the default subscriber for live data
     * */

  }, {
    key: 'create',
    value: function create(_ref) {
      var _this2 = this;

      var coerceTypes = _ref.coerceTypes,
          getToState = _ref.getToState,
          httpTransport = _ref.httpTransport,
          idFieldName = _ref.idFieldName,
          paginationWords = _ref.paginationWords,
          priorityTransport = _ref.priorityTransport,
          schema = _ref.schema,
          store = _ref.store,
          subscriber = _ref.subscriber;

      this.coerceTypes = coerceTypes === undefined ? this.coerceTypes || defaultCoerceTypes : coerceTypes;
      this.store = store || this.store;
      this.getState = getToState ? function () {
        return getToState(_this2.store);
      } : this.getState || function () {
        return defaultGetToState(_this2.store);
      };
      this.paginationWords = paginationWords === undefined ? this.paginationWords || defaultPaginationWords : _extends({}, defaultPaginationWords, paginationWords);
      this.idFieldName = idFieldName === undefined ? this.idFieldName || 'id' : idFieldName;
      this.httpTransport = httpTransport === undefined ? this.httpTransport : httpTransport;
      this.priorityTransport = priorityTransport === undefined ? this.priorityTransport : priorityTransport;
      this.schema = schema || this.schema;
      this.subscriber = subscriber || this.subscriber;
      this._invalidate = this._invalidate.bind(this);
    }

    /**
     * a method given to a mutation callback that turns on a global.
     * if true, then we know to queue up a requery
     */

  }, {
    key: '_invalidate',
    value: function _invalidate() {
      this._willInvalidateListener = true;
    }
  }, {
    key: '_invalidateQueryDep',
    value: function _invalidateQueryDep(queryDep) {
      var _splitNormalString = (0, _denormalizeHelpers.splitNormalString)(queryDep),
          _splitNormalString2 = _slicedToArray(_splitNormalString, 2),
          op = _splitNormalString2[0],
          _splitNormalString2$ = _splitNormalString2[1],
          key = _splitNormalString2$ === undefined ? '' : _splitNormalString2$;

      this.cachedQueries[op].responses[key] = undefined;
    }

    /**
     * A method to get the best transport to send the request
     * */

  }, {
    key: 'getTransport',
    value: function getTransport(specificTransport) {
      return specificTransport || this.priorityTransport || this.httpTransport;
    }

    /**
     * A method that accepts a GraphQL query and returns a result using only local data.
     * If it cannot complete the request on local data alone, it also asks the server for the data that it does not have.
     *
     * @param {string} queryString - The GraphQL query string, exactly as you'd send it to a GraphQL server
     * @param {Object} [options] - The optional objects to include with the query
     *
     * @param {string} [options.op] - A string to match the op.
     * @param {string} [options.key=''] - A string to uniquely match the op insance.
     * @param {Boolean} [options.forceFetch] - is true if the query is to ignore all local data and fetch new data
     * @param {Function} [options.transport] - The function used to send the data request to GraphQL, if different from default
     * @param {Object} [options.variables] - are the variables sent along with the query
     * @param {Object} [options.mutationHandlers] - the functions used to change the local data when a mutation occurs
     * @param {Object} [options.customMutations] - if mutations are too complex to be autogenerated (rare), write them here
     * @param {Boolean} [options.localOnly] - if you only want to query the local cache, set this to true
     *
     * @returns {Object} data, setVariables, and status
     *
     */

  }, {
    key: 'query',
    value: function query(queryString) {
      var _this3 = this;

      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

      //if you call forceFetch in a mapStateToProps, you're gonna have a bad time (it'll refresh on EVERY dispatch)
      // Each op can have only 1 unique queryString/variable combo. This keeps memory use minimal.
      // if 2 components have the same queryString/variable but a different op, it'll fetch twice
      var forceFetch = options.forceFetch,
          _options$key = options.key,
          key = _options$key === undefined ? '' : _options$key,
          _options$op = options.op,
          op = _options$op === undefined ? queryString : _options$op;

      // get the result, containing a response, queryString, and options to re-call the query

      var fastResult = this.cachedQueries[op];

      // if we got local data cached already, send it back fast
      var fastResponse = !forceFetch && fastResult && fastResult.responses[key];
      if (fastResponse) return fastResponse;

      // Make sure we got everything we need
      if (!this.store || !this.schema) {
        throw new Error('Cashay requires a store & schema');
      }

      if (options.mutationHandlers && op === queryString) {
        throw new Error('\'op\' is required when including \'mutationHandlers\' for: ' + queryString);
      }

      // save the query so we can call it from anywhere
      if (!fastResult) {
        var refetch = function refetch(key) {
          _this3.query(queryString, _extends({}, options, {
            key: key,
            forceFetch: true,
            transport: _this3.getTransport(options.transport)
          }));
        };
        this.cachedQueries[op] = new _helperClasses.CachedQuery(queryString, this.schema, this.idFieldName, refetch, key);
        (0, _queryHelpers.invalidateMutationsOnNewQuery)(op, this.cachedMutations);
      }
      var cachedQuery = this.cachedQueries[op];
      var initialCachedResponse = cachedQuery.responses[key];
      var cashayState = this.getState();
      // override singleton defaults with query-specific values
      var variables = (0, _utils.getVariables)(options.variables, cashayState, op, key, initialCachedResponse);

      // create an AST that we can mutate
      var cachedDeps = this.cachedDeps,
          subscriptionDeps = this.subscriptionDeps,
          coerceTypes = this.coerceTypes,
          paginationWords = this.paginationWords,
          idFieldName = this.idFieldName,
          schema = this.schema,
          store = this.store,
          getState = this.getState;
      var sort = options.sort,
          filter = options.filter,
          resolveChannelKey = options.resolveChannelKey,
          resolveCached = options.resolveCached,
          subscriber = options.subscriber;

      var queryDep = (0, _utils.makeFullChannel)(op, key);
      var context = (0, _utils.buildExecutionContext)(cachedQuery.ast, {
        forceFetch: forceFetch,
        getState: getState,
        coerceTypes: coerceTypes,
        variables: variables,
        paginationWords: paginationWords,
        idFieldName: idFieldName,
        schema: schema,
        subscribe: this.subscribe.bind(this),
        queryDep: queryDep,
        defaultSubscriber: this.subscriber,
        subscriptionDeps: subscriptionDeps,
        cachedDeps: cachedDeps,
        // superpowers
        sort: sort,
        filter: filter,
        resolveChannelKey: resolveChannelKey,
        resolveCached: resolveCached,
        subscriber: subscriber
      });
      // create a response with denormalized data and a function to set the variables
      cachedQuery.createResponse(context, op, key, store.dispatch, getState, forceFetch);
      var cachedResponse = cachedQuery.responses[key];

      var normalizedPartialResponse = (0, _normalizeResponse2.default)(cachedResponse.data, context);
      (0, _addDeps2.default)(normalizedPartialResponse, op, key, this.normalizedDeps, this.denormalizedDeps);
      // if we need more data, get it from the server
      if (cachedResponse.status === _utils.LOADING) {
        // if a variable is a function, it may need info that comes from the updated cachedResponse
        context.variables = (0, _utils.getVariables)(options.variables, cashayState, op, key, cachedResponse);

        //  async query the server (no need to track the promise it returns, as it will change the redux state)
        var transport = this.getTransport(options.transport);
        if (!transport) {
          throw new Error('Cashay requires a transport to query the server. If you want to query locally, use `localOnly: true`');
        }
        if (!options.localOnly) {
          this.queryServer(transport, context, op, key);
        }
      }

      var stateVars = (0, _utils.getStateVars)(cashayState, op, key);
      this._prepareMutations(op, stateVars, options);

      // TODO dispatch with status

      return cachedResponse;
    }

    /**
     * A method used to get missing data from the server.
     * Once the data comes back, it is normalized, old dependencies are removed, new ones are created,
     * and the data that comes back from the server is compared to local data to minimize invalidations
     *
     * @param {function} transport the transport class to send the query + vars to a GraphQL endpoint
     * @param {object} context the context to normalize data, including the requestAST and schema
     * @param {string} op an ID specific to the queryString/variable combo (defaults to the queryString)
     * @param {string} key A unique key to match the op instance, only used where you would use React's key
     * (eg in a component that you called map on in the parent component).
     *
     * @return {undefined}
     */

  }, {
    key: 'queryServer',
    value: function () {
      var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee(transport, context, op, key) {
        var forceFetch, variables, operation, idFieldName, schema, dispatch, minimizedQueryString, basePendingQuery, pendingQuery, _ref3, error, data, ops, i, _pendingQuery$i, _key, _op, payload, denormalizedLocalResponse, normalizedServerResponse, normalizedLocalResponse, _getState, entities, result, entitiesAndResult, fullNormalizedResponse, _i, _pendingQuery$_i, _op2, _key2, _variables, partialPayload, _payload;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                forceFetch = context.forceFetch, variables = context.variables, operation = context.operation, idFieldName = context.idFieldName, schema = context.schema;
                dispatch = this.store.dispatch;
                minimizedQueryString = (0, _printMinimalQuery.printMinimalQuery)(operation, idFieldName, variables, op, schema, forceFetch);
                // bail if we can't do anything with the variables that we were given

                if (minimizedQueryString) {
                  _context.next = 5;
                  break;
                }

                return _context.abrupt('return');

              case 5:
                basePendingQuery = this.pendingQueries[minimizedQueryString];

                if (!basePendingQuery) {
                  _context.next = 9;
                  break;
                }

                if (!(0, _queryHelpers.equalPendingQueries)(basePendingQuery, { op: op, key: key, variables: variables })) {
                  // bounce identical queries for different components
                  this.pendingQueries[minimizedQueryString].push({ op: op, key: key, variables: (0, _utils.clone)(variables) });
                }
                // if it's the same op, it'll get updates when they come
                return _context.abrupt('return');

              case 9:
                pendingQuery = this.pendingQueries[minimizedQueryString] = [{ op: op, key: key, variables: (0, _utils.clone)(variables) }];

                // send minimizedQueryString to server and await minimizedQueryResponse

                _context.next = 12;
                return transport.handleQuery({ query: minimizedQueryString, variables: variables });

              case 12:
                _ref3 = _context.sent;
                error = _ref3.error;
                data = _ref3.data;

                if (!error) {
                  _context.next = 20;
                  break;
                }

                ops = {};

                for (i = 0; i < pendingQuery.length; i++) {
                  _pendingQuery$i = pendingQuery[i], _key = _pendingQuery$i.key, _op = _pendingQuery$i.op;
                  // TODO return new obj?

                  this.cachedQueries[_op].responses[_key].error = error;
                  ops[_op] = ops[_op] || {};
                  ops[_op][_key] = ops[_op][_key] || {};
                  ops[_op][_key].error = error;
                }
                payload = { ops: ops };
                return _context.abrupt('return', dispatch({ type: _duck.SET_ERROR, payload: payload }));

              case 20:
                //re-create the denormalizedPartialResponse because it went stale when we called the server
                (0, _denormalizeHelpers.rebuildOriginalArgs)(context.operation);
                denormalizedLocalResponse = (0, _denormalizeStore2.default)(context);

                // normalize response to get ready to dispatch it into the state tree

                normalizedServerResponse = (0, _normalizeResponse2.default)(data, context);

                // do local 2nd because the above is going to mutate the variables

                normalizedLocalResponse = (0, _normalizeResponse2.default)(denormalizedLocalResponse, context);

                // reset the variables that normalizeResponse mutated TODO no longer necessary?

                context.variables = pendingQuery[pendingQuery.length - 1].variables;

                // now, remove the objects that look identical to the ones already in the state
                // that way, if the incoming entity (eg Person.123) looks exactly like the one already in the store
                // we don't have to invalidate and rerender
                _getState = this.getState(), entities = _getState.entities, result = _getState.result;
                entitiesAndResult = (0, _queryHelpers.shortenNormalizedResponse)(normalizedServerResponse, { entities: entities, result: result });

                // if the server didn't give us any new stuff, we already set the vars, so we're done here

                if (entitiesAndResult) {
                  _context.next = 29;
                  break;
                }

                return _context.abrupt('return');

              case 29:

                // combine the partial response with the server response to fully respond to the query
                fullNormalizedResponse = (0, _mergeStores2.default)(normalizedLocalResponse, normalizedServerResponse);

                // it's possible that we adjusted the arguments for the operation we sent to server
                // for example, instead of asking for 20 docs, we asked for 5 at index 15.
                // now, we want to ask for the 20 again (but locally)

                (0, _denormalizeHelpers.rebuildOriginalArgs)(context.operation);

                // since we debounced all duplicate queries, we still have to update all their deps
                for (_i = 0; _i < pendingQuery.length; _i++) {
                  _pendingQuery$_i = pendingQuery[_i], _op2 = _pendingQuery$_i.op, _key2 = _pendingQuery$_i.key, _variables = _pendingQuery$_i.variables;
                  // add denormalizedDeps so we can invalidate when other queries come in
                  // add normalizedDeps to find those deps when a denormalizedReponse is mutated
                  // the data fetched from server is only part of the story, so we need the full normalized response

                  (0, _addDeps2.default)(fullNormalizedResponse, _op2, _key2, this.normalizedDeps, this.denormalizedDeps);

                  // remove the responses from this.cachedQueries where necessary
                  (0, _flushDependencies2.default)(entitiesAndResult.entities, this.denormalizedDeps, this.cachedQueries, _op2, _key2);

                  // only bother merging the first of the possibly many pending queries
                  partialPayload = _i === 0 ? entitiesAndResult : {};
                  _payload = _extends({}, partialPayload, {
                    ops: _defineProperty({}, _op2, _defineProperty({}, _key2, {
                      variables: _variables,
                      status: 'complete',
                      error: null
                    }))
                  });

                  dispatch({
                    type: _duck.INSERT_QUERY,
                    payload: _payload
                  });
                }

                this.pendingQueries[minimizedQueryString] = undefined;

              case 33:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function queryServer(_x2, _x3, _x4, _x5) {
        return _ref2.apply(this, arguments);
      }

      return queryServer;
    }()
  }, {
    key: '_prepareMutations',
    value: function _prepareMutations(op, opStateVars, _ref4) {
      var mutationHandlers = _ref4.mutationHandlers,
          customMutations = _ref4.customMutations;
      var mutationSchema = this.schema.mutationSchema;

      if (mutationHandlers) {
        var mutationHandlerNames = Object.keys(mutationHandlers);
        for (var i = 0; i < mutationHandlerNames.length; i++) {
          var mutationName = mutationHandlerNames[i];
          (0, _utils.checkMutationInSchema)(mutationSchema, mutationName);
          this.mutationHandlers[mutationName] = this.mutationHandlers[mutationName] || {};
          this.mutationHandlers[mutationName][op] = mutationHandlers[mutationName];
        }
      }
      if (customMutations) {
        var mutationNames = Object.keys(customMutations);
        for (var _i2 = 0; _i2 < mutationNames.length; _i2++) {
          var _mutationName = mutationNames[_i2];
          (0, _utils.checkMutationInSchema)(mutationSchema, _mutationName);
          this.cachedMutations[_mutationName] = this.cachedMutations[_mutationName] || new _helperClasses.CachedMutation();
          var cachedSingles = this.cachedMutations[_mutationName].singles;
          if (!cachedSingles[op]) {
            var mutationAST = (0, _utils.parse)(customMutations[_mutationName]);

            var _namespaceMutation = (0, _namespaceMutation4.default)(mutationAST, op, opStateVars, this.schema),
                namespaceAST = _namespaceMutation.namespaceAST,
                variableEnhancers = _namespaceMutation.variableEnhancers;

            cachedSingles[op] = {
              ast: namespaceAST,
              variableEnhancers: variableEnhancers
            };
          }
        }
      }
    }

    /**
     *
     * A mutationName is not unique to a mutation, but a name + possibleComponentsObj is
     *
     * @param {string} mutationName the name of the mutation, as defined in your GraphQL schema
     * @param {Object} options all the options
     *
     */

  }, {
    key: 'mutate',
    value: function mutate(mutationName) {
      var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
      var variables = options.variables;

      if (typeof mutationName !== 'string') {
        throw new Error('The first argument to \'mutate\' should be the name of the mutation');
      }
      this.cachedMutations[mutationName] = this.cachedMutations[mutationName] || new _helperClasses.CachedMutation();
      var cachedMutation = this.cachedMutations[mutationName];

      // update fullMutation, variableSet, and variableEnhancers
      this._updateCachedMutation(mutationName, options);

      // optimistcally update
      this._processMutationHandlers(mutationName, cachedMutation.activeQueries, null, variables);
      // if (options.localOnly) return;

      // async call the server
      var variableEnhancers = this.cachedMutations[mutationName].variableEnhancers;

      var namespacedVariables = variableEnhancers.reduce(function (enhancer, reduction) {
        return enhancer(reduction);
      }, variables);
      var newOptions = _extends({}, options, { variables: namespacedVariables });
      return this._mutateServer(mutationName, cachedMutation.activeQueries, cachedMutation.fullMutation, newOptions);
    }
  }, {
    key: '_updateCachedMutation',
    value: function _updateCachedMutation(mutationName, options) {
      // try to return fast!
      var cachedMutation = this.cachedMutations[mutationName];
      var _options$variables = options.variables,
          variables = _options$variables === undefined ? {} : _options$variables;

      cachedMutation.activeQueries = new _ActiveQueries2.default(mutationName, options.ops, this.cachedQueries, this.mutationHandlers);
      if (cachedMutation.fullMutation) {
        if ((0, _hasMatchingVariables2.default)(variables, cachedMutation.variableSet)) return;
        // variable definitions and args will change, nuke the cached mutation + single ASTs
        cachedMutation.clear(true);
      }

      this._createMutationsFromQueries(mutationName, cachedMutation.activeQueries, variables);
    }
  }, {
    key: '_createMutationsFromQueries',
    value: function _createMutationsFromQueries(mutationName, activeQueries, variables) {
      var cachedMutation = this.cachedMutations[mutationName];
      var cachedSingles = cachedMutation.singles;
      var cachedSinglesASTs = [];
      var newVariableEnhancers = [];
      var opsToUpdateKeys = Object.keys(activeQueries);
      if (!opsToUpdateKeys.length) {
        cachedMutation.fullMutation = (0, _createBasicMutation2.default)(mutationName, this.schema, variables);
        return;
      }
      if ((0, _isMutationResponseScalar2.default)(this.schema, mutationName)) {
        cachedMutation.fullMutation = (0, _createBasicMutation2.default)(mutationName, this.schema, variables);
      } else {
        var _cachedMutation$varia;

        var cashayState = this.getState();
        for (var i = 0; i < opsToUpdateKeys.length; i++) {
          var op = opsToUpdateKeys[i];
          if (!cachedSingles[op]) {
            var queryOperation = this.cachedQueries[op].ast.definitions[0];
            var mutationAST = (0, _createMutationFromQuery2.default)(queryOperation, mutationName, variables, this.schema);
            var key = activeQueries[op];
            var stateVars = (0, _utils.getStateVars)(cashayState, op, key);

            var _namespaceMutation2 = (0, _namespaceMutation4.default)(mutationAST, op, stateVars, this.schema),
                namespaceAST = _namespaceMutation2.namespaceAST,
                _variableEnhancers = _namespaceMutation2.variableEnhancers;

            cachedSingles[op] = {
              ast: namespaceAST,
              variableEnhancers: _variableEnhancers
            };
          }
          var _cachedSingles$op = cachedSingles[op],
              ast = _cachedSingles$op.ast,
              variableEnhancers = _cachedSingles$op.variableEnhancers;

          cachedSinglesASTs.push(ast);
          newVariableEnhancers.push.apply(newVariableEnhancers, _toConsumableArray(variableEnhancers));
        }
        cachedMutation.fullMutation = (0, _mergeMutations2.default)(cachedSinglesASTs);
        (_cachedMutation$varia = cachedMutation.variableEnhancers).push.apply(_cachedMutation$varia, newVariableEnhancers);
      }
    }
  }, {
    key: '_mutateServer',
    value: function () {
      var _ref5 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(mutationName, componentsToUpdateObj, mutationString, options) {
        var variables, transport, docFromServer, error, data, payload, queryResponse;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                variables = options.variables;
                transport = this.getTransport(options.transport);
                _context2.next = 4;
                return transport.handleQuery({ query: mutationString, variables: variables });

              case 4:
                docFromServer = _context2.sent;
                error = docFromServer.error, data = docFromServer.data;

                if (error) {
                  payload = { error: error };

                  this.store.dispatch({ type: _duck.SET_ERROR, payload: payload });
                } else {
                  // each mutation should return only 1 response, but it may be aliased
                  // TODO remove data[mutationName]
                  queryResponse = data[mutationName] || data[Object.keys(data)[0]];
                  // update state with new doc from server

                  this._processMutationHandlers(mutationName, componentsToUpdateObj, queryResponse);
                }
                return _context2.abrupt('return', docFromServer);

              case 8:
              case 'end':
                return _context2.stop();
            }
          }
        }, _callee2, this);
      }));

      function _mutateServer(_x7, _x8, _x9, _x10) {
        return _ref5.apply(this, arguments);
      }

      return _mutateServer;
    }()
  }, {
    key: '_processMutationHandlers',
    value: function _processMutationHandlers(mutationName, componentsToUpdateObj, queryResponse, variables) {
      var componentHandlers = this.mutationHandlers[mutationName];
      var cashayState = this.getState();
      var allNormalizedChanges = {};
      var ops = {};
      var opsToUpdateKeys = Object.keys(componentsToUpdateObj);

      // for every op that listens the the mutationName
      for (var i = 0; i < opsToUpdateKeys.length; i++) {
        var op = opsToUpdateKeys[i];
        var key = componentsToUpdateObj[op] === true ? '' : componentsToUpdateObj[op];
        var componentHandler = componentHandlers[op];

        // find current cached result for this particular queryName
        var cachedResult = this.cachedQueries[op];
        var ast = cachedResult.ast,
            refetch = cachedResult.refetch,
            responses = cachedResult.responses;

        var cachedResponse = responses[key];
        if (!cachedResponse) {
          throw new Error('Cache went stale & wasn\'t recreated. Did you forget to put a redux subscriber on ' + op + '?');
        }
        var modifiedResponseData = void 0;

        // for the denormalized response, mutate it in place or return undefined if no mutation was made
        var getType = this._getTypeFactory(op, key);
        if (queryResponse) {
          // if it's from the server, send the doc we got back
          var normalizedQueryResponse = (0, _removeNamespacing2.default)(queryResponse, op);
          modifiedResponseData = componentHandler(null, normalizedQueryResponse, cachedResponse.data, getType, this._invalidate);
        } else {

          // otherwise, treat it as an optimistic update
          modifiedResponseData = componentHandler(variables, null, cachedResponse.data, getType, this._invalidate);
        }

        // there's a possible 3 updates: optimistic, doc from server, full array from server (invalidated)
        if (this._willInvalidateListener) {
          this._willInvalidateListener = false;
          refetch(key);
        }

        // this must come back after the invalidateListener check because they could invalidate without returning something
        if (!modifiedResponseData) {
          continue;
        }

        // create a new object to make sure react-redux's updateStatePropsIfNeeded returns true
        // also remove any existing errors since we've now had a successful operation
        cachedResult.responses[key] = (0, _utils.makeErrorFreeResponse)(cachedResponse);
        var schema = this.schema,
            paginationWords = this.paginationWords,
            idFieldName = this.idFieldName;

        var stateVars = (0, _utils.getStateVars)(cashayState, op, key);
        var contextVars = stateVars && (0, _utils.clone)(stateVars) || {};
        if (stateVars) {
          ops[op] = ops[op] || {};
          ops[op][key] = ops[op][key] || {};
          ops[op][key].variables = contextVars;
        }
        var context = (0, _utils.buildExecutionContext)(ast, {
          variables: contextVars,
          paginationWords: paginationWords,
          idFieldName: idFieldName,
          schema: schema,
          cashayState: cashayState
        });

        var normalizedModifiedResponse = (0, _normalizeResponse2.default)(modifiedResponseData, context);
        allNormalizedChanges = (0, _mergeStores2.default)(allNormalizedChanges, normalizedModifiedResponse);
        // TODO make sure we don't need to shallow copy this
        // allVariables = {...allVariables, ...contextVars};
      }
      var entities = cashayState.entities,
          result = cashayState.result;

      var entitiesAndResult = (0, _queryHelpers.shortenNormalizedResponse)(allNormalizedChanges, { entities: entities, result: result });
      if (!entitiesAndResult) return;
      var payload = Object.keys(ops).length ? _extends({}, entitiesAndResult, { ops: ops }) : entitiesAndResult;
      this.store.dispatch({
        type: _duck.INSERT_MUTATION,
        payload: payload
      });
    }
  }, {
    key: 'subscribe',


    /**
     *
     */
    value: function subscribe(channel) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var _this4 = this;

      var subscriber = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : this.subscriber;
      var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

      var fullChannel = (0, _utils.makeFullChannel)(channel, key);
      var fastResponse = this.cachedSubscriptions[fullChannel];
      if (fastResponse && fastResponse.status !== _utils.UNSUBSCRIBED) {
        return fastResponse;
      }
      var defaultReturnType = options.returnType,
          events = options.events;

      // TODO event subs
      // if (events) {
      //   for (let i = 0; i < events.length; i++) {
      //     const {eventSubscriber, eventOp, eventKey} = events[i];
      //
      //   };
      // }
      // if (!subscriber) {
      //   throw new Error(`subscriber function not provided for ${channel}/${key}`)
      // }

      var returnType = defaultReturnType || (0, _utils.ensureTypeFromNonNull)(this.schema.subscriptionSchema.fields[channel].type);
      var initialData = returnType.kind === LIST ? [] : returnType.kind === SCALAR ? null : {};

      var _getState2 = this.getState(),
          result = _getState2.result;

      var normalizedResult = result[channel] && result[channel][key];
      if (normalizedResult) {
        var getState = this.getState,
            coerceTypes = this.coerceTypes,
            idFieldName = this.idFieldName,
            schema = this.schema;

        initialData = (0, _denormalizeStore2.default)({ getState: getState, coerceTypes: coerceTypes, idFieldName: idFieldName, schema: schema, normalizedResult: normalizedResult });
      }
      var rootType = (0, _utils.ensureRootType)(returnType);
      var typeSchema = this.schema.types[rootType.name];
      // if it's a new op
      this.cachedSubscriptions[fullChannel] = {
        data: initialData,
        unsubscribe: null,
        status: _utils.SUBSCRIBING
      };
      var subscriptionHandlers = this.makeSubscriptionHandlers(channel, key, typeSchema);
      setTimeout(function () {
        var unsubscribe = subscriber(channel, key, subscriptionHandlers);
        _this4.unsubscribeHandlers[channel] = _this4.unsubscribeHandlers[channel] || {};
        _this4.unsubscribeHandlers[channel][key] = unsubscribe;
        _this4.cachedSubscriptions[fullChannel] = _extends({}, _this4.cachedSubscriptions[fullChannel], {
          unsubscribe: unsubscribe,
          status: _utils.READY
        });
      }, 0);
      return this.cachedSubscriptions[fullChannel];
    }
  }, {
    key: 'makeSubscriptionHandlers',
    value: function makeSubscriptionHandlers(channel, key, typeSchema) {
      var _this5 = this;

      var fullChannel = (0, _utils.makeFullChannel)(channel, key);
      var mergeNewData = function mergeNewData(handler, document) {
        var _getState3 = _this5.getState(),
            entities = _getState3.entities,
            result = _getState3.result;

        var schema = _this5.schema,
            idFieldName = _this5.idFieldName;

        var context = { entities: entities, schema: schema, idFieldName: idFieldName, typeSchema: typeSchema };
        var oldDenormResult = _this5.cachedSubscriptions[fullChannel];
        var oldNormResult = result[channel] && result[channel][key] || [];
        var processedDoc = (0, _processSubscriptionDoc2.default)(handler, document, oldDenormResult, oldNormResult, context);
        if (!processedDoc) return;
        var denormResult = processedDoc.denormResult,
            actionType = processedDoc.actionType,
            oldDoc = processedDoc.oldDoc,
            newDoc = processedDoc.newDoc,
            normEntities = processedDoc.normEntities,
            normResult = processedDoc.normResult;

        // INVALIDATE SUBSCRIPTION DEPS (things that depend on the series, not the individual docs)

        var depSet = _this5.subscriptionDeps[fullChannel];
        if (depSet instanceof Set) {
          var _iteratorNormalCompletion = true;
          var _didIteratorError = false;
          var _iteratorError = undefined;

          try {
            for (var _iterator = depSet[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
              var queryDep = _step.value;

              _this5._invalidateQueryDep(queryDep);
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

          depSet.clear();
        }

        // INVALIDATE OPS (things that depend on the individual docs, like other subscriptions that share a doc)
        // this is necessary if i update something via query, then a sub updates it afterwards
        // flushDependencies(normEntities, this.denormalizedDeps, this.cachedQueries);

        // INVALIDATE CACHED DEPS (things that depend on the individual docs and a resolver)
        var typeName = typeSchema.kind === UNION ? oldDenormResult.data.__typename : typeSchema.name;
        var cachedDepsForType = _this5.cachedDeps[typeName];
        var queryDeps = cachedDepsForType ? Object.keys(cachedDepsForType) : [];
        for (var i = 0; i < queryDeps.length; i++) {
          var _queryDep = queryDeps[i];
          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = cachedDepsForType[_queryDep][Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var resolver = _step2.value;

              // in the future, we can use field-specific invalidation, but for now, we invalidate if the obj changes
              if (newDoc && resolver(newDoc) || oldDoc && resolver(oldDoc)) {
                // the only reason to not invalidate is if the document was unaffected and still is unaffected
                // is resovle functions are expensive, we could also look at denormalziedDeps instead of testing oldDoc
                _this5._invalidateQueryDep(_queryDep);
              }
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
        }

        _this5.cachedSubscriptions[fullChannel] = _extends({}, oldDenormResult, {
          data: denormResult
        });
        var payload = {
          entities: normEntities,
          result: _defineProperty({}, channel, _defineProperty({}, key, normResult))
        };
        // stick normalize data in store and recreate any invalidated denormalized structures
        _this5.store.dispatch({
          type: actionType,
          payload: payload
        });
      };

      return {
        add: function add(document) {
          mergeNewData(_utils.ADD, document);
        },
        update: function update(document) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
          var removeKeys = options.removeKeys;

          var updatedDoc = Array.isArray(options.removeKeys) ? removeKeys.reduce(function (obj, key) {
            return obj[key] = _utils.REMOVAL_FLAG;
          }, _extends({}, document)) : document;
          mergeNewData(_utils.UPDATE, updatedDoc);
        },
        upsert: function upsert(document) {
          var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

          var updatedDoc = Array.isArray(options.removeKeys) ? removeKeys.reduce(function (obj, key) {
            return obj[key] = _utils.REMOVAL_FLAG;
          }, _extends({}, document)) : document;
          mergeNewData(_utils.UPSERT, updatedDoc);
        },
        remove: function remove(document, options) {
          mergeNewData(_utils.REMOVE, document);
        },
        setStatus: function setStatus(status) {
          var cachedSub = _this5.cachedSubscriptions[channel];
          cachedSub.responses[key] = _extends({}, cachedSub.responses[key], {
            status: status
          });
          dispatch({
            type: _duck.SET_STATUS,
            status: status
          });
        }
      };
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe(channel) {
      var key = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

      var unsubscribe = this.unsubscribeHandlers[channel] && this.unsubscribeHandlers[channel][key];
      var fullChannel = (0, _utils.makeFullChannel)(channel, key);
      if (typeof unsubscribe !== 'function') {
        throw new Error('No unsubscribe function provided from subscriber for ' + fullChannel);
      }
      this.cachedSubscriptions[fullChannel] = _extends({}, this.cachedSubscriptions[fullChannel], {
        status: _utils.UNSUBSCRIBED
      });
      unsubscribe();
    }
  }]);

  return Cashay;
}();

exports.default = new Cashay();