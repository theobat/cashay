'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defaultHandleErrors = require('../defaultHandleErrors');

var _defaultHandleErrors2 = _interopRequireDefault(_defaultHandleErrors);

var _Transport2 = require('../Transport');

var _Transport3 = _interopRequireDefault(_Transport2);

var _graphql = require('graphql');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MockTransport = function (_Transport) {
  _inherits(MockTransport, _Transport);

  function MockTransport(schema) {
    var _this2 = this;

    var handleErrors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultHandleErrors2.default;

    _classCallCheck(this, MockTransport);

    var _this = _possibleConstructorReturn(this, (MockTransport.__proto__ || Object.getPrototypeOf(MockTransport)).call(this));

    _this.handleErrors = handleErrors;
    _this.sendToServer = function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(request) {
        var query, variables, result;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                query = request.query, variables = request.variables;
                _context.next = 3;
                return (0, _graphql.graphql)(schema, query, {}, {}, variables).catch(console.error);

              case 3:
                result = _context.sent;
                return _context.abrupt('return', result);

              case 5:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function (_x2) {
        return _ref.apply(this, arguments);
      };
    }();
    return _this;
  }

  return MockTransport;
}(_Transport3.default);

exports.default = MockTransport;