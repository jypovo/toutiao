const arr = []

// 如果条件成立，证明是发布模式
if (process.env.NODE_ENV === 'production') {
  // 向 arr 中添加一个发布阶段需要用到的插件
  arr.push('transform-remove-console')
}

module.exports = {
  presets: ['@vue/cli-plugin-babel/preset'],
  // 通过 plugins 数组中的 @babel/plugin-syntax-dynamic-import 插件，可以把路由懒加载的语法进行转换
  plugins: ['@babel/plugin-syntax-dynamic-import', ...arr]
}
