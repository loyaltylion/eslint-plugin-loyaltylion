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

const clause = "users.name = 'alice'"
manager.createQueryBuilder(User, 'users')
  .where('users.id = :id', { id: 1 })
  .andWhere(clause)
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
          messageId: MessageId.LiteralRequired,
        },
      ],
    },
  ],
})
