import { createRule, getParserServices } from '../util'
import { AST_NODE_TYPES, TSESTree } from '@typescript-eslint/experimental-utils'
import ts = require('typescript')

export enum MessageId {
  BracketsRequired = 'andWhereBracketsRequired',
  ValidNodeRequired = 'andWhereValidNodeRequired',
}

const BRACKETS_SYMBOL = 'Brackets'
const BRACKETED_RE = /^\s*\(.*?\)\s*$/m
const CONTAINS_OR_RE = /\s+or\s+/im

export default createRule<[], MessageId>({
  name: 'typeorm-and-where-brackets',
  meta: {
    type: 'problem',
    docs: {
      description: 'Require that strings passed to `andWhere` are safe',
      category: 'Possible Errors',
      recommended: 'error',
    },
    messages: {
      [MessageId.ValidNodeRequired]: `First argument to \`andWhere\` must be a string, template literal or ${BRACKETS_SYMBOL} type`,
      [MessageId.BracketsRequired]:
        'Strings passed to `andWhere` containing an `or` must start with `(` and end with `)`',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const parserServices = getParserServices(context)
    const checker = parserServices.program.getTypeChecker()

    function getType(node: TSESTree.Expression): ts.Type {
      return checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      )
    }

    function isBracketsExpression(node: TSESTree.Expression): boolean {
      return getType(node).getSymbol()?.name === BRACKETS_SYMBOL
    }

    function getExpressionStringValue(
      node: TSESTree.Expression,
    ): string | null {
      if (isTemplateLiteral(node)) {
        return node.quasis.map((x) => x.value.raw).join('')
      }

      const type = getType(node)

      if (type.isStringLiteral()) {
        return type.value
      }

      return null
    }

    return {
      CallExpression(node): void {
        const { callee } = node

        if (!isMemberExpression(callee)) {
          return
        }

        if (!isIdentifier(callee.property)) {
          return
        }

        if (callee.property.name !== 'andWhere') {
          return
        }

        if (node.arguments.length === 0) {
          return
        }

        const firstArg = node.arguments[0]

        if (isBracketsExpression(firstArg)) {
          return
        }

        const value = getExpressionStringValue(firstArg)

        if (value === null) {
          context.report({
            messageId: MessageId.ValidNodeRequired,
            node: callee,
          })

          return
        }

        if (!CONTAINS_OR_RE.test(value)) {
          return
        }

        if (BRACKETED_RE.test(value)) {
          return
        }

        context.report({
          messageId: MessageId.BracketsRequired,
          node: callee,
        })
      },
    }
  },
})

function isMemberExpression(
  node: TSESTree.Expression,
): node is TSESTree.MemberExpression {
  return node.type === AST_NODE_TYPES.MemberExpression
}

function isIdentifier(node: TSESTree.Expression): node is TSESTree.Identifier {
  return node.type === AST_NODE_TYPES.Identifier
}

function isLiteral(node: TSESTree.Expression): node is TSESTree.Literal {
  return node.type === AST_NODE_TYPES.Literal
}

function isTemplateLiteral(
  node: TSESTree.Expression,
): node is TSESTree.TemplateLiteral {
  return node.type === AST_NODE_TYPES.TemplateLiteral
}
