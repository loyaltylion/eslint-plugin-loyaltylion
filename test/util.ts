import { TSESLint } from '@typescript-eslint/experimental-utils'
import path from 'path'

export function createRuleTester() {
  return new TSESLint.RuleTester({
    parser: require.resolve('@typescript-eslint/parser'),
  })
}
