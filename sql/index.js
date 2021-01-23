module.exports = {
  // 数据库集合靠函数去传递
  insert (CollectionName, insertData) {
    return new Promise((resolve, reject) => {
      CollectionName.insertMany(insertData, (err, data) => {
        if (err)  reject({retCode: 1, msg: JSON.stringify(err)});
        resolve({
          data,
          retCode: 0
        })
      })
    })
  },
  // 删除操作封装
  delete (CollectionName, deleteData, deleteType) {
    // User.deleteOne(deleteData, (err) => {})
    // User.deleteMany(deleteData, (err) => {})

    // style.display = "none"   <===>  style['display'] = "none"
    // style.animation = "test" 兼容性
    // 对象后的属性不可以是变量，如果有变量，写成 对象[属性] 形式

    deleteType = deleteType || 'deleteOne' // 默认为删除单条数据

    return new Promise((resolve, reject) => {
      CollectionName[deleteType](deleteData, (err) => {
        if (err) reject({retCode: 1, msg: JSON.stringify(err)});
        resolve({ retCode: 0 })
      })
    })
  },
  // 更新操作封装
  update (CollectionName, whereObj, updateObj, updateType) {
    updateType = updateType || 'updateOne'
    return new Promise((resolve, reject) => {
      CollectionName[updateType](whereObj, updateObj, (err) => {
        if (err) reject({retCode: 1, msg: JSON.stringify(err)});
        resolve({ retCode: 0 })
      })
    })
  },
  // 查询操作封装
  find (CollectionName, whereObj, showObj= {flag: 0}) {
    return new Promise((resolve, reject) => {
      CollectionName.find(whereObj, showObj).exec((err, data) => {
        if (err) throw err;
        resolve(data)
      })
    })
  },
  // 查询单个
  findOne (CollectionName, whereObj, showObj) {
    return new Promise((resolve, reject) => {
      CollectionName.findOne(whereObj, showObj).exec((err, data) => {
        if (err) {
          reject({retCode: 1, msg: JSON.stringify(err)})
        } else {
          resolve(data)
        }

      })

    })
  },
  // 分页查询操作
  paging (CollectionName, whereObj, showObj, pageSize, page, sort = {create_at: -1}) {
    return new Promise(async (resolve, reject) => {
      // limit(pageSize) 每页显示个数
      // skip(page * pageSize) // 每页从哪一个开始
      const totalNum = await CollectionName.find(whereObj, showObj).countDocuments()

      CollectionName.find({flag: 1,...whereObj}, showObj).limit(pageSize).skip((page - 1) * pageSize).sort(sort).exec((err, data) => {
        if (err) {
          reject({
            status: 400,
            msg: JSON.stringify(err)
          })
        }
        resolve({
          list: data,
          totalNum: totalNum
        })
      })
    })


  },
  // 按照分类查询数据
  distinct(CollectionName, name) {
    return new Promise((resolve, reject) => {
      CollectionName.distinct(name).exec((err, data) => {
        if (err) throw err;
        resolve(data)
      })
    })
  }
}
