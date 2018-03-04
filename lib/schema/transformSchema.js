'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeMinimalSchema = undefined;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _introspectionQuery = require('./introspectionQuery');

var _introspectionQuery2 = _interopRequireDefault(_introspectionQuery);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

exports.default = function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(rootSchema, graphql) {
    var initialResult;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return graphql(rootSchema, _introspectionQuery2.default);

          case 2:
            initialResult = _context.sent;

            if (!initialResult.errors) {
              _context.next = 5;
              break;
            }

            throw new Error('unable to parse schema: ' + initialResult.errors);

          case 5:
            return _context.abrupt('return', makeMinimalSchema(initialResult.data.__schema));

          case 6:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function transformSchema(_x, _x2) {
    return _ref.apply(this, arguments);
  }

  return transformSchema;
}();

var isObject = function isObject(val) {
  return val && (typeof val === 'undefined' ? 'undefined' : _typeof(val)) === 'object';
};
var removeNullsFromList = function removeNullsFromList(list) {
  var _iteratorNormalCompletion = true;
  var _didIteratorError = false;
  var _iteratorError = undefined;

  try {
    for (var _iterator = list[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
      var item = _step.value;

      removeNullsFromObject(item);
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
};
var removeNullsFromObject = function removeNullsFromObject(obj) {
  var itemKeys = Object.keys(obj);
  var _iteratorNormalCompletion2 = true;
  var _didIteratorError2 = false;
  var _iteratorError2 = undefined;

  try {
    for (var _iterator2 = itemKeys[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
      var itemKey = _step2.value;

      var field = obj[itemKey];
      if (Array.isArray(field)) {
        removeNullsFromList(field);
      } else if (isObject(field)) {
        removeNullsFromObject(field);
      } else if (field === null) {
        delete obj[itemKey];
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
};

//TODO filter out interfaces
var makeMinimalSchema = exports.makeMinimalSchema = function makeMinimalSchema(schema) {
  removeNullsFromObject(schema);
  var queryName = schema.queryType && schema.queryType.name;
  var mutationName = schema.mutationType && schema.mutationType.name;
  var subscriptionName = schema.subscriptionType && schema.subscriptionType.name;
  var filteredTypes = schema.types.filter(function (type) {
    return !type.name.startsWith('__');
  });

  var _iteratorNormalCompletion3 = true;
  var _didIteratorError3 = false;
  var _iteratorError3 = undefined;

  try {
    for (var _iterator3 = filteredTypes[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
      var type = _step3.value;

      if (type.fields) {
        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = type.fields[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var field = _step5.value;

            if (field.args) {
              if (field.args.length) {
                field.args = objArrayToHashMap(field.args);
              } else {
                delete field.args;
              }
            }
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5.return) {
              _iterator5.return();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        type.fields = objArrayToHashMap(type.fields);
      }
      if (type.enumValues) {
        type.enumValues = objArrayToHashMap(type.enumValues);
      }
      if (type.inputFields) {
        type.inputFields = objArrayToHashMap(type.inputFields);
      }
      if (type.possibleTypes) {
        type.possibleTypes = objArrayToHashMap(type.possibleTypes);
      }
      if (type.interfaces) {
        if (type.interfaces.length) {
          type.interfaces = objArrayToHashMap(type.interfaces);
        } else {
          delete type.interfaces;
        }
      }
    }
  } catch (err) {
    _didIteratorError3 = true;
    _iteratorError3 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion3 && _iterator3.return) {
        _iterator3.return();
      }
    } finally {
      if (_didIteratorError3) {
        throw _iteratorError3;
      }
    }
  }

  var filteredTypesMap = objArrayToHashMap(filteredTypes);
  var filteredDirectives = schema.directives.filter(function (directive) {
    return directive.name !== 'deprecated';
  });
  var _iteratorNormalCompletion4 = true;
  var _didIteratorError4 = false;
  var _iteratorError4 = undefined;

  try {
    for (var _iterator4 = filteredDirectives[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
      var directive = _step4.value;

      directive.args = objArrayToHashMap(directive.args);
    }
  } catch (err) {
    _didIteratorError4 = true;
    _iteratorError4 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion4 && _iterator4.return) {
        _iterator4.return();
      }
    } finally {
      if (_didIteratorError4) {
        throw _iteratorError4;
      }
    }
  }

  var filteredDirectivesMap = objArrayToHashMap(filteredDirectives);
  var querySchema = filteredTypesMap[queryName];
  delete filteredTypesMap[queryName];
  var mutationSchema = filteredTypesMap[mutationName];
  delete filteredTypesMap[mutationName];
  var subscriptionSchema = filteredTypesMap[subscriptionName];
  delete filteredTypesMap[subscriptionName];

  var finalResult = {
    querySchema: querySchema,
    types: filteredTypesMap,
    directives: filteredDirectivesMap
  };
  if (mutationSchema) {
    finalResult.mutationSchema = mutationSchema;
  }
  if (subscriptionSchema) {
    finalResult.subscriptionSchema = subscriptionSchema;
  }
  return finalResult;
};

var objArrayToHashMap = function objArrayToHashMap(arr) {
  var hashMap = {};
  var _iteratorNormalCompletion6 = true;
  var _didIteratorError6 = false;
  var _iteratorError6 = undefined;

  try {
    for (var _iterator6 = arr[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
      var field = _step6.value;

      hashMap[field.name] = field;
    }
  } catch (err) {
    _didIteratorError6 = true;
    _iteratorError6 = err;
  } finally {
    try {
      if (!_iteratorNormalCompletion6 && _iterator6.return) {
        _iterator6.return();
      }
    } finally {
      if (_didIteratorError6) {
        throw _iteratorError6;
      }
    }
  }

  return hashMap;
};