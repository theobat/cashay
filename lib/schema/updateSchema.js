'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _minimist = require('minimist');

var _minimist2 = _interopRequireDefault(_minimist);

var _introspectionQuery = require('./introspectionQuery');

var _introspectionQuery2 = _interopRequireDefault(_introspectionQuery);

var _isomorphicFetch = require('isomorphic-fetch');

var _isomorphicFetch2 = _interopRequireDefault(_isomorphicFetch);

var _transformSchema = require('./transformSchema');

var _transformSchema2 = _interopRequireDefault(_transformSchema);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

// why instanceof is still a thing is beyond me...
var graphql = require(_path2.default.join(process.cwd(), 'node_modules', 'graphql')).graphql;

var urlRegex = /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;

exports.default = function () {
  var _ref = _asyncToGenerator(regeneratorRuntime.mark(function _callee() {
    var args, inputArg, relativeOutputPath, outputPath, spacing, oncomplete, rootSchema, finalResult;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            args = (0, _minimist2.default)(process.argv);
            inputArg = args._[2] || '';
            relativeOutputPath = process.argv[3] || './clientSchema.json';
            outputPath = _path2.default.join(process.cwd(), relativeOutputPath);
            spacing = args.production ? 0 : 2;
            oncomplete = args.oncomplete && require(_path2.default.join(process.cwd(), args.oncomplete));
            _context.next = 8;
            return getSchema(inputArg);

          case 8:
            rootSchema = _context.sent;
            _context.next = 11;
            return (0, _transformSchema2.default)(rootSchema, graphql);

          case 11:
            finalResult = _context.sent;

            try {
              _fs2.default.writeFileSync(outputPath, JSON.stringify(finalResult, null, spacing));
              console.log('You got yourself a schema! See it here: ' + outputPath);
              oncomplete && oncomplete();
            } catch (e) {
              console.log('Error writing schema to file: ' + e);
            }

          case 13:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  function updateSchema() {
    return _ref.apply(this, arguments);
  }

  return updateSchema;
}();

var getSchema = function () {
  var _ref2 = _asyncToGenerator(regeneratorRuntime.mark(function _callee2(inputArg) {
    var body, res, status, statusText, resJSON, relativeInputPath, rootSchema;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!urlRegex.test(inputArg)) {
              _context2.next = 17;
              break;
            }

            body = JSON.stringify({ query: _introspectionQuery2.default });
            _context2.next = 4;
            return (0, _isomorphicFetch2.default)(inputArg, { method: 'POST', body: body });

          case 4:
            res = _context2.sent;
            status = res.status, statusText = res.statusText;
            resJSON = void 0;

            if (!(status >= 200 && status < 300)) {
              _context2.next = 13;
              break;
            }

            _context2.next = 10;
            return res.json();

          case 10:
            resJSON = _context2.sent;
            _context2.next = 15;
            break;

          case 13:
            console.log('Could not reach your GraphQL server: ' + inputArg + '.\n        Error: ' + statusText);
            return _context2.abrupt('return');

          case 15:
            if (resJSON.errors) {
              console.log('The graphQL endpoint returned the following errors: ' + JSON.stringify(resJSON.errors));
            }
            return _context2.abrupt('return', resJSON.data);

          case 17:
            relativeInputPath = _path2.default.join(process.cwd(), inputArg);
            rootSchema = void 0;

            try {
              rootSchema = require(relativeInputPath).default;
            } catch (e) {
              console.log('Error requiring schema', e);
            }
            return _context2.abrupt('return', rootSchema);

          case 21:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, undefined);
  }));

  return function getSchema(_x) {
    return _ref2.apply(this, arguments);
  };
}();