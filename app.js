const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

const index = require('./routes/index')
const users = require('./routes/users')
const customer = require('./routes/customer')
const logs = require('./routes/logs')
const { proving } = require('./module/token')

require('./sql/db.js')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()


  if (ctx.url !== '/user/login') {
    let token = ctx.request.header.authorization;
    if (token){
      //  获取到token
      let res = proving(token)
      if (!res) {
        ctx.body = {
          msg: 'token失效',
          retCode: 2
        };
      } else if (res && res.exp <= new Date()/1000) {
        ctx.body = {
          msg: 'token过期',
          retCode: 2
        };
      } else {
        await next()
      }
    } else{  // 没有取到token
      ctx.body = {
        msg: '没有token',
        retCode: 2
      }
    }
  } else {
    await next()
  }
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(customer.routes(), customer.allowedMethods())
app.use(logs.routes(), logs.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
