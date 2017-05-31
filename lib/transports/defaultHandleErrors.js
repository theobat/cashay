'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = defaultHandleErrors;
var tryParse = function tryParse(str) {
  var obj = void 0;
  try {
    obj = JSON.parse(str);
  } catch (e) {
    return false;
  }
  return obj;
};

function defaultHandleErrors(request, errors) {
  var duckField = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '_error';

  if (!errors) return;
  // expect a human to put an end-user-safe message in the message field
  var firstErrorMessage = errors[0].message;
  if (!firstErrorMessage) return { errors: errors };
  var parsedError = tryParse(firstErrorMessage);
  if (parsedError && parsedError.hasOwnProperty(duckField)) {
    return parsedError;
  }
  return { errors: errors };
};