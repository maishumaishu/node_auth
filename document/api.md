### 应用
#### 添加应用
application/add
#### 参数
* name: string
* openRegister: boolean
#### 返回
`
{ code:'success' }
`
<hr/>

### 删除应用
application/delete
#### 参数
* id: string 应用的 id

# User Auth 服务

所有接口的调用，在提交参数时，URL 都需要带有 appId 和 appToken 这两个参数。

* appId
* appToken

例如：

##  用户端服务

服务地址：http://localhost:2014/userServices

### 用户注册
user/register
#### 类型
post
#### 参数
应用设置为手机注册：
```
{
    user: {
        mobile: string,
        password: string,
        smsId: string,
        verifyCode: string
    }
}
```
应用设置为用户名注册：
```
{
    user: {
        username: string,
        password: string
    }
}
```
#### 返回值
`{ token: string }`

### 用户登录
user/login
#### 类型
post
#### 参数
```
{
    username: string,
    password: string
}
```
#### 返回值
`
{ token: string}
`

### 验证码发送
sms/sendVerifyCode
#### 类型
post
#### 参数
```
{
    mobile: string,
    type: 'register' | 'receivePassword'
}
```
#### 返回值
`
{
    smsId: string
}
`



