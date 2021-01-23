// sql/collection/users.js
const mongoose = require('./../db.js'); // 引入数据库连接模块
const Schema = mongoose.Schema; // 拿到当前数据库相应的集合对象
const { parseTime } = require('./../../module/utils')
// 设计用户表的集合
const logSchema = new Schema({ // 设计用户集合的字段以及数据类型
  customer_id: {
    type: String,
    require: true
  }, // 会员
  user_id: {
    type: String,
    require: true
  }, // 销售人员
  operator_id: {
    type: String,
    require: true
  }, // 操作人员
  operator_dpt: {
    type: String,
    require: true
  },
  account_type: {
    type: Number,
    require: true
  }, // 账单类型  1: 消费 2: 充值
  type: {
    type: Number,
    require: true
  }, // 1: 新增 2: 消费 3: 充值 4:散户消费
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
  insert_date: {
    type: Date,
    default: Date.now
  },
  create_at: {
    type: Number,
    default: new Date().getTime()
  },
  update_at: {
    type: Number,
    default: new Date().getTime()
  }
})

// Defines a pre hook for the document.
logSchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_at = this.update_at = new Date().getTime()
  }
  else {
    this.update_at = new Date().getTime()
  }
  next()
})

module.exports = mongoose.model('logs', logSchema);
