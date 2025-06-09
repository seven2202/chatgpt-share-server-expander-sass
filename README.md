## 功能介绍
#### 同时支持ChatGPT、claude、grok镜像站
#### 支持api绘图，官方接口，可接中转。
#### 支持多种站内支付（虎皮椒、易支付、当面付、蓝兔、微信native、usdt等等）
#### 支持卡密购买、兑换
#### 支持暗黑模式、4种多语言。
#### 支持游客模式：免登陆就能使用
#### 支持邀请返现功能
#### 支持独享车功能
#### 用户数据统计
#### 支持各种虚拟车
#### 支持优惠券功能
#### 用户模型速率独立限制
#### 用户对话隔离
#### 用户签到功能
#### 内容审核
#### 代理功能，代理可以自己用域名反代主站，可以用代理账号密码登录sass后台进行套餐、公告信息维护和代理推广用户数据查看，支持自定义logo、站点名称。
更多功能以演示站为主
## 前台界面截图
![image](https://github.com/user-attachments/assets/5742a907-3014-4edf-84ae-fb58a6d29629)

![image](https://github.com/user-attachments/assets/8b14b018-179e-423d-8d38-7433cc18f96f)

![image](https://github.com/user-attachments/assets/f8b95e02-4c4e-4659-915a-5862d8fb177f)

![image](https://github.com/user-attachments/assets/52857987-6830-425d-be6b-dc5d030e769a)

![image](https://github.com/user-attachments/assets/bc76694c-6809-4547-bfa5-838923d6dcee)

![image](https://github.com/user-attachments/assets/baaf210d-5456-4725-b4b2-46ec37348cb6)

![image](https://github.com/user-attachments/assets/43ae8b4e-8048-4399-9713-3e07edcc47d5)

![image](https://github.com/user-attachments/assets/ec5c723b-77bd-4843-9ce7-a942aa9b1ce6)

![image](https://github.com/user-attachments/assets/5c77efc0-3d9f-482a-abef-63b48949c10b)

![image](https://github.com/user-attachments/assets/01c15b48-eab5-492d-aac7-77a024c1d4d6)

![image](https://github.com/user-attachments/assets/837ec94f-41c4-4fd3-bfc0-dee38735236f)

![image](https://github.com/user-attachments/assets/eef23ab0-ff20-4a60-8203-ba8870b74662)

![image](https://github.com/user-attachments/assets/e45cce80-9a88-49af-be13-e4179aae65ff)

![image](https://github.com/user-attachments/assets/a9d2121b-5e8a-40fc-a61c-236dd7c4bb2d)

![image](https://github.com/user-attachments/assets/50dda842-98fb-43d7-9d8d-6e379ccfeca9)

![image](https://github.com/user-attachments/assets/87b66cec-6746-4c5e-ba10-4f0bfb6d4504)

![image](https://github.com/user-attachments/assets/05c080b6-e449-4244-b456-5f26824df515)

![image](https://github.com/user-attachments/assets/453ef176-7fe2-45c5-927f-4a2db540f9f3)

![image](https://github.com/user-attachments/assets/ff003e2c-027f-4f1e-8d09-d64a739adfb0)

## 后台（懒得截了）

## 演示站
#### sass主站前台:sass.fllai.cn
#### sass后台:sass.fllai.cn/expander
#### 代理站前台1:tenant.fllai.cn
#### 代理站前台2:tenant2.fllai.cn
#### 管理员admin/123456
#### 代理1：tenant/123456
#### 代理2：tenant2/123456
### 准备工作
- 服务器：2h4g 起步，本文档以 ubutun24 全新环境为例
- 准备一个域名：解析出3个二级域名。
- 准备一个 gpt 网关

### 开始一键部署
```
curl -sSfL https://raw.githubusercontent.com/seven2202/chatgpt-share-server-expander-sass/refs/heads/main/quick-install.sh | bash
```
输入3个二级域名，如：
- gpt.xxx.com
- kld.xxx.com
- grok.xxx.com

接着提示输入gpt网关，输入带https协议的网关地址，如：https://gateway.xxx.com，如无请联系我。
输入完成后，需要输入“y”。会拉取expander-sass镜像，完成部署。

### 授权流程
本授权采用离线方式
访问自己的gpt域名/client-api/license，例如测试站：https://sass.fllai.cn/client-api/license
![image](https://github.com/user-attachments/assets/8aa3d3e2-2c2a-4bf9-ab87-85140d44bfa3)

复制唯一hash值，发送给管理员，管理员将根据你需要的权限和时长生成一个授权码。
授权码填写到后台-》平台管理-》系统设置-》授权管理中。
![image](https://github.com/user-attachments/assets/aee66709-cdea-453b-9939-e8dbd587d6f6)

## 联系
![image](https://github.com/user-attachments/assets/6708cc68-801f-416a-ba7b-687dc4c8e244)


