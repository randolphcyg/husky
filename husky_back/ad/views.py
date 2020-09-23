from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connections
import json
from ldap3 import (ALL, ALL_ATTRIBUTES, MODIFY_REPLACE, NTLM, SASL, SIMPLE,
                   SUBTREE, SYNC, Connection, Server)
import winrm
from django.conf import settings
# from django.conf.settings import AD_IP, AD_ADMIN, AD_ADMIN_PWD, USER_SEARCH_FILTER, ENABLED_BASE_DN

# Create your views here.


@csrf_exempt
def accessADServer() -> object:
    '''连接生产AD域服务器，返回连接对象
    '''
    SERVER = Server(host=settings.AD_IP,
                    port=636,               # 636安全端口
                    use_ssl=True,
                    get_info=ALL,
                    connect_timeout=3)      # 连接超时为3秒
    try:
        conn = Connection(
            server=SERVER,
            user=settings.AD_ADMIN,
            password=settings.AD_ADMIN_PWD,
            auto_bind=True,
            read_only=False,                # 禁止修改数据True
            receive_timeout=10)             # 10秒内没返回消息则触发超时异常
        print("distinguishedName:%s res: %s" % (settings.AD_ADMIN, conn.bind()))
        return conn
    except BaseException as e:
        print(e)
        print("AD域连接失败，请检查IP/账户/密码")
    finally:
        conn.closed


@csrf_exempt
def fetchADUserList(request) -> json:
    '''查询AD域的用户列表,页数由前端传参,之后改成分页类型的
    '''
    if request.method == 'GET':
        # 连接AD域
        conn = accessADServer()
        # 查询AD服务器
        attr = ['sAMAccountName',
                'displayName',
                'distinguishedName',
                'mail',
                'telephoneNumber',
                'title',
                # 'whenCreated',
                ]
        entry_list = conn.extend.standard.paged_search(
            search_filter=settings.USER_SEARCH_FILTER,
            search_base=settings.ENABLED_BASE_DN,
            search_scope=SUBTREE,
            attributes=attr,
            paged_size=100,
            generator=False)        # 关闭生成器，结果为列表
        # 处理查询结果
        body = list()
        for user in entry_list:
            body.append(
                {
                    'sam': user['attributes']['sAMAccountName'],
                    'name': user['attributes']['displayName'],
                    'department': '/'.join([x.replace('OU=', '') for x in user['attributes']['distinguishedName'].split(',', 1)[1].rsplit(',', 2)[0].split(',')][::-1]), 
                    'email': user['attributes']['mail'],
                    'telphone': user['attributes']['telephoneNumber'],
                    'title': user['attributes']['title'],
                }
            )
        # 组装返回结果
        res = {
            'code': 0,
            'message': '成功',
            'body': body
        }
        return JsonResponse(res)


@csrf_exempt
def addADUser(request):
    '''新建AD域用户
    '''
    if request.method == 'PUT':
        data_req = json.loads(request.body)
        # 接受前端请求数据
        sam = data_req.get('sam')
        name = data_req.get('name')
        department = data_req.get('department')
        email = data_req.get('email')
        telphone = data_req.get('telphone')
        title = data_req.get('title')
        # 创建用户时组装的对象格式
        # user_attr = {'sAMAccountname': sam,      # 登录名
        #              'userAccountControl': 544,  # 启用账户
        #              'title': title,             # 头衔
        #              'givenName': name[0:1],     # 姓
        #              'sn': name[1:],             # 名
        #              'displayname': name,        # 姓名
        #              'mail': email,              # 邮箱
        #              'telephoneNumber': telphone,     # 电话号
        #              }
