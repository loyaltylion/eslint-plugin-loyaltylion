import { TSESLint } from '@typescript-eslint/experimental-utils'
import path from 'path'
import { RuleTesterConfig } from '@typescript-eslint/experimental-utils/dist/ts-eslint'

const parser = '@typescript-eslint/parser'

/**
 * @see https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/tests/RuleTester.ts
 */
class RuleTester extends TSESLint.RuleTester {
  private readonly filename: string

  constructor(options: RuleTesterConfig) {
    super(options)
    this.filename = path.join(getFixturesRootDir(), 'file.ts')
  }

  run<TMessageIds extends string, TOptions extends readonly unknown[]>(
    name: string,
    rule: TSESLint.RuleModule<TMessageIds, TOptions>,
    tests: TSESLint.RunTests<TMessageIds, TOptions>,
  ): void {
    const errorMessage =
      'Do not set the parser at the test level unless you' +
      `want to use a parser other than ${parser}`

    if (this.filename) {
      tests.valid = tests.valid.map(test => {
        if (typeof test === 'string') {
          return {
            code: test,
            filename: this.filename,
          }
        }
        return test
      })
    }

    tests.valid.forEach(test => {
      if (typeof test !== 'string') {
        if (test.parser === parser) {
          throw new Error(errorMessage)
        }
        if (!test.filename) {
          test.filename = this.filename
        }
      }
    })

    tests.invalid.forEach(test => {
      if (test.parser === parser) {
        throw new Error(errorMessage)
      }
      if (!test.filename) {
        test.filename = this.filename
      }
    })

    super.run(name, rule, tests)
  }
}

export function createRuleTester() {
  return new RuleTester({
    parserOptions: {
      ecmaVersion: 2018,
      project: './tsconfig.json',
      tsconfigRootDir: getFixturesRootDir(),
    },
    parser: require.resolve('@typescript-eslint/parser'),
  })
}

function getFixturesRootDir(): string {
  return path.join(process.cwd(), 'test/fixtures/')
}
