'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _defaultHandleErrors = require('./defaultHandleErrors');

var _defaultHandleErrors2 = _interopRequireDefault(_defaultHandleErrors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Transport = function () {
  function Transport(sendToServer) {
    var handleErrors = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : _defaultHandleErrors2.default;

    _classCallCheck(this, Transport);

    this.sendToServer = sendToServer;
    this.handleErrors = handleErrors;
  }

  _createClass(Transport, [{
    key: 'handleQuery',
    value: function () {
      var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee(request) {
        var _ref2, data, errors, error;

        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.sendToServer(request);

              case 2:
                _ref2 = _context.sent;
                data = _ref2.data;
                errors = _ref2.errors;
                error = this.handleErrors(request, errors);
                return _context.abrupt('return', error ? { data: data, error: error } : { data: data });

              case 7:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function handleQuery(_x2) {
        return _ref.apply(this, arguments);
      }

      return handleQuery;
    }()
  }]);

  return Transport;
}();

exports.default = Transport;