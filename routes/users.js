const router = require('koa-router')()
const mongoose = require('mongoose');
const { addtoken, proving } = require('../module/token');

// 找到用户集合
const User = require('../sql/collection/users')
// 找到数据库封装文件
const sql = require('../sql/index')

router.prefix('/user')

// 登录
router.post('/login', async (ctx, next) => {
  const { username, password } = ctx.request.body
  const data = await sql.findOne(User, {username})
  if (data) {
    if (data.password === password) {
      let tk = addtoken({user: data.username, id: data._id})
      ctx.body = {
        msg: '登录成功',
        token: tk,
        userinfo: data,
        retCode: 0
      }
    } else {
      ctx.body = {
        msg: '密码错误',
        retCode: 1
      }
    }
  } else {
    ctx.body = {
      msg: '用户不存在',
      retCode: 1
    }
  }
})

// 获取用户信息
router.get('/info', async (ctx, next) => {
  console.log(ctx.query._id);
  const _id = mongoose.Types.ObjectId(ctx.query._id)
  const data = await sql.findOne(User, {_id})
  if (data) {
    ctx.body = {
      userinfo: data,
      retCode: 0
    }
  } else {
    ctx.body = {
      msg: '登录失效',
      retCode: 404
    }
  }
})

// 退出
router.post('/logout', async (ctx, next) => {
  ctx.body = {
    msg: '退出登录',
    retCode: 0
  }
})

// 列表查询
router.post('/list', async (ctx, next) => {
  const {condition, showObj, pageSize, page, sort} = ctx.request.body
  const data = await sql.paging(User, condition, showObj, pageSize, page, sort)
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
  const username = await sql.findOne(User, {username: params.username})
  if (username) {
    ctx.body = {
      msg: '账户已存在',
      retCode: 1
    }
    return
  }
  const tel = await sql.findOne(User, {tel: params.tel})
  if (tel) {
    ctx.body = {
      msg: '手机号码已存在',
      retCode: 1
    }
    return
  }
  const data = await sql.insert(User, params)
  ctx.body = data
})

// 修改
router.post('/edit', async (ctx, next) => {
  const params = ctx.request.body
  const _id = mongoose.Types.ObjectId(params._id);
  const username = await sql.findOne(User, {_id: { $ne: _id }, username: params.username})
  if (username) {
    ctx.body = {
      msg: '账户已存在',
      retCode: 1
    }
    return
  }
  const tel = await sql.findOne(User, {_id: { $ne: _id }, tel: params.tel})
  if (tel) {
    ctx.body = {
      msg: '手机号码已存在',
      retCode: 1
    }
    return
  }

  const data = await sql.update(User, { _id: _id }, {update_at: new Date().getTime(), ...params})
  ctx.body = data
})

// 删除
router.post('/delete', async (ctx, next) => {
  const { id } = ctx.request.body
  const _id = mongoose.Types.ObjectId(id)
  const data = await sql.update(User, { _id }, {updateAt: new Date().getTime(), flag: 0})
  ctx.body = data
})

module.exports = router
