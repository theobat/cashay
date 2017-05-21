import test from 'ava';
import {getMissingRequiredVariablesTest} from './queryHelpers-data'
import {getMissingRequiredVariables} from '../queryHelpers'

test('Valid "falsy" values in getMissingRequiredVariables', t => {
  const {variableDefinitions, variables} = getMissingRequiredVariablesTest
  const falsyReportedMissing = getMissingRequiredVariables(variableDefinitions, variables)
  t.deepEqual(falsyReportedMissing.length, 0);
});
