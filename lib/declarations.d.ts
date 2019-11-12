declare module '@typescript-eslint/eslint-plugin' {
  import { RuleModule } from '@typescript-eslint/experimental-utils/dist/ts-eslint'

  interface Rules {
    'explicit-function-return-type': RuleModule<any, any>
  }

  const config: { rules: Rules }
  export default config
}
