import returnAwaitPromiseInTry from './rules/return-await-promise-in-try'

export = {
  rules: {
    'return-await-promise-in-try': returnAwaitPromiseInTry,
  },
  configs: {
    all: {
      'loyaltylion/return-await-promise-in-try': 1,
    },
  },
}
