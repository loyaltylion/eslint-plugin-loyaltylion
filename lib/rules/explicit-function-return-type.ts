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
    allowConciseArrowFunctionExpressionsStartingWithVoid?: boolean
  },
]

const messageId = 'missingReturnType'

/**
 * The same as `typescript-eslint/explicit-function-return-type` but with an
 * option to allow arrow functions
 */
export default createRule<Options, typeof messageId>({
  name: 'explicit-function-return-type',
  meta: {
    ...(baseRule.meta as any),
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

    const ruleFuncDeclaration = rule.FunctionDeclaration
    const ruleFuncExpression = rule[
      'ArrowFunctionExpression, FunctionExpression'
    ] as typeof rule.FunctionExpression

    // because we're patching the explicit-function-return-type rule, we are
    // liable to break here if the listeners change in that rule (it has
    // happened before). If that happens, we'll get this error after an upgrade.
    // check the rule source and ensure that our patch is doing what it is
    // supposed to do (i.e. passes FuncDeclaration and FuncExpressions to the
    // rule, and handles ArrowFuncExpressions itself)
    //
    // https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/rules/explicit-function-return-type.ts

    if (!ruleFuncDeclaration || !ruleFuncExpression) {
      throw new Error(
        '@loyaltylion/explicit-function-return-type: our patch to the underlying ' +
          'rule is no longer going to work because we are missing one or more ' +
          'listeners',
      )
    }

    return {
      FunctionDeclaration: ruleFuncDeclaration,
      FunctionExpression: ruleFuncExpression,
      ArrowFunctionExpression(node): void {
        if (
          options.allowArrowFunctions &&
          node.parent?.type === AST_NODE_TYPES.VariableDeclarator
        ) {
          return
        }

        ruleFuncExpression(node as any)
      },
    }
  },
})
