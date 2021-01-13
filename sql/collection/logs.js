// sql/collection/users.js
const mongoose = require('./../db.js'); // 引入数据库连接模块
const Schema = mongoose.Schema; // 拿到当前数据库相应的集合对象
const { parseTime } = require('./../../module/utils')
// 设计用户表的集合
const logSchema = new Schema({ // 设计用户集合的字段以及数据类型
  customer_id: {
    type: String,
    require: true
  },
  user_id: {
    type: String,
    require: true
  },
  type: {
    type: Number,
    require: true
  }, // 1: 新增 2: 消费 3: 充值
  vip_level: {
    type: Number,
    require: true
  }, // 0: 学生卡 1: 银卡 2:金卡 3: 白金卡 4: 至尊卡
  sum: {
    type: Number,
    require: true
  }, // 余额
  recharge_sum: {
    type: Number,
    default: 0
  }, // 充值金额
  consume_sum: {
    type: Number,
    default: 0
  }, // 消费金额
  remark: {
    type: String,
    default: ''
  }, // 备注
  flag: {
    type: Number,
    default: 1
  },
  createAt: {
    type: Number,
    default: new Date().getTime()
  },
  updateAt: {
    type: Number,
    default: new Date().getTime()
  }
})

// Defines a pre hook for the document.
logSchema.pre('save', function(next) {
  if (this.isNew) {
    this.createAt = this.updateAt = new Date().getTime()
  }
  else {
    this.updateAt = new Date().getTime()
  }
  next()
})

module.exports = mongoose.model('logs', logSchema);
