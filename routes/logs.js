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
    {
      $group: {
        _id: null,
        list: {
          $push:"$$ROOT"
        },
        total: {$sum: 1}
      }
    },
    {
      $skip: page - 1
    },
    {
      $limit: pageSize
    }
  ]
  if (condition) {
    params.unshift({
      $match: condition
    })
  }

  const data = await Logs.aggregate(params)
  if (data) {
    ctx.body = {
      ...data[0],
      retCode: 0
    }
  } else {
    ctx.body = {
      msg: '暂无数据',
      retCode: 1
    }
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
