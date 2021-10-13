# 用户身份认证平台(AD域-LDAP管理)[python版本]说明文档

-----

> 最后更新时间 2021/9

## 1. 背景

### 1.1. 发展阶段

- 最初目标：单位很多平台都需要账号，人多平台多就会难记住、难管理，因而需要统一为一个账号；因为LDAP是较为通用的认证协议，因此通过选型，装上了Windows Active Directory Domain 即AD域服务；(这时候未考虑管理成本、只求有)；
- 初具规模：但是Windows Server中的管理端实在难以满足对流动性高、人员组成复杂的单位进行手动管理，因而需要快速开发出管理平台；(这时候不在乎架构、只求快)；
- 完善流程：当一件不是特别有意义的事情占据越来越多的时间，当那个又要做管理员又要开发东西的人心累的时候，不得不考虑后路，不得不审视自己的能力，不得不进行重构和完善整合企业管理的其他工具；(例如企业微信)

### 1.2. 开发阶段

1. 最开始的全体用户的LDAP信息初始化用的`powershell`脚本，将当时所有的用户信息整理到文件，批量生成有组织的用户，并保存复杂密码；账号和密码下发是写的`python`脚本；
2. 后面突然发现自己为什么要写psl脚本，于是找到py的`ldap3`包，完完整整的把各种api安排了一遍；
3. 再来发现执行脚本也很累哦，能不能有个前端，这样增改查都能方便很多，然后选型了前端框架`antd pro v5`，写了前端；
4. 后面前端写熟悉了，发现不能总在自己机器跑，于是考虑部署方案，从在centos7机器部署到docker、k8s都部署了一遍，然后将前后端打两个镜像部署上去了；
5. 紧接着是完善迭代——web平台的登录登出、AD域、消息通知模块的可配置可测试；企业微信的接入，开始做自动化工单，并加了一些`celery`定时任务；
6. 因为这个`python`版本硬编码比较多、且在用redis作缓存的时候，都只是大str存储、且心烦于python的依赖和发版速度之慢，并不想像另一个项目一样docker打一个基础的镜像，而是决定用`Golang`重构。当满足现有管理需求后，发现可以舍弃前端，只保留后端服务就足够了，于是这篇博客主要记录下弃用的antd pro+python的版本的前后端和部分页面。

## 2. 架构说明
1. 主要工具

| 工具 | 版本 | 说明 |
|--|--|--|
| python | 3.6 | windows [python3.6.8](https://www.python.org/ftp/python/3.6.8/python-3.6.8-amd64.exe) \| MAC/Linux [python3.6.12](https://www.python.org/downloads/release/python-3612/) |
| [django](https://www.djangoproject.com/download/) | 2.2.15 |  web后端框架 |
| [react](https://react.docschina.org/docs/getting-started.html) | 16.13.1 |  前端框架(spa应用) |
| [ant design pro](https://pro.ant.design/index-cn) | v5 | 组件式ui库(阿里) |
| mysql | 5.7 | 数据持久化 |
| redis | 3.2.100 | [数据库、缓存和消息中间件](http://www.redis.cn/) ； 用来作为celery的消息队列，替代中间件为rabbitMQ |
| [celery](http://docs.jinkan.org/docs/celery/) | 4.4.7 | 分布式任务队列，提供异步和定时任务支持 在django配置好celery后生成数据库表  |
| eventlet | 0.28.0 | 对celery的并发支持补充(husky目录下) `celery -A husky worker -l info -P eventlet -E` 异步任务 |
| django-celery-beat | 2.0.0 | celery的定时/周期任务支持(husky目录下) `celery -A husky beat -l info` |
| [ldap3](https://ldap3.readthedocs.io/en/latest/) | 2.8.1 | 用来管理LDAP服务器 |

2. 辅助工具

| 辅助工具 | 版本 | 说明 |
|--|--|--|
|npm|6.14.7|最新版本|
|pip|20.2.1|安装python包|
|pipenv|2020.6.2|python虚拟环境版本管理|

`注意1`——celery需要配python3.6，因为高版本的python中异步`aync`关键词会和celery中的`kombu`库中的定义的变量冲突！
`注意2`——celery在windows中应该由`eventlet`处理异步并发任务

`部署中在centos中需要注意python3.6.12，然后celery不需要eventlet也可以支持异步并发`

3. 项目仓库

后端仓库：[husky-back](https://github.com/RandolphCYG/husky-back) 

前端仓库：husky-front](https://github.com/RandolphCYG/husky-front) 

## 3. 开发环境安装步骤

### 3.1. 后端环境(vscode)

1. 开发环境安装[python3.8.5](https://www.python.org/downloads/release/python-385/)
安装很简单，参考[python3.8 下载安装 | pip 配置国内源 | python各种工具介绍](https://blog.csdn.net/qq_33997198/article/details/107420579)下载安装python部分，注意`勾选将python加到环境变量`中

2. 安装后端项目依赖

	```python
	# 拉项目源码
	git clone git@github.com:RandolphCYG/husky-back.git
	# 进入项目目录
	cd /husky-back/husky
	# 升级pip
	python -m pip install --upgrade pip
	# 安装后端项目依赖 若没有为pip配置全局的国内源可选择带-i http://pypi.douban.com/simple --trusted-host pypi.douban.com参数
	pip install -r requirements.txt -i http://pypi.douban.com/simple --trusted-host pypi.douban.com
	```
3. 跑项目用全局python环境
vscode跑django项目可参考
[【Youtobe trydjango】Django2.2教程和React实战系列一【项目简介 | 搭建 | 工具】](https://blog.csdn.net/qq_33997198/article/details/103972513)最后一节
### 3.2. 安装前配置好后端mysql、redis

```python

# 打开一个终端,进入后端项目 husky
cd /husky-back/husky
# 执行数据库迁移语句
python manage.py makemigrations
python manage.py migrate
# 创建超级用户
python manage.py createsuperuser
# 然后会让你输入邮箱(可不输入)、密码(admin即可、强制同意)

# 修改django配置文件 ...\husky-back\husky\husky\settings.py
'default': {
    'ENGINE': 'django.db.backends.mysql',   # 数据库引擎
    'NAME': 'husky',                        # 数据库名
    'USER': 'root',                         # 用户名
    'PASSWORD': 'adqwe123',                 # 密码
    'HOST': '127.0.0.1',                    # mysql服务主机ip
    'PORT': '3306',                         # mysql服务端口
    },
    
# redis缓存服务器 ...\husky-back\husky\husky\settings.py
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
# 然后就可以启动后端项目

```

### 3.3. 前端环境
```python
# 安装nodejs np yarn
略
# 进入项目目录
cd /husky-front
# 下载前端依赖
yarn
# 等待完成后可以启动前端项目
```

### 3.4. 启动项目

后端:

```python
# 打开一个终端,进入后端项目 husky
cd /husky-back/husky
# 启动后端django项目
python manage.py runserver 0.0.0.0:3033
```
前端：

```python
# 拉项目源码
git clone git@github.com:RandolphCYG/husky-front.git
# 进入项目目录
cd /husky-front
# 不使用mock数据启动前端项目
yarn run start:no-mock
# 从前端项目进入网页即可(根据实际启动项目端口为准)
http://localhost:8001
```
## 4. 生产部署

找一台装有`docker`的`centos7`打镜像并推送到远程仓库

### 4.1. 前端
```python
# 进入项目目录
cd /husky-front
# 打包前端项目
yarn build
# 用xhsell的sftp将除去node-module文件夹下的前端项目文件同步到centos7虚拟机

# centos7打nginx镜像【改】 
docker build -f Dockerfile -t local/husky:0.0.1 .
# 改标签【改】 
docker tag local/husky:0.0.1 xxxxx/husky:0.0.1
# 登录远程仓库【改】 
docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD} ${DOCKER_REGISTRY}
# 将镜像推到远程仓库【改】 
docker push xxxxx/husky:0.0.1
# 执行k8s命令【改】 
kubectl apply -f Deployment.yaml -n husky
kubectl apply -f Service.yaml -n husky
```

### 4.2后端

```python
# 与前端项目除了打包不同，其他相同
@@@@下一步需要些gitlab-ci，达成一键打包前端项目、打前后端镜像并推送的过程@@@
```

## 5. 功能演示
 - 登录

![](https://oscimg.oschina.net/oscnet/up-b718da46494879d4a6c5f2bd99506e032e4.png)
 - 首页dashboard

![](https://oscimg.oschina.net/oscnet/up-e365dc97de5f73dfbd7922f66aa9daadd69.png)
 - 个人中心

![](https://oscimg.oschina.net/oscnet/up-500989f53da4301805f38f4b0f69623f9a4.png)

 - 配置中心——AD域服务器配置

![](https://oscimg.oschina.net/oscnet/up-1f745893ca3c251a3546423f803f0f31d54.png)

 - 配置中心——邮件服务器配置

![](https://oscimg.oschina.net/oscnet/up-ff05f2ed66170bbf633af782e13f2ffbfb5.png)

 - AD域管理——AD域账户

![](https://oscimg.oschina.net/oscnet/up-1cb584e92b62979e2927e4fce1ec9679d23.png)

## 6. 常见报错处理
### 6.1. Ran out of input
celery的beat运行不起来报错时，需要删除不一致`husky`中的`celerybeat-schedule`几个文件；

## 7. 参考文章

 1. [Django项目使用Celery](https://zhuanlan.zhihu.com/p/162039762)
