//DB库
const { MongoClient, ObjectID } = require('mongodb');

const Config = require('./config.js')

let client = new MongoClient(Config.dbUrl, { useUnifiedTopology: true });

class Db {

  static getInstance() {   /*1、单例  多次实例化实例不共享的问题*/

    if (!Db.instance) {
      Db.instance = new Db();
    }
    return Db.instance;
  }

  constructor() {

    this.dbClient = ''; /*属性 放db对象*/
    this.connect();   /*实例化的时候就连接数据库*/

  }

  connect() {  /*连接数据库*/
    let _that = this;
    return new Promise((resolve, reject) => {
      if (!_that.dbClient) {         /*1、解决数据库多次连接的问题*/
        client.connect((error) => {
          if (error) {
            reject(error)
            return;
          }
          console.log('数据库连接成功！！！');
          _that.dbClient = client.db(Config.dbName);
          resolve(_that.dbClient)
        })
      } else {
        resolve(_that.dbClient);
      }

    })

  }

  find(collectionName, json1, json2, json3) {
    if (arguments.length == 2) {
      var attr = {};
      var slipNum = 0;
      var pageSize = 0;

    } else if (arguments.length == 3) {
      var attr = json2;
      var slipNum = 0;
      var pageSize = 0;
    } else if (arguments.length == 4) {
      var attr = json2;
      var page = json3.page || 1;
      var pageSize = json3.pageSize || 20;
      var slipNum = (page - 1) * pageSize;
    } else {
      console.log('传入的参数错误')
    }

    return new Promise((resolve, reject) => {

      this.connect().then((db) => {

        var result = db.collection(collectionName).find(json1, attr).skip(slipNum).limit(pageSize);

        result.toArray(function (err, docs) {

          if (err) {
            reject(err);
            return;
          }
          resolve(docs);
        })

      })
    })
  }
  // 更新数据
  update(collectionName,oldJson,newJson){
    return new Promise((resolve,reject) => {
      this.connect().then((db)=> {
        db.collection(collectionName).updateOne(oldJson,{
          $set:newJson
        }, (err,result) => {
          if(err){
            reject(err);
          }else{
            resolve(result);
          }
        })
      })
    })
  }

  //新增数据
  insert(collectionName,json){
    return new Promise((resolve, reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).insertOne(json,(err,result) => {
          if(err){
            reject(err);
          }else{
            resolve(result);
          }
        })
      })
    })
  }

  // 删除数据
  remove(collectionName,json){
    return new Promise((resolve,reject) => {
      this.connect().then((db) => {
        db.collection(collectionName).removeOne(json,(err,result) => {
          if(err){
            reject(err);
          }else{
            resolve(result);
          }
        })
      })
    })
  }

  //mongodb里面查询 _id 把字符串转换成对象
  getObjectId(id){
    return new ObjectID(id);
  }
}
//测试查询数据
// let myDB = new Db();
// myDB.find("users", {}).then((data) => {
//   console.log(data)
// })

module.exports = Db.getInstance();
