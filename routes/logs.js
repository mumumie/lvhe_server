const router = require('koa-router')()
const mongoose = require('mongoose')

// 找到用户集合
const Logs = require('../sql/collection/logs')
// 找到数据库封装文件
const sql = require('../sql/index')

router.prefix('/logs')

// 列表查询
router.post('/list', async (ctx, next) => {
  const { condition, showObj, pageSize, page, sort } = ctx.request.body
  const params = [
    {
      $lookup: {
        from: "users",
        localField: "user_id",
        foreignField: "user_id",
        as: "user_info"
      }
    },
    {
      $lookup: {
        from: "customers",
        localField: "customer_id",
        foreignField: "customer_id",
        as: "customer_info"
      }
    },
    { $skip: page - 1 },
    { $limit: pageSize }
  ]
  let whereObj = {}
  if (condition) {
    params.unshift({ $match: condition })
    whereObj = condition
  }
  const totalNum = await Logs.find(whereObj, {}).countDocuments()
  const data = await Logs.aggregate(params)
  if (data) {
    ctx.body = {
      list: data,
      total: totalNum,
      retCode: 0
    }
  } else {
    ctx.body = {
      msg: '暂无数据',
      retCode: 1
    }
  }
})

// 查询月新增人数
router.post('/monthCustomer', async (ctx, next) => {
  const { type, date } = ctx.request.body
  const params = [
    {
      $match: {
        "type": type
      }
    },
    {
      $project : {
        day : { $substr: [{"$add":["$insert_date", 28800000]}, 0, 10] },//时区数据校准，8小时换算成毫秒数为8*60*60*1000=288000后分割成YYYY-MM-DD日期格式便于分组
        "recharge_sum": 1 //设置原有price字段可用，用于计算总价
      },
    },
    {
      $group: {
        _id: "$day", //将_id设置为day数据
        totalPrice:{ $sum: "$recharge_sum"}, //统计price
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
  const data = await sql.update(User, { _id }, {updateAt: new Date().getTime(), flag: 0})
  ctx.body = data
})

module.exports = router
