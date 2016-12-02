## 服务
### 服务的布署
地址：localhost:2800 (本机) service.alinq.cn （服务器）

### 测试数据
赤兔商城

* appId: 583ea7d7426fb47071984deb

* appToken:583ea7d7426fb47071984deb

* username: 18502146746

* password: 1

### 数据格式
除了 get 请求，其它请求的格式一律使用 JSON 格式

<h4/>

## 应用管理模块
### 添加应用
application/add
#### 请求类型
post
#### 参数
* name: string
* openRegister: boolean
#### 返回
`
{ code:'success' }
`

### 删除应用
application/delete
#### 参数
* id: string 应用的 id

# User Auth 服务

所有接口的调用，在提交参数时，URL 都需要带有 appId 和 appToken 这两个参数。

* appId
* appToken

<hr/>

## 用户管理模块

### 用户注册
user/register
#### 请求类型
post
#### 参数
应用设置为手机注册：
```
{
    smsId: string,
    verifyCode: string,
    user: {
        mobile: string,
        password: string
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
<h4/>


