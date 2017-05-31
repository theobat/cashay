'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = makeFriendlyStore;

var _findTypeInQuery = require('./findTypeInQuery');

var _findTypeInQuery2 = _interopRequireDefault(_findTypeInQuery);

var _getFieldState = require('../normalize/getFieldState');

var _getFieldState2 = _interopRequireDefault(_getFieldState);

var _utils = require('../utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function makeFriendlyStore(rawState, typeName, context) {
  var operation = context.operation,
      schema = context.schema;

  var recurseRawStore = function recurseRawStore(subStore, typeToFind) {
    var friendlyStore = {};
    var typeKeys = Object.keys(subStore);
    var fieldSchema = schema.types[typeToFind];
    for (var i = 0; i < typeKeys.length; i++) {
      var typeKey = typeKeys[i];
      var rawFieldState = subStore[typeKey];
      var selection = (0, _findTypeInQuery2.default)(typeToFind, operation, schema);
      var fieldState = (0, _getFieldState2.default)(rawFieldState, fieldSchema, selection, context);
      if ((0, _utils.isObject)(fieldState) && schema.types[typeKey]) {
        fieldState[typeKey] = recurseRawStore(rawFieldState, typeKey);
      }
      friendlyStore[typeKey] = fieldState;
    }
    return friendlyStore;
  };
  recurseRawStore(rawState, typeName);
};