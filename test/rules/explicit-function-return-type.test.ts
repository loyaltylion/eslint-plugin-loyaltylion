import rule from '../../lib/rules/explicit-function-return-type'
import { createRuleTester } from '../util'

const ruleTester = createRuleTester()

ruleTester.run('explicit-function-return-type', rule, {
  valid: [
    {
      code: `
const func = (name: string) => ({ name })
    `,
      options: [
        {
          allowArrowFunctions: true,
        },
      ],
    },
  ],

  invalid: [
    {
      code: `
const func = (name: string) => ({ name })
const funcTwo = function() { return 1 }
const alice = {
  getName: () => 'Alice'
}
class Test {
  func = () => 'xyz'
}
      `,
      options: [
        {
          allowArrowFunctions: true,
        },
      ],
      errors: [
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          line: 5,
          messageId: 'missingReturnType',
        },
        {
          line: 8,
          messageId: 'missingReturnType',
        },
      ],
    },
    {
      code: `
const func = (name: string) => ({ name })
const funcTwo = function() { return 1 }
function funcThree() { return 2 }
      `,
      errors: [
        {
          line: 2,
          messageId: 'missingReturnType',
        },
        {
          line: 3,
          messageId: 'missingReturnType',
        },
        {
          line: 4,
          messageId: 'missingReturnType',
        },
      ],
    },
  ],
})
