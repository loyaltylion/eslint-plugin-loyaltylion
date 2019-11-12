import rule, { MessageId } from '../../lib/rules/typeorm-and-where-brackets'
import { createRuleTester } from '../util'

const ruleTester = createRuleTester()

ruleTester.run('typeorm-and-where-brackets', rule, {
  valid: [
    `
manager.createQueryBuilder(User, 'users')
  .where('users.id = :id', { id: 1 })
  .andWhere('users.ref = 20')
  .getOne()

manager.createQueryBuilder(User, 'users')
  .where('users.id = :id', { id: 1 })
  .andWhere(
    '(users.name = :name OR users.email = :email)',
    { name: 'alice', email: 'alice@example.com' },
  )
  .getOne()

const clause = "users.name = 'alice'"
manager.createQueryBuilder(User, 'users')
  .andWhere(clause)
  .getOne()

class Brackets {
  constructor(fn?: any) {}
}

manager.createQueryBuilder(User, 'users')
  .andWhere(
    new Brackets(brackets => {
      brackets
        .where("users.name = 'Alice'")
        .orWhere("users.name = 'Bob'")
    })
  )
  .getOne()

const bracketsExpr = new Brackets()

manager.createQueryBuilder(User, 'users')
  .andWhere(bracketsExpr)
  .getOne()
    `,
  ],

  invalid: [
    {
      code: `
  manager.createQueryBuilder(User, 'users')
    .where('users.id = :id', { id: 1 })
    .andWhere(
      'users.name = :name OR users.email = :email',
      { name: 'alice', email: 'alice@example.com' },
    )
    .getOne()

  manager.createQueryBuilder(User, 'users')
    .where('users.id = :id', { id: 1 })
    .andWhere(\`users.name = \${name} or users.email is null\`)
    .getOne()

  const clause = () => "users.name = 'alice'"
  manager.createQueryBuilder(User, 'users')
    .where('users.id = :id', { id: 1 })
    .andWhere(clause())
    .getOne()

  manager.createQueryBuilder(User, 'users')
    .andWhere({} as any)
    .getOne()
        `,
      errors: [
        {
          line: 2,
          messageId: MessageId.BracketsRequired,
        },
        {
          line: 10,
          messageId: MessageId.BracketsRequired,
        },
        {
          line: 16,
          messageId: MessageId.ValidNodeRequired,
        },
        {
          line: 21,
          messageId: MessageId.ValidNodeRequired,
        },
      ],
    },
  ],
})
