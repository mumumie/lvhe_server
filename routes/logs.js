const router = require('koa-router')()
const mongoose = require('mongoose')

// 找到用户集合
const Logs = require('../sql/collection/logs')
// 找到数据库封装文件
const sql = require('../sql/index')

router.prefix('/logs')

// 列表查询
router.post('/list', async (ctx, next) => {
  const {condition: {username}, showObj, pageSize, page, sort} = ctx.request.body
  const data = await sql.paging(Logs, {username: {$regex: username}}, null, pageSize, page, sort)
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

// 删除
router.post('/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  const _id = mongoose.Types.ObjectId(id)
  const data = await sql.update(User, { _id }, {updateAt: new Date().getTime(), flag: 0})
  ctx.body = data
})

module.exports = router
