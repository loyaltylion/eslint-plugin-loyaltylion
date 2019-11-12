import typescriptEslint from '@typescript-eslint/eslint-plugin'
import { createRule } from '../util'
import { AST_NODE_TYPES } from '@typescript-eslint/experimental-utils'

const baseRule = typescriptEslint.rules['explicit-function-return-type']

type Options = [
  {
    allowExpressions?: boolean
    allowTypedFunctionExpressions?: boolean
    allowHigherOrderFunctions?: boolean
    /**
     * Allow arrow functions without a return type. This only applies to
     * variable declarations
     */
    allowArrowFunctions?: boolean
    allowDirectConstAssertionInArrowFunctions?: boolean
  },
]

const messageId = 'missingReturnType'

/**
 * The same as `typescript-eslint/explicit-function-return-type` but with an
 * option to allow arrow functions
 */
export default createRule<Options, typeof messageId>({
  name: 'return-await-promise-in-try',
  meta: {
    ...baseRule.meta,
    schema: [
      {
        type: 'object',
        properties: {
          allowExpressions: {
            type: 'boolean',
          },
          allowTypedFunctionExpressions: {
            type: 'boolean',
          },
          allowHigherOrderFunctions: {
            type: 'boolean',
          },
          allowArrowFunctions: {
            type: 'boolean',
          },
          allowDirectConstAssertionInArrowFunctions: {
            type: 'boolean',
          },
        },
        additionalProperties: false,
      },
    ],
  },
  defaultOptions: [
    {
      allowExpressions: false,
      allowTypedFunctionExpressions: true,
      allowHigherOrderFunctions: true,
      allowArrowFunctions: false,
      allowDirectConstAssertionInArrowFunctions: true,
    },
  ],
  create(context, [options]) {
    const rule = baseRule.create(context)

    return {
      FunctionDeclaration: rule.FunctionDeclaration,
      FunctionExpression: rule.FunctionExpression,
      ArrowFunctionExpression(node): void {
        if (
          options.allowArrowFunctions &&
          node.parent?.type === AST_NODE_TYPES.VariableDeclarator
        ) {
          return
        }

        rule.ArrowFunctionExpression?.(node)
      },
    }
  },
})
