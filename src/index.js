/*eslint-env node*/
export default function ({ types: t }) {

  let visitor = require("./helper")({
    pre(state) {
      let tagName = state.tagName;
      let args    = state.args;
      if (t.react.isCompatTag(tagName)) {
        args.push(t.stringLiteral(tagName));
      } else {
        args.push(state.tagExpr);
      }
    },

    post(state, pass) {
      state.callee = pass.get("jsxIdentifier");
    }
  });

  visitor.Program = function (path, state) {
    let id = state.opts.pragma || "h";
    state.set("jsxIdentifier", id.split(".").map((name) => t.identifier(name)).reduce(function (object, property) {
      return t.memberExpression(object, property);
    }));
  };

  return {
    inherits: require("babel-plugin-syntax-jsx"),
    visitor
  };
}
