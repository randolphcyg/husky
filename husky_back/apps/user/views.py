import json

from apps.ad.views import access_ad_server, get_redis_connection
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from ldap3 import (ALL, ALL_ATTRIBUTES, MODIFY_REPLACE, NTLM, SASL, SIMPLE,
                   SUBTREE, SYNC, Connection, Server)

# Create your views here.


@csrf_exempt
def save_account_config(request):
    res = {'code': 0,
           'status': 'ok',
           'message': '修改用户信息成功!',
           }
    return JsonResponse(res)


@csrf_exempt
def load_account_config(request):
    res = {'code': 0,
           'status': 'ok',
           'message': '获取用户信息成功!',
           'data': {},
           }
    return JsonResponse(res)


@csrf_exempt
def login_view(request):
    '''登录方法，接收前端的用户名密码登录方式，用户名密码用来匹配数据库中的用户，使后端登录
    '''
    if request.method == 'POST':
        req_data = json.loads(request.body)
        username = req_data.get('username')
        password = req_data.get('password')
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)        # 后端登录
            res = {'code': 0,
                   'status': 'ok',
                   'message': 'account用户登录成功!',
                   }
        else:       # 数据库校验失败
            res = {'code': -1,
                   'status': 'error',
                   'message': '用户账号密码错误!', }
        return JsonResponse(res)
    else:       # 请求出问题
        res = {'code': -1,
               'status': 'error',
               'message': 'account用户登录失败!',
               }
        return JsonResponse(res)


@csrf_exempt
def current_user(request):
    '''获取当前登录用户信息
    '''
    if request.method == 'POST':
        # 前端传值
        ldap = str(request.body, 'utf8')        # ldap dn账号
        if ldap:
            # 从redis读取AD配置
            conn_redis = get_redis_connection("configs_cache")
            str_data = conn_redis.get('AdServerConfig')
            json_data = json.loads(str_data)
            baseDn = json_data['baseDn']
            # 连接LDAP服务器获取用户信息
            conn_ad = access_ad_server()
            if not conn_ad:
                res = {'code': -1,
                       'message': 'LDAP服务器连接失败!',
                       'status': 'error',
                       }
                return JsonResponse(res)
            else:
                res = conn_ad.search(
                    search_base=baseDn,
                    search_filter='(sAMAccountName={})'.format(ldap),
                    search_scope=SUBTREE,
                    attributes=['*'],        # ['cn', 'givenName', 'mail', 'sAMAccountName']
                    paged_size=5
                )
                # 如果有此用户
                if res:
                    entry = conn_ad.response[0]
                    if 'attributes' in entry.keys():
                        attr_dict = entry['attributes']
                        given_name = attr_dict['givenName']         # 姓氏
                        mail = attr_dict['mail']        # 邮箱
                        sn = attr_dict['sn']        # 名字
                        title = attr_dict['title']      # 职位
                        distinguishedName = attr_dict['distinguishedName']      # DN
                        telephoneNumber = attr_dict['telephoneNumber']      # 手机号码
                        sAMAccountName = attr_dict['sAMAccountName']
                        res = {
                            'name': given_name + sn,
                            'avatar': 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
                            'userid': sAMAccountName,
                            'email': mail,
                            'title': title,
                            'access': 'admin',          # 权限角色
                            'group': distinguishedName,
                            'phone': telephoneNumber,
                            'signature': '海纳百川，有容乃大',
                            'tags': [
                                {'key': '0',
                                 'label': '很有想法的',
                                 },
                                {'key': '1',
                                 'label': '专注设计',
                                 },
                                {'key': '2',
                                 'label': 'adafaf',
                                 },
                                {'key': '3',
                                 'label': 'dsfgfdsh',
                                 },
                                {'key': '4',
                                 'label': 'ghfjh',
                                 },
                                {'key': '5',
                                 'label': '海纳百川',
                                 },
                            ],
                            'notifyCount': 12,
                            'unreadCount': 11,
                            'country': 'China',
                            'geographic': {
                                'province': {
                                    'label': '江苏省',
                                    'key': '330000',
                                },
                                'city': {
                                    'label': '徐州市',
                                    'key': '330100',
                                },
                            },
                            'address': '江苏省徐州市',
                        }
                        return JsonResponse(res)
                    else:
                        res = dict()
                        return JsonResponse(res)
        else:
            res = {
                'name': 'admin',
                'avatar': 'https://gw.alipayobjects.com/zos/antfincdn/XAosXuNZyF/BiazfanxmamNRoxxVxka.png',
                'userid': '00000001',
                'email': 'antdesign@alipay.com',
                'signature': '海纳百川，有容乃大',
                'title': '交互专家',
                'group': '蚂蚁金服－某某某事业群－某某平台部－某某技术部－UED',
                'tags': [
                    {'key': '0',
                     'label': '很有想法的',
                     },
                    {'key': '1',
                     'label': '专注设计',
                     },
                    {'key': '2',
                     'label': 'adafaf',
                     },
                    {'key': '3',
                     'label': 'dsfgfdsh',
                     },
                    {'key': '4',
                     'label': 'ghfjh',
                     },
                    {'key': '5',
                     'label': '海纳百川',
                     },
                ],
                'notifyCount': 12,
                'unreadCount': 11,
                'country': 'China',
                'access': 'admin',          # 权限角色
                'geographic': {
                    'province': {
                        'label': '浙江省',
                        'key': '330000',
                    },
                    'city': {
                        'label': '杭州市',
                        'key': '330100',
                    },
                },
                'address': '西湖区工专路 77 号',
                'phone': '0752-268888888',
            }
            return JsonResponse(res)
