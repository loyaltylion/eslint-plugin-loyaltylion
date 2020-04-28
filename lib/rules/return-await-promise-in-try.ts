import { createRule, getParserServices } from '../util'
import ts from 'typescript'
import {
  isAwaitExpression,
  isFunctionScopeBoundary,
  isTryStatement,
} from 'tsutils'

const PROMISE_SYMBOLS = ['Promise', 'PromiseLike', 'Bluebird']

const messageId = 'returnAwaitPromiseInTry'

export default createRule<[], typeof messageId>({
  name: 'return-await-promise-in-try',
  meta: {
    type: 'problem',
    docs: {
      description:
        'Require that a Promise returned within a try block must be awaited',
      category: 'Possible Errors',
      recommended: 'error',
    },
    messages: {
      returnAwaitPromiseInTry:
        'Promises returned in a try block must be awaited',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context)
    const checker = parserServices.program.getTypeChecker()

    return {
      ReturnStatement(node): void {
        const { expression } = parserServices.esTreeNodeToTSNodeMap.get(node)

        if (!expression) {
          return
        }

        if (isAwaitExpression(expression)) {
          return
        }

        if (!hasErrorHandler(expression)) {
          return
        }

        const { symbol } = checker.getTypeAtLocation(expression)

        if (!symbol) {
          return
        }

        if (PROMISE_SYMBOLS.includes(symbol.name)) {
          context.report({
            messageId,
            node,
          })
        }
      },
    }
  },
})

// implementation lifted from tslint because the eslint equivilent relies on
// a bunch of ast utils which aren't exported from `eslint` module
function hasErrorHandler(node: ts.Node): boolean {
  while (node.parent !== undefined) {
    if (isFunctionScopeBoundary(node)) {
      return false
    }

    if (isTryStatement(node.parent)) {
      if (
        // statements inside the try block always have an error handler, either
        // catch or finally
        node.parent.tryBlock === node ||
        // statement inside the catch block only have an error handler if there
        // is a finally block
        (node.parent.finallyBlock !== undefined &&
          node.parent.catchClause === node)
      ) {
        return true
      }

      node = node.parent.parent
    }

    node = node.parent
  }

  return false
}
