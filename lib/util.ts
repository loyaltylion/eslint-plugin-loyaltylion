import {
  ESLintUtils,
  TSESLint,
  ParserServices,
} from '@typescript-eslint/experimental-utils'

export const createRule = ESLintUtils.RuleCreator((name) => name)

type RequiredParserServices = {
  [k in keyof ParserServices]: Exclude<ParserServices[k], undefined>
}

/**
 * Try to retrieve typescript parser service from context
 *
 * @see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/src/util/getParserServices.ts
 */
export function getParserServices<
  TMessageIds extends string,
  TOptions extends unknown[]
>(
  context: TSESLint.RuleContext<TMessageIds, TOptions>,
): RequiredParserServices {
  if (
    !context.parserServices ||
    !context.parserServices.program ||
    !context.parserServices.esTreeNodeToTSNodeMap
  ) {
    throw new Error(
      'You have used a rule which requires parserServices to be generated. ' +
        'You must therefore provide a value for the "parserOptions.project" ' +
        'property for @typescript-eslint/parser.',
    )
  }

  return context.parserServices as RequiredParserServices
}
