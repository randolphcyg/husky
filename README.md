@[TOC](husky架构&安装步骤&开发规划&演示【Django+react+antd pro v5+echarts+weworkapi】)
![在这里插入图片描述](https://img-blog.csdnimg.cn/cover1/248658033621860363.jpg)

# 1. 架构说明
1. 主要工具
 
| 工具 | 版本 | 说明 |
|--|--|--|
| python | 3.8.5 | 支持异步、并发、多用内部方法提速 |
| django | 2.2.15 | 长期支持版本、稳定安全 |
| react | 16.13.1 | 社区支持好 |
| ant design pro | v5 | ui |
| echarts | 4.8.0 | 9月份将发布5.0版本 | 
| mysql | 5.7 | 数据持久化 | 
| redis | 3.2.100 | 缓存不太修改但常读的内容 | 

2. 辅助工具

| 辅助工具 | 版本 | 说明 |
|--|--|--|
|npm|6.14.7|最新版本|
|pip|20.2.1|安装python包|
|pipenv|2020.6.2|python虚拟环境版本管理|

3. 项目仓库

[husky](https://gitee.com/RandolphCYG/husky)
master分支现在和feature-ad分支同步了，AD域账号管理功能模块上都有；

# 2. 安装步骤
## 2.1. 配置python环境并运行Django项目(通识)
1. 安装[python3.8.5](https://www.python.org/downloads/release/python-385/)
安装很简单，参考[python3.8 下载安装 | pip 配置国内源 | python各种工具介绍](https://blog.csdn.net/qq_33997198/article/details/107420579)下载安装python部分，注意`勾选将python加到环境变量`中

2. 安装配置全局django环境：
`cmd`中执行
	```python
	# 安装指定版本django框架 若没有为pip配置全局的国内源可选择带-i http://pypi.douban.com/simple --trusted-host pypi.douban.com参数
	pip install django==2.2.15 -i http://pypi.douban.com/simple --trusted-host pypi.douban.com
	```
3. 跑项目用全局python环境
vscode跑django项目可参考
[【Youtobe trydjango】Django2.2教程和React实战系列一【项目简介 | 搭建 | 工具】](https://blog.csdn.net/qq_33997198/article/details/103972513)最后一节
## 2.2. 安装前配置好后端mysql、redis

```python
# 拉项目源码
git clone git@gitee.com:RandolphCYG/husky.git
# 打开一个终端,进入后端项目 husky_back
cd husky_back
# 执行数据库迁移语句
python manage.py makemigrations
python manage.py migrate
# 创建超级用户
python manage.py createsuperuser
# 然后会让你输入邮箱(可不输入)、密码(admin即可、强制同意)

# 修改django配置文件 ...\husky\husky_back\husky\settings.py
'default': {
    'ENGINE': 'django.db.backends.mysql',   # 数据库引擎
    'NAME': 'husky',                        # 数据库名
    'USER': 'root',                         # 用户名
    'PASSWORD': 'adqwe123',                 # 密码
    'HOST': '127.0.0.1',                    # mysql服务主机ip
    'PORT': '3306',                         # mysql服务端口
    },
    
# redis缓存服务器 ...\husky\husky_back\husky\settings.py
CACHES = {
    # 默认缓存库
    "default": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/0",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # "PASSWORD": "V%xw1xZqDK",   # 密码
        }
    },
    # 配置信息缓存库
    "configs_cache": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/1",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # "PASSWORD": "V%xw1xZqDK",   # 密码
        }
    },
    # AD域账号信息缓存库
    "ad_accounts_cache": {
        "BACKEND": "django_redis.cache.RedisCache",
        "LOCATION": "redis://127.0.0.1:6379/2",
        "OPTIONS": {
            "CLIENT_CLASS": "django_redis.client.DefaultClient",
            # "PASSWORD": "V%xw1xZqDK",   # 密码
        }
    }
}
# 然后就可以启动后端项目了

```

## 2.3. 启动前后端项目
```python
# 打开一个终端,进入后端项目 husky_back
cd husky_back
# 启动后端django项目
python manage.py runserver

# 新打开一个终端,进入前端项目 husky_front 
cd husky_front
# 下载依赖 
yarn
# 不使用mock数据启动前端项目
yarn run start:no-mock
# 从前端项目进入网页即可
```
# 3. 开发规划
 - 正在开发优化的功能
`可视化`一方面需要向上交流，另一方方面需要准备好前端的流程设计；
`企业微信`对接，需要将之前开发过的weworkapi的代码融入使用下；

 - 待开发功能

 - [ ] AD域账户管理模块——异常报错(网络原因报错细致)、异步任务前端后端一致(勿让用户等待)
 - [ ] 用户的批量管理逻辑(考虑到这个层面时候需要回头去优化单个的处理逻辑)
 - [ ] 企业微信api接入——企业微信成员加入时候填写信息，将信息与现在的AD域账户的管理模块接通，然后再通过此中枢平台的后端对接其他平台，完成其他平台账号的统一创建和管理
 - [ ] django后端restful接口改造
 - [ ] echarts后端及数据库设计准备——需要将数据存储设计好，然后才可以接着去做

 - 已完成功能
 - [x] 用户登录(LDAP)登出
`详情`LDAP和普通方式均可登录，但是需要先配置好AD域账号方可使用AD域管理相关功能
 - [x] AD域账账号查询
 `详情`将AD域的连接配置和大量的账号信息存储在redis中，当对AD域增改时才从AD服务器建立连接更新redis一次，尽可能地减少读取AD服务器的次数
AD域模块和消息通知配置存到redis；
`细节`每次读取AD账号列表时，先从redis去读，没有数据才去AD服务器去查，此时尽量所有用户所有字段都能取得到。
 - [x] AD域账号单个创建
 - [x] AD域账号创建完成邮件通知
`bug`发邮件还有一个小bug，发件人、收件人乱码(已经写了utf8)，配置成公司的邮件服务器会爆出这个bug，用腾讯邮箱没问题；
 - [x] AD域服务器配置
配置会报存在redis，目前设置的作用字段之后还可以再优化；
 - [x] 邮件服务器配置
 - [x] bug可视化前端echarts接入(前端阶段)
 - [x] `LDAP账户`支持分页模糊查询；
 
# 4. 功能演示
 - 登录(LDAP)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201006220602300.png)
 - 首页(可以换成更需要表达的组件)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201006220743836.png)
 - 配置中心——用户账户设置

 - [ ] 支持用户个人邮箱手机号和密码的修改

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201008102922903.png)
 - 配置中心——AD域服务器配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20201008102444455.png)

 - 配置中心——邮件服务器配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/202010081023139.png)


 - AD域管理——AD域账户

 - [x] 支持账号/姓名/部门字段的模糊查询
 - [x] 支持同步任务创建账号
 - [ ] 支持管理员可修改用户密码
 - [ ] 支持对架构改动的同事进行LDAP架构上的同步变动
 - [ ] 支持将离职用户禁用状态(暂时搜索不到禁用用户，搜索范围不包含此部分)
 - [ ] 支持显示用户状态 

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201006221233382.png)
6. AD域管理——AD域服务器(留空待做)
 - [ ] 支持树形显示LDAP的OU架构
 - [ ] 支持在树上对OU架构进行调整修改
 - [ ] 考虑用户和组织单位的策略的修改

![在这里插入图片描述](https://img-blog.csdnimg.cn/20201006221303792.png)
7. bug可视化(前端暂)
 - [ ] 支持对数据的多级可视化展示和查询、根据框选数据生成可视化图表

![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105652438.png)
8. 可视化图表(待完善)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105733688.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105806718.png)
