'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _defaultHandleErrors = require('./defaultHandleErrors');

var _defaultHandleErrors2 = _interopRequireDefault(_defaultHandleErrors);

var _Transport2 = require('./Transport');

var _Transport3 = _interopRequireDefault(_Transport2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var HTTPTransport = function (_Transport) {
  _inherits(HTTPTransport, _Transport);

  function HTTPTransport() {
    var uri = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '/graphql';

    var _this2 = this;

    var init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var handleErrors = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : _defaultHandleErrors2.default;

    _classCallCheck(this, HTTPTransport);

    var _this = _possibleConstructorReturn(this, (HTTPTransport.__proto__ || Object.getPrototypeOf(HTTPTransport)).call(this));

    _this.uri = uri;
    _this.init = init;
    _this.handleErrors = handleErrors;
    _this.sendToServer = function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(request) {
        var payload, result, status, statusText;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                payload = _extends({}, _this.init, {
                  body: JSON.stringify(request),
                  headers: _extends({}, _this.init.headers, {
                    'Accept': '*/*',
                    'Content-Type': 'application/json'
                  }),
                  method: 'POST'
                });
                _context.next = 3;
                return (0, _isomorphicFetch2.default)(_this.uri, payload);

              case 3:
                result = _context.sent;
                status = result.status, statusText = result.statusText;

                if (!(status >= 200 && status < 300)) {
                  _context.next = 11;
                  break;
                }

                _context.next = 8;
                return result.json();

              case 8:
                return _context.abrupt('return', _context.sent);

              case 11:
                return _context.abrupt('return', {
                  data: null,
                  errors: [{ _error: statusText, status: status }]
                });

              case 12:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, _this2);
      }));

      return function (_x4) {
        return _ref.apply(this, arguments);
      };
    }();
    return _this;
  }

  return HTTPTransport;
}(_Transport3.default);

exports.default = HTTPTransport;