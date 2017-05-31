"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var getMissingRequiredVariablesTest = exports.getMissingRequiredVariablesTest = {
  variables: {
    exampleFloat: 0.0,
    exampleInt: 0,
    exampleBoolean: false,
    exampleString: ''
  },
  variableDefinitions: [{
    "kind": "VariableDefinition",
    "type": {
      "kind": "NamedType",
      "name": {
        "kind": "Name",
        "value": "Float"
      }
    },
    "variable": {
      "kind": "Variable",
      "name": {
        "kind": "Name",
        "value": "exampleFloat"
      }
    }
  }, {
    "kind": "VariableDefinition",
    "type": {
      "kind": "NonNullType",
      "type": {
        "kind": "NamedType",
        "name": {
          "kind": "Name",
          "value": "Int"
        }
      }
    },
    "variable": {
      "kind": "Variable",
      "name": {
        "kind": "Name",
        "value": "exampleInt"
      }
    }
  }, {
    "kind": "VariableDefinition",
    "type": {
      "kind": "NonNullType",
      "type": {
        "kind": "NamedType",
        "name": {
          "kind": "Name",
          "value": "Boolean"
        }
      }
    },
    "variable": {
      "kind": "Variable",
      "name": {
        "kind": "Name",
        "value": "exampleBoolean"
      }
    }
  }, {
    "kind": "VariableDefinition",
    "type": {
      "kind": "NonNullType",
      "type": {
        "kind": "NamedType",
        "name": {
          "kind": "Name",
          "value": "String"
        }
      }
    },
    "variable": {
      "kind": "Variable",
      "name": {
        "kind": "Name",
        "value": "exampleString"
      }
    }
  }]
};