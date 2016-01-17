/*eslint-env node*/
"use strict";

exports.__esModule = true;

exports["default"] = function (_ref) {
  var t = _ref.types;

  var visitor = require("./helper")({
    pre: function pre(state) {
      var tagName = state.tagName;
      var args = state.args;
      if (t.react.isCompatTag(tagName)) {
        args.push(t.stringLiteral(tagName));
      } else {
        args.push(state.tagExpr);
      }
    },

    post: function post(state, pass) {
      state.callee = pass.get("jsxIdentifier");
    }
  });

  visitor.Program = function (path, state) {
    var id = state.opts.pragma || "h";
    state.set("jsxIdentifier", id.split(".").map(function (name) {
      return t.identifier(name);
    }).reduce(function (object, property) {
      return t.memberExpression(object, property);
    }));
  };

  return {
    inherits: require("babel-plugin-syntax-jsx"),
    visitor: visitor
  };
};

module.exports = exports["default"];