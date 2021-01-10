const jwt = require('jsonwebtoken');
const serect = 'token';  //密钥，不能丢
const addtoken = (userinfo) => { //创建token并导出
  const token = jwt.sign({
    user: userinfo.user,
    id: userinfo.id
  }, serect, {expiresIn: '12h'});
  return token;
};

const proving = (tokens) => {
  if (tokens){
    let toke = tokens;
    // 解析
    let decoded = jwt.decode(toke, serect);
    return decoded;
  }
};

module.exports = {
  addtoken,
  proving
}
