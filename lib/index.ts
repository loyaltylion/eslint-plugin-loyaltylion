import returnAwaitPromiseInTry from './rules/return-await-promise-in-try'
import typeormAndWhereBrackets from './rules/typeorm-and-where-brackets'

export = {
  rules: {
    'return-await-promise-in-try': returnAwaitPromiseInTry,
    'typeorm-and-where-brackets': typeormAndWhereBrackets,
  },
  configs: {
    all: {
      rules: {
        'loyaltylion/return-await-promise-in-try': 1,
        'loyaltylion/typeorm-and-where-brackets': 1,
      },
    },
  },
}
