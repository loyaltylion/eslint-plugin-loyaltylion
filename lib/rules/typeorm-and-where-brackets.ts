import { createRule } from '../util'
import {
  MemberExpression,
  Identifier,
  Expression,
  Literal,
  TemplateLiteral,
} from '@typescript-eslint/typescript-estree/dist/ts-estree/ts-estree'
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils'

export enum MessageId {
  BracketsRequired = 'andWhereBracketsRequired',
  LiteralRequired = 'andWhereLiteralRequired',
}

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
      [MessageId.LiteralRequired]:
        'First argument to `andWhere` must be a string or template literal',
      [MessageId.BracketsRequired]:
        'Strings passed to `andWhere` containing an `or` must start with `(` and end with `)`',
    },
    schema: [],
  },
  defaultOptions: [],
  create(context) {
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

        const value = getStringValue(node.arguments[0])

        if (value === null) {
          // although non-literals (e.g. clause from a variable) may be safe, we
          // have no way to know for sure that they are. It's safer to enforce
          // that the argument must be a string literal. This isn't much of an
          // inconvenience as most of the time it's best to pass a literal to
          // this function anyway
          context.report({
            messageId: MessageId.LiteralRequired,
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

function getStringValue(node: Expression): string | null {
  if (isLiteral(node) && typeof node.value === 'string') {
    return node.value
  }

  if (isTemplateLiteral(node)) {
    return node.quasis.map(x => x.value.raw).join('')
  }

  return null
}

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
