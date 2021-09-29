// 这个文件，是 ESLint 的配置文件
module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', '@vue/standard'],
  parserOptions: {
    parser: 'babel-eslint'
  },
  // 自定义的语法规则列表
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    // 今后，方法的形参小括号之前，不需要加空格
    // 规则：只要修改了配置文件，必须重启打包的服务器，从而让新的配置生效
    'space-before-function-paren': ['error', 'never']
  }
}
