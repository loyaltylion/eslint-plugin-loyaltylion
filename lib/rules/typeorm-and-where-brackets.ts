import { createRule, getParserServices } from '../util'
import {
  MemberExpression,
  Identifier,
  Expression,
  Literal,
  TemplateLiteral,
} from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils'
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

    function getType(node: Expression): ts.Type {
      return checker.getTypeAtLocation(
        parserServices.esTreeNodeToTSNodeMap.get(node),
      )
    }

    function isBracketsExpression(node: Expression): boolean {
      return getType(node).getSymbol()?.name === BRACKETS_SYMBOL
    }

    function getExpressionStringValue(node: Expression): string | null {
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

function isMemberExpression(node: Expression): node is MemberExpression {
  return node.type === AST_NODE_TYPES.MemberExpression
}

function isIdentifier(node: Expression): node is Identifier {
  return node.type === AST_NODE_TYPES.Identifier
}

function isLiteral(node: Expression): node is Literal {
  return node.type === AST_NODE_TYPES.Literal
}

function isTemplateLiteral(node: Expression): node is TemplateLiteral {
  return node.type === AST_NODE_TYPES.TemplateLiteral
}
