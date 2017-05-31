'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.CLEAR = exports.SET_STATUS = exports.SET_ERROR = exports.SET_VARIABLES = exports.INSERT_MUTATION = exports.INSERT_QUERY = exports.REMOVE_SUBSCRIPTION = exports.UPDATE_SUBSCRIPTION = exports.ADD_SUBSCRIPTION = undefined;
exports.default = reducer;

var _mergeStores = require('./mergeStores');

var _mergeStores2 = _interopRequireDefault(_mergeStores);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ADD_SUBSCRIPTION = exports.ADD_SUBSCRIPTION = '@@cashay/ADD_SUBSCRIPTION';
var UPDATE_SUBSCRIPTION = exports.UPDATE_SUBSCRIPTION = '@@cashay/UPDATE_SUBSCRIPTION';
var REMOVE_SUBSCRIPTION = exports.REMOVE_SUBSCRIPTION = '@@cashay/REMOVE_SUBSCRIPTION';
var INSERT_QUERY = exports.INSERT_QUERY = '@@cashay/INSERT_QUERY';
var INSERT_MUTATION = exports.INSERT_MUTATION = '@@cashay/INSERT_MUTATION';
var SET_VARIABLES = exports.SET_VARIABLES = '@@cashay/SET_VARIABLES';
var SET_ERROR = exports.SET_ERROR = '@@cashay/SET_ERROR';
var SET_STATUS = exports.SET_STATUS = '@@cashay/SET_STATUS';
var CLEAR = exports.CLEAR = '@@cashay/CLEAR';

var initialState = {
  entities: {
    // [GraphQLObjectTypeName] : {
    //   [args?]: Array.isArray(GraphQLObjectType) ? {
    //     [FRONT]: [],
    //     [BACK]: [],
    //     [FULL]: [],
    //   } : {}
    // }
  },
  error: null,
  ops: {
    // [op]: {
    //   [key]: {
    //     variables: {},
    //     status: '',
    //     error: {}
    //   }
    // }
  },
  result: {}
};

function reducer() {
  var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
  var action = arguments[1];
  var type = action.type;

  if (type.startsWith('@@cashay')) {
    if (type === CLEAR) return initialState;
    var isMutation = type === INSERT_MUTATION;
    return (0, _mergeStores2.default)(state, action.payload, isMutation);
  } else {
    return state;
  }
};