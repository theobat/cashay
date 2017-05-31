'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.default = getFieldState;

var _kinds = require('graphql/language/kinds');

var _utils = require('../utils');

var _separateArgs2 = require('./separateArgs');

var _separateArgs3 = _interopRequireDefault(_separateArgs2);

var _denormalizeHelpers = require('./denormalizeHelpers');

var _helperClasses = require('../helperClasses');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * given a parent field state & some args, drill down to the data using the args as a map
 *
 * @param {object} fieldState the parent field in the redux state.
 * @param {object} fieldSchema the portion of the clientSchema relating to the fieldState
 * @param {object} selection the original query AST that holds the arguments
 * @param {object} context
 *
 * @returns {*} an object, or array, or scalar from the normalized store
 * */
function getFieldState(fieldState, fieldSchema, selection, context) {
  if (!(0, _utils.isObject)(fieldState) || !fieldSchema.args) return fieldState;
  var fieldArgs = selection.arguments;
  // TODO can we short circuit if there are no fieldArgs provided?
  // if (!fieldArgs) return fieldState;

  var subState = fieldState;
  var skipTransform = context.skipTransform,
      paginationWords = context.paginationWords,
      variables = context.variables;

  var _separateArgs = (0, _separateArgs3.default)(fieldSchema, fieldArgs, paginationWords, variables),
      regularArgs = _separateArgs.regularArgs,
      paginationArgs = _separateArgs.paginationArgs;

  if (regularArgs) {
    var regularArgsString = (0, _utils.getRegularArgsKey)(regularArgs);
    subState = subState[regularArgsString];
  }
  if (paginationArgs) {
    var arrType = subState[_utils.FULL] ? _utils.FULL : paginationArgs[paginationWords.last] !== undefined ? _utils.BACK : _utils.FRONT;
    subState = handlePaginationArgs(paginationArgs, subState[arrType]);

    // reduce the ask from the server
    if (arrType !== _utils.FULL && !skipTransform) {
      reducePaginationRequest(paginationArgs, subState, fieldSchema, selection, context);
    }
  }
  return subState;
};

/**
 * Provide a subset of the array of documents in the state
 * @param {Object} paginationArgs an object with only 1 field: FIRST or LAST
 * @param {Array} usefulArray the array of document corresponding to the FIRST or LAST
 * */
var handlePaginationArgs = function handlePaginationArgs(paginationArgs, usefulArray) {
  var first = paginationArgs.first,
      last = paginationArgs.last;

  // try to use the full array. if it doesn't exist, see if we're going backwards & use the back array, else front

  var count = last !== undefined ? last : first;

  // if last is provided, then first is not and we need to go from last to first
  var slicedArr = void 0;
  if (last) {
    var firstNonNullIdx = countLeftPadding(usefulArray);
    var firstDesiredDocIdx = usefulArray.length - last;
    var startIdx = Math.max(firstNonNullIdx, firstDesiredDocIdx);
    slicedArr = usefulArray.slice(startIdx, usefulArray.length);
  } else {
    var lastNonNullIdx = countRightPadding(usefulArray);
    var lastDesiredDocIdx = first - 1;
    var sliceThrough = Math.min(lastNonNullIdx, lastDesiredDocIdx);
    slicedArr = usefulArray.slice(0, sliceThrough + 1);
  }

  // assign BOF and EOF to the array, similar to hasPreviousPage, hasNextPage
  assignFieldStateMeta(slicedArr, usefulArray, count);
  return slicedArr;
};

var reducePaginationRequest = function reducePaginationRequest(paginationArgs, usefulArray, fieldSchema, selection, context) {
  var first = paginationArgs.first,
      last = paginationArgs.last;

  var count = last || first;
  var fieldArgs = selection.arguments;
  var paginationWords = context.paginationWords;

  var countWord = last !== undefined ? paginationWords.last : paginationWords.first;

  var missingDocCount = count - usefulArray.length;
  // if we have a partial response & the backend accepts a cursor, only ask for the missing pieces
  if (missingDocCount > 0 && missingDocCount < count) {
    var cursorWord = last ? paginationWords.before : paginationWords.after;
    if (!fieldSchema.args[cursorWord]) {
      throw new Error('Your schema does not accept an argument for your cursor named ' + cursorWord + '.');
    }
    // flag all AST children with sendToServer = true
    // TODO write test to make sure I don't need to send children to server
    // sendChildrenToServer(selection);
    // TODO when to remove doWarn?
    var doWarn = true;
    var cashayState = context.getState();

    var _getBestCursor = getBestCursor(first, usefulArray, cashayState.entities, doWarn),
        bestCursor = _getBestCursor.bestCursor,
        cursorIdx = _getBestCursor.cursorIdx;

    var desiredDocCount = count - (cursorIdx + 1);

    // save the original arguments, we'll overwrite them with efficient ones for the server,
    // but need them later to create the denormaliezd response
    selection.originalArguments = fieldArgs.slice();

    //get the index of the count argument so we can replace it with the new one
    var countArgIdx = fieldArgs.findIndex(function (arg) {
      return arg.name.value === countWord;
    });

    //  create a new count arg & override the old one
    fieldArgs[countArgIdx] = makeCountArg(countWord, desiredDocCount);

    // make a new cursor argument
    var newCursorArg = makeCursorArg(cursorWord, bestCursor);
    fieldArgs.push(newCursorArg);
  }
};

var getBestCursor = function getBestCursor(first, usefulArray, entities, doWarn) {
  var storedDoc = void 0;
  var i = void 0;
  if (first) {
    for (i = usefulArray.length - 1; i >= 0; i--) {
      // given something like `Post:123`, return the document from the store
      var _splitNormalString = (0, _denormalizeHelpers.splitNormalString)(usefulArray[i]),
          _splitNormalString2 = _slicedToArray(_splitNormalString, 2),
          typeName = _splitNormalString2[0],
          docId = _splitNormalString2[1];

      storedDoc = entities[typeName][docId];
      if (storedDoc.cursor !== undefined) break;
    }
  } else {
    for (i = 0; i < usefulArray.length; i++) {
      var _splitNormalString3 = (0, _denormalizeHelpers.splitNormalString)(usefulArray[i]),
          _splitNormalString4 = _slicedToArray(_splitNormalString3, 2),
          typeName = _splitNormalString4[0],
          docId = _splitNormalString4[1];

      storedDoc = entities[typeName][docId];
      if (storedDoc.cursor !== undefined) break;
    }
  }

  // TODO this is incorrect, I think it should be length -1 and break this into 2 functions
  if (i >= 0 && i < usefulArray.length) {
    return { bestCursor: storedDoc.cursor, cursorIdx: i };
  } else if (doWarn) {
    console.warn('No cursor was included for the following docs: ' + usefulArray + '. \n        Include the \'cursor\' field for those docs');
  }
};

var countLeftPadding = function countLeftPadding(array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i]) {
      return i;
    }
  }
};

var countRightPadding = function countRightPadding(array) {
  for (var i = array.length - 1; i >= 0; i--) {
    if (array[i]) {
      return i;
    }
  }
};

/**
 * Assign metadata to the array.
 * The EOF, BOF are useful to the front-end developer if they want to know if there are more docs available
 * The count is useful internally to mutations so we know how a certain query has been mutated
 * @param {Array} slicedArray the subset of the usefulArray
 * @param {Array} usefulArray all the documents in that direction that are available on the client
 * @param {Number} count the number of documents desired by the front-end
 * */
var assignFieldStateMeta = function assignFieldStateMeta(slicedArray, usefulArray, count) {
  Object.assign(slicedArray, {
    EOF: slicedArray[slicedArray.length - 1] === usefulArray[usefulArray.length - 1],
    BOF: slicedArray[0] === usefulArray[0],
    count: count
  });
};

var makeCursorArg = function makeCursorArg(cursorName, cursorValue) {
  return new _helperClasses.RequestArgument(cursorName, _kinds.STRING, cursorValue);
};
var makeCountArg = function makeCountArg(countName, countValue) {
  return new _helperClasses.RequestArgument(countName, _kinds.INT, countValue);
};