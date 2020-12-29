// db.js
const mongoose = require('mongoose');
mongoose.set("useCreateIndex", true);
// 1908shop 是表示数据库的名称
const DB_URL = 'mongodb://localhost:27017/book';

mongoose.connect(DB_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('connected', () => {
  console.log('数据库连接成功')
})

mongoose.connection.on('disconnected', () => {
  console.log('数据库断开')
})

mongoose.connection.on('error', () => {
  console.log('数据库连接异常')
})

// 将此文件作为一个模块 暴露出去，供别人调用
module.exports = mongoose;
