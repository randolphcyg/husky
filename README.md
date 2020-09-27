# husky账号中枢和可视化平台
[husky架构说明&安装步骤&开发规划&功能演示](https://blog.csdn.net/qq_33997198/article/details/107937956)

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
| echarts | 3.2.100 | 缓存不太修改但常读的内容 | 

2. 辅助工具

| 辅助工具 | 版本 | 说明 |
|--|--|--|
|npm|6.14.7|最新版本|
|pip|20.2.1|安装python包|
|pipenv|2020.6.2|python虚拟环境版本管理|

3. 项目仓库

[husky](https://gitee.com/RandolphCYG/husky)
master分支只加入bug可视化的内容，正常管理bug可视化的代码提交到此分支;
feature-ad分支将重点放在AD域账号管理功能模块上；

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

# 修改django配置文件...\husky\husky_back\husky\settings.py
'default': {
    'ENGINE': 'django.db.backends.mysql',   # 数据库引擎
    'NAME': 'husky',                        # 数据库名
    'USER': 'root',                         # 用户名
    'PASSWORD': 'adqwe123',                 # 密码
    'HOST': '127.0.0.1',                    # mysql服务主机ip
    'PORT': '3306',                         # mysql服务端口
    },
# redis的还没加进去，加好之后会补充配置

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
1. 未完成功能

AD域模块优化——将AD域的连接配置和大量的账号信息存储在redis中，当对AD域增改时才从AD服务器建立连接更新redis一次，尽可能地减少读取AD服务器的次数
AD域模块和消息通知配置存到redis


2. 待开发功能


 - [ ] AD域账户管理模块——异常报错(网络原因报错细致)、异步任务前端后端一致(勿让用户等待)
 - [ ] 用户的批量管理逻辑(考虑到这个层面时候需要回头去优化单个的处理逻辑)
 - [ ] 企业微信api接入——企业微信成员加入时候填写信息，将信息与现在的AD域账户的管理模块接通，然后再通过此中枢平台的后端对接其他平台，完成其他平台账号的统一创建和管理
 - [ ] django后端restful接口改造
 - [ ] echarts后端及数据库设计准备——需要将数据存储设计好，然后才可以接着去做

3. 已完成功能
 - [ ] 登录登出
 - [ ] AD域账账号查询
 - [ ] AD域账号单个创建
 - [ ] AD域账号创建完成邮件通知
 - [ ] AD域服务器配置前端
 - [ ] 邮件服务器配置前端
 - [ ] bug可视化前端echarts接入(mock阶段)
 
# 4. 功能演示
1. 登录
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105223766.png)
2. AD域管理——AD域服务器配置
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105542412.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzMzOTk3MTk4,size_16,color_FFFFFF,t_70#pic_center)

3. AD域管理——AD域账号
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105434430.png)
4. bug可视化(前端暂)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105652438.png)
5. 可视化图表(前端)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105733688.png)
![在这里插入图片描述](https://img-blog.csdnimg.cn/20200927105806718.png)