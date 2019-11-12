import returnAwaitPromiseInTry from './rules/return-await-promise-in-try'
import typeormAndWhereBrackets from './rules/typeorm-and-where-brackets'
import explicitFunctionReturnType from './rules/explicit-function-return-type'

export = {
  rules: {
    'explicit-function-return-type': explicitFunctionReturnType,
    'return-await-promise-in-try': returnAwaitPromiseInTry,
    'typeorm-and-where-brackets': typeormAndWhereBrackets,
  },
  configs: {
    all: {
      rules: {
        'loyaltylion/explicit-function-return-type': [
          1,
          {
            allowExpressions: true,
            allowHigherOrderFunctions: true,
            allowTypedFunctionExpressions: true,
            allowArrowFunctions: true,
          },
        ],
        'loyaltylion/return-await-promise-in-try': 1,
        'loyaltylion/typeorm-and-where-brackets': 1,
      },
    },
  },
}
