const router = require('koa-router')()
const fs = require('fs')
const path = require('path')
// 找到数据库封装文件
const sql = require('../sql/index')

router.get('/', async (ctx, next) => {
  await ctx.render('index', {
    title: 'Hello Koa 2!'
  })
})

router.post('/queryBean', async (ctx, next) => {
  console.log(ctx.request.body);
  // const typeName = ctx.request.body.typeName
  // const data = await sql.find(typeName, {})
  // ctx.body = data
})

router.get('/removeBean', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.get('/updateBean', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

router.get('/addBean', async (ctx, next) => {
  ctx.body = {
    title: 'koa2 json'
  }
})

module.exports = router
