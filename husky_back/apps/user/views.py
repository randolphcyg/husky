from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
import json

# Create your views here.


@csrf_exempt
def login_view(request):
    '''登录方法，接收前端的用户名密码登录方式，用户名密码用来匹配数据库中的用户，使后端登录
    '''
    if request.method == 'POST':
        req_data = json.loads(request.body)
        username = req_data.get("username")
        password = req_data.get("password")
        type_req = req_data.get("type")
        user = authenticate(username=username, password=password)
        if user:
            login(request, user)        # 后端登录
            res = {'name': 'admin',
                   'password': 'admin',
                   'status': 'ok',
                   'type': str(type_req)}
        else:       # 数据库校验失败
            res = {'status': 'error',
                   'type': '', }
        return JsonResponse(res)
    else:       # 请求出问题
        res = {'status': 'error',
               'type': ''}
        return JsonResponse(res)


@csrf_exempt
def current_user(request):
    '''暂时用户表没拓展这么多属性，先不做权限
    '''
    if request.method == 'GET':
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
    else:
        res = dict()
        return JsonResponse(res)
