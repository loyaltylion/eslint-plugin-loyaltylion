import typeormAndWhereBrackets from './rules/typeorm-and-where-brackets'
import explicitFunctionReturnType from './rules/explicit-function-return-type'

export = {
  rules: {
    'explicit-function-return-type': explicitFunctionReturnType,
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
        'loyaltylion/typeorm-and-where-brackets': 1,
      },
    },
  },
}
