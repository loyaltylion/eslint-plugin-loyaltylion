import rule from '../../lib/rules/return-await-promise-in-try'
import { createRuleTester } from '../util'

const ruleTester = createRuleTester()

ruleTester.run('return-await-promise-in-try', rule, {
  valid: [
    `
const myPromise = Promise.resolve()

async function one() {
  try {
   	return await myPromise
  } catch (err) {
    console.log(err)
  }
}

async function two() {
  return myPromise
}

async function three() {
  return await two()
}
    `,
  ],

  invalid: [
    {
      code: `
const myPromise = Promise.resolve()

async function main() {
  try {
   	return myPromise
  } catch (err) {
    console.log(err)
  }
}
      `,
      errors: [
        {
          line: 6,
          messageId: 'returnAwaitPromiseInTry',
        },
      ],
    },
  ],
})
