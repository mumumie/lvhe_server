// sql/collection/users.js
const mongoose = require('./../db.js'); // 引入数据库连接模块
const Schema = mongoose.Schema; // 拿到当前数据库相应的集合对象
const { parseTime } = require('./../../module/utils')
// 设计用户表的集合
const userSchema = new Schema({ // 设计用户集合的字段以及数据类型
  user_id: {
    type: String,
    unique: true,
    default: `A${parseTime(new Date(),'{y}{m}{d}{h}{i}{s}')}`
  },
  username: {
    type: String,
    unique:true,
    required: true,
    trim: true
  },
  password: {
    type: String,
    require: true,
    trim: true
  },
  nickname: {
    type: String,
    require: true
  },
  avatar: {
    type: String,
    default: ''
  },
  introduction: {
    type: String,
    default: ''
  },
  tel: {
    type: Number,
    unique:true,
    require: true
  },
  role: {
    type: Number,
    require: true
  },
  department: {
    type: String,
    require: true
  },
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
userSchema.pre('save', function(next) {
  if (this.isNew) {
    console.log(this.isNew)
    this.createAt = this.updateAt = new Date().getTime()
  }
  else {
    this.updateAt = new Date().getTime()
  }
  next()
})

module.exports = mongoose.model('user', userSchema);
