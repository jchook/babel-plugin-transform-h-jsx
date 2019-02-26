import esutils from "esutils";
import * as t from "babel-types";

type ElementState = {
  tagExpr: Object; // tag node
  tagName: string; // raw string tag name
  args: Array<Object>; // array of call arguments
  call?: Object; // optional call property that can be set to override the call expression returned
  pre?: Function; // function called with (state: ElementState) before building attribs
  post?: Function; // function called with (state: ElementState) after building attribs
};

export default function (opts) {
  let visitor = {};

  visitor.JSXNamespacedName = function (path) {
    throw path.buildCodeFrameError("Namespace tags are not supported. ReactJSX is not XML.");
  };

  visitor.JSXElement = {
    exit(path, file) {
      let callExpr = buildElementCall(path.get("openingElement"), file);

      // This is the only change from react
      // callExpr.arguments.concat(path.node.children);
      callExpr.arguments.push(t.arrayExpression([].concat(path.node.children)));

      if (callExpr.arguments.length >= 3) {
        callExpr._prettyCall = true;
      }

      path.replaceWith(t.inherits(callExpr, path.node));
    }
  };

  return visitor;

  function convertJSXIdentifier(node, parent) {
    if (t.isJSXIdentifier(node)) {
      if (node.name === "this" && t.isReferenced(node, parent)) {
        return t.thisExpression();
      } else if (esutils.keyword.isIdentifierNameES6(node.name)) {
        node.type = "Identifier";
      } else {
        return t.stringLiteral(node.name);
      }
    } else if (t.isJSXMemberExpression(node)) {
      return t.memberExpression(
        convertJSXIdentifier(node.object, node),
        convertJSXIdentifier(node.property, node)
      );
    }

    return node;
  }

  function convertAttributeValue(node) {
    if (t.isJSXExpressionContainer(node)) {
      return node.expression;
    } else {
      return node;
    }
  }

  function convertAttribute(node) {
    let value = convertAttributeValue(node.value || t.booleanLiteral(true));

    if (t.isStringLiteral(value)) {
      value.value = value.value.replace(/\n\s+/g, " ");
    }

    if (t.isValidIdentifier(node.name.name)) {
      node.name.type = "Identifier";
    } else {
      node.name = t.stringLiteral(node.name.name);
    }

    return t.inherits(t.objectProperty(node.name, value), node);
  }

  function buildElementCall(path, file) {
    path.parent.children = t.react.buildChildren(path.parent);

    let tagExpr = convertJSXIdentifier(path.node.name, path.node);
    let args = [];

    let tagName;
    if (t.isIdentifier(tagExpr)) {
      tagName = tagExpr.name;
    } else if (t.isLiteral(tagExpr)) {
      tagName = tagExpr.value;
    }

    let state: ElementState = {
      tagExpr: tagExpr,
      tagName: tagName,
      args:    args
    };

    if (opts.pre) {
      opts.pre(state, file);
    }

    let attribs = path.node.attributes;
    if (attribs.length) {
      attribs = buildOpeningElementAttributes(attribs, file);
    } else {
      attribs = t.nullLiteral();
    }

    args.push(attribs);

    if (opts.post) {
      opts.post(state, file);
    }

    return state.call || t.callExpression(state.callee, args);
  }

  /**
   * The logic for this is quite terse. It's because we need to
   * support spread elements. We loop over all attributes,
   * breaking on spreads, we then push a new object containg
   * all prior attributes to an array for later processing.
   */

  function buildOpeningElementAttributes(attribs, file) {
    let _props = [];
    let objs = [];

    function pushProps() {
      if (!_props.length) return;

      objs.push(t.objectExpression(_props));
      _props = [];
    }

    while (attribs.length) {
      let prop = attribs.shift();
      if (t.isJSXSpreadAttribute(prop)) {
        pushProps();
        objs.push(prop.argument);
      } else {
        _props.push(convertAttribute(prop));
      }
    }

    pushProps();

    if (objs.length === 1) {
      // only one object
      attribs = objs[0];
    } else {
      // looks like we have multiple objects
      if (!t.isObjectExpression(objs[0])) {
        objs.unshift(t.objectExpression([]));
      }

      // spread it
      attribs = t.callExpression(
        file.addHelper("extends"),
        objs
      );
    }

    let attrsbs = []

    attribs.properties.forEach(function (el) {
      if (el.type == 'ObjectProperty') {
        if (el.key.value !== undefined && el.key.value.substring(0, 5) === 'data-') {
          if(el.key.value.slice(5) === 'value') {
            attrsbs.push(t.ObjectProperty(t.StringLiteral(el.key.value.slice(5)), el.value.value))
          } else {
            attrsbs.push(t.ObjectProperty(t.StringLiteral(el.key.value.slice(5)), t.StringLiteral(el.value.value)))
          }
        }
      }
    })
    attribs.properties.push(t.ObjectProperty(t.StringLiteral('dataset'), t.objectExpression(attrsbs)))
    return attribs;
  }
}
