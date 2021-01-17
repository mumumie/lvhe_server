// sql/collection/users.js
const mongoose = require('./../db.js'); // 引入数据库连接模块
const Schema = mongoose.Schema; // 拿到当前数据库相应的集合对象
const { parseTime } = require('./../../module/utils')
// 设计用户表的集合
const customerSchema = new Schema({ // 设计用户集合的字段以及数据类型
  customer_id: {
    type: String,
    unique: true,
    default: `LH${parseTime(new Date(),'{y}{m}{d}{h}{i}{s}')}`
  },
  nickname: {
    type: String,
    require: true
  }, // 姓名
  tel: {
    type: String,
    unique:true,
    require: true
  }, // 电话
  department: {
    type: String,
    require: true
  },
  vip_level: {
    type: Number,
    require: true
  }, // 0: 普通会员 1: 超级会员
  sum: {
    type: Number,
    require: true
  }, // 总金额
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
customerSchema.pre('save', function(next) {
  if (this.isNew) {
    this.create_at = this.update_at = new Date().getTime()
  }
  else {
    this.update_at = new Date().getTime()
  }
  next()
})

module.exports = mongoose.model('customer', customerSchema);
