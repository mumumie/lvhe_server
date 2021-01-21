const router = require('koa-router')()
const mongoose = require('mongoose')

// 找到用户集合
const Logs = require('../sql/collection/logs')
const User = require('../sql/collection/users')
const Customer = require('../sql/collection/customer')
// 找到数据库封装文件
const sql = require('../sql/index')

router.prefix('/logs')

const getInfo = async (collectionName, row, prop) => {
  if (row[prop]) {
    const info = await collectionName.findOne({[prop]: row[prop]})
    return info
  } else {
    return null
  }
}

// 列表查询
router.post('/list', async (ctx, next) => {
  const { condition, showObj, pageSize, page, sort } = ctx.request.body
  let whereObj = {}
  if (condition) {
    whereObj = condition
  }
  const data = await sql.paging(Logs, whereObj, null, pageSize, page, sort)
  const list = data.list.map(async v => {
    const user_info = await getInfo(User, v, 'user_id')
    const customer_info = await getInfo(Customer, v, 'customer_id')
    const obj = await v
    return {
      obj,
      user_info,
      customer_info
    }
  })
  const result = await Promise.all(list)
  if (data) {
    ctx.body = {
      list: result,
      totalNum: data.totalNum,
      retCode: 0
    }
  } else {
    ctx.body = {
      msg: '暂无数据',
      retCode: 1
    }
  }
})

// 查询月消费充值数据
router.post('/monthCustomer', async (ctx, next) => {
  const { type, date, field } = ctx.request.body
  const params = [
    {
      $match: {
        "type": type
      }
    },
    {
      $project : {
        day : { $substr: [{"$add":["$insert_date", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
        [field]: 1 //设置原有price字段可用，用于计算总价
      },
    },
    {
      $group: {
        _id: "$day", //将_id设置为day数据
        totalPrice:{ $sum: `$${field}`}, //统计price
      }
    },
    {
      $sort: { _id: 1 }//根据date排序
    }
  ]
  if (date && typeof date === 'object') {
    params[0].$match.create_at = {
      $gte: date[0],
      $lte: date[1]
    }
  }
  const result = await Logs.aggregate(params)
  ctx.body = {
    list: result,
    retCode: 0
  }
})

// 查询月消费充值数据
router.post('/monthConsumeTotal', async (ctx, next) => {
  const { date } = ctx.request.body
  const params = [
    {
      $match: {}
    },
    {
      $project : {
        "type": 1,
        "recharge_sum": 1,
        "consume_sum": 1
      },
    },
    {
      $group: {
        _id: "$type", // 将_id设置为day数据
        rechargeTotal:{ $sum: "$recharge_sum" },
        consumeTotal:{ $sum: "$consume_sum" }
      }
    },
    {
      $sort: { _id: 1 }//根据date排序
    }
  ]
  if (date && typeof date === 'object') {
    params[0].$match.create_at = {
      $gte: date[0],
      $lte: date[1]
    }
  }
  const result = await Logs.aggregate(params)
  ctx.body = {
    list: result,
    retCode: 0
  }
})

// 删除
router.post('/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  const _id = mongoose.Types.ObjectId(id)
  const data = await sql.update(Logs, { _id }, {updateAt: new Date().getTime(), flag: 0})
  ctx.body = data
})

module.exports = router
