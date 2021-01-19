const router = require('koa-router')()
const mongoose = require('mongoose');
const { parseTime } = require('./../module/utils')
// 找到客户集合
const Customer = require('../sql/collection/customer')
// 日志集合
const Logs = require('../sql/collection/logs')
// 找到数据库封装文件
const sql = require('../sql/index')

router.prefix('/customer')

const discount = (val) => {
  switch (val) {
    case 0:
      return 0.85
    case 1:
      return 0.7
    case 2:
      return 0.65
    case 3:
      return 0.6
    case 4:
      return 0.55
    default:
      return 1
  }
}

// 列表查询
router.post('/list', async (ctx, next) => {
  const {condition: {nickname, tel}, showObj, pageSize, page, sort} = ctx.request.body
  const data = await sql.paging(Customer, {nickname: {$regex: nickname},tel: {$regex: tel}}, null, pageSize, page, sort)
  if (data) {
    ctx.body = {
      ...data,
      retCode: 0
    }
  } else {
    ctx.body = {
      msg: '暂无数据',
      retCode: 1
    }
  }
})

// 新增
router.post('/add', async (ctx, next) => {
  const params = ctx.request.body
  console.log(params);
  const tel = await sql.findOne(Customer, {tel: params.tel})
  if (tel) {
    ctx.body = {
      msg: '手机号码已存在',
      retCode: 1
    }
    return
  }
  const result = await sql.insert(Customer, {customer_id: `LH${parseTime(new Date(),'{y}{m}{d}{h}{i}{s}')}`,...params})
  if (result.retCode === 0) {
    const logParams = {
      customer_id: result.data[0].customer_id,
      user_id: params.userid,
      type: 1,
      vip_level: params.vip_level,
      sum: params.sum,
      recharge_sum: params.sum
    }
    await sql.insert(Logs, logParams)
  }
  ctx.body = result
})

// 获取会员信息
router.post('/info', async (ctx, next) => {
  const _id = mongoose.Types.ObjectId(ctx.request.body._id)
  const data = await sql.findOne(Customer, {_id})
  if (data) {
    ctx.body = {
      userinfo: data,
      retCode: 0
    }
  } else {
    ctx.body = {
      msg: '获取失效',
      retCode: 404
    }
  }
})

// 修改
router.post('/edit', async (ctx, next) => {
  const params = ctx.request.body
  const _id = mongoose.Types.ObjectId(params._id);
  const tel = await sql.findOne(Customer, {_id: { $ne: _id }, tel: params.tel})
  if (tel) {
    ctx.body = {
      msg: '手机号码已存在',
      retCode: 1
    }
    return
  }

  const data = await sql.update(Customer, { _id: _id }, {update_at: new Date().getTime(), ...params})
  ctx.body = data
})

// 删除
router.post('/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  const _id = mongoose.Types.ObjectId(id)
  const data = await sql.update(Customer, { _id }, {update_at: new Date().getTime(), flag: 0})
  ctx.body = data
})

// 扣款
router.post('/consume', async (ctx, next) => {
  const { userid, sum, consume, vip_level, _id, customer_id } = ctx.request.body
  const id = mongoose.Types.ObjectId(_id)
  const money = sum - Number((consume * discount(vip_level)).toFixed(2))
  const result = await sql.update(Customer, { _id: id }, {update_at: new Date().getTime(), sum: money})

  if (result.retCode === 0) {
    const logParams = {
      customer_id: customer_id,
      user_id: userid,
      type: 2,
      vip_level: vip_level,
      sum: money,
      consume_sum: Number((consume * discount(vip_level)).toFixed(2))
    }
    await sql.insert(Logs, logParams)
  }
  ctx.body = { ...result, sum: money }
})

// 充值
router.post('/recharge', async (ctx, next) => {
  const { userid, sum, consume, vip_level, _id, customer_id } = ctx.request.body
  const id = mongoose.Types.ObjectId(_id);
  const money = Number(sum) + Number(consume)
  const result = await sql.update(Customer, { _id: id }, {update_at: new Date().getTime(), sum: money, vip_level})

  if (result.retCode === 0) {
    const logParams = {
      customer_id: customer_id,
      user_id: userid,
      type: 3,
      vip_level: vip_level,
      sum: money,
      recharge_sum: Number(consume)
    }
    await sql.insert(Logs, logParams)
  }
  ctx.body = { ...result, sum: money }
})

// 散户消费
router.post('/consumeGeneral', async (ctx, next) => {
  const { userid, consume } = ctx.request.body
  const logParams = {
    customer_id: '-',
    user_id: userid,
    type: 4,
    consume_sum: consume
  }
  const result = await sql.insert(Logs, logParams)
  ctx.body = { ...result }
})

module.exports = router
