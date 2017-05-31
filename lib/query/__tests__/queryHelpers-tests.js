'use strict';

var _ava = require('ava');

var _ava2 = _interopRequireDefault(_ava);

require('babel-register');

var _queryHelpersData = require('./queryHelpers-data');

var _queryHelpers = require('../queryHelpers');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

(0, _ava2.default)('Valid "falsy" values in getMissingRequiredVariables', function (t) {
  var variableDefinitions = _queryHelpersData.getMissingRequiredVariablesTest.variableDefinitions,
      variables = _queryHelpersData.getMissingRequiredVariablesTest.variables;

  var falsyReportedMissing = (0, _queryHelpers.getMissingRequiredVariables)(variableDefinitions, variables);
  t.deepEqual(falsyReportedMissing.length, 0);
});