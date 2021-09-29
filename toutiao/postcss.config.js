module.exports = {
  plugins: {
    'postcss-pxtorem': {
      rootValue: 37.5, // rem 计算的基准值
      propList: ['*'] // 要处理的属性列表，* 代表所有属性
    }
  }
}
