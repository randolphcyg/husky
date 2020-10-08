import json

from django.contrib.auth import authenticate, login, logout
from django.http import HttpResponse, JsonResponse
from django.shortcuts import redirect, render
from django.views.decorators.csrf import csrf_exempt
from ldap3 import (ALL, ALL_ATTRIBUTES, MODIFY_REPLACE, NTLM, SASL, SIMPLE,
                   SUBTREE, SYNC, Connection, Server)

from apps.ad.views import access_ad_server, get_redis_connection
from apps.wework.src import *
from apps.wework.src.AbstractApi import AbstractApi, ApiException
from apps.wework.src.CorpApi import CORP_API_TYPE, CorpApi
from apps.wework.src.conf import Conf

# Create your views here.


@csrf_exempt
def wework_contact(request):
    '''企业微信通讯录管理方法入口
    '''
    try:
        wework_api_contact = CorpApi(Conf['CORP_ID'], Conf['CONTACT_SYNC_SECRET'])
        # 执行操作
        response = fetch_wework_user(api=wework_api_contact)           # 测试时候修改这里即可
        if response is False:
            res = {'code': -1,
                   'message': '企业微信接口调用失败!',
                   'status': 'error',
                   }
            return JsonResponse(res)
        else:
            # 返回执行结果
            res = {'code': 0,
                   'message': '企业微信接口连通!',
                   'status': 'ok',
                   'wework_res': response,
                   }
            return JsonResponse(res)
    except BaseException as e:
        print(str(e))
        res = {'code': -1,
               'message': '企业微信接口调用失败!',
               'status': 'error',
               }
        return JsonResponse(res)


@csrf_exempt
def fetch_wework_user(api):
    '''通讯录管理-查询用户
    '''
    response = api.httpCall(
        CORP_API_TYPE['USER_GET'],
        {
            'userid': 'JunLvMeng',
        })
    if response['errcode'] == 0:    # 返回结果正确
        return response
    else:
        return False        # 返回结果失败


@csrf_exempt
def fetch_wework_department_user(api):
    '''通讯录管理-获查询部门用户列表
    可以将部门列表放在平台上，以此对企业微信的部门和架构统一管理
    '''
    response = api.httpCall(
        CORP_API_TYPE['USER_LIST'],
        {
            'department_id': '1',      # 获取的部门id
            'fetch_child': '1',          # 是否递归获取子部门下面的成员：1-递归获取，0-只获取本部门
        })
    # print(response)
    if response['errcode'] == 0:    # 返回结果正确
        return response
    else:
        return False        # 返回结果失败


def del_wework_user(api):
    '''通讯录管理-删除企业微信用户
    '''
    response = api.httpCall(
        CORP_API_TYPE['USER_DELETE'],
        {
            'userid': 'apiceshi',
        })
    print(response)
    if response['errcode'] == 0:    # 返回结果正确
        return response
    else:
        return False        # 返回结果失败


@csrf_exempt
def fetch_wework_department(api):
    '''通讯录管理-获查询部门列表
    可以将部门列表放在平台上，以此对企业微信的部门和架构统一管理
    '''
    response = api.httpCall(
        CORP_API_TYPE['DEPARTMENT_LIST'],
        {
            'id': '1',      # 部门id
        })
    print(response)
    if response['errcode'] == 0:    # 返回结果正确
        return response
    else:
        return False        # 返回结果失败


def create_wework_user(api):
    '''通讯录管理-创建用户
    '''
    response = api.httpCall(
        CORP_API_TYPE['USER_CREATE'],
        {
            'userid': 'apiceshi',
            'name': 'api测试',
            'alias': 'randolph',
            'mobile': '13800000002',       # 13970970002
            'department': [1],
            'order': [2],
            'position': '技术',
            'gender': '1',
            'email': '',
            'is_leader_in_dept': [1],       # 是不是部门领导
            'enable': 1,
            'avatar_mediaid': '',           # 上传头像的id，默认空
            'main_department': 1,
            'to_invite': False,            # 默认邀请 设置为不邀请
            'external_position': '技术顾问',
        })
    print(response)
    if response['errcode'] == 0:    # 返回结果正确
        return response
    else:
        return False        # 返回结果失败


@csrf_exempt
def wework_ldap(request):
    '''企业微信AD域管理方法
    '''
    try:
        wework_api_app_ldap = CorpApi(Conf['CORP_ID'], Conf['APP_SECRET'])
        # 执行操作
        response = send_msg2user(api=wework_api_app_ldap)
        if response is False:
            res = {'code': -1,
                   'message': '企业微信 ldap app 调用失败!',
                   'status': 'error',
                   }
            return JsonResponse(res)
        else:
            # 返回执行结果
            res = {'code': 0,
                   'message': '企业微信 ldap app 接口调用成功!',
                   'status': 'ok',
                   'wework_res': response,
                   }
            return JsonResponse(res)
    except BaseException as e:
        print(str(e))
        res = {'code': -1,
               'message': '企业微信 ldap app 调用失败!',
               'status': 'error',
               }
        return JsonResponse(res)


@csrf_exempt
def send_msg2user(api):
    '''向用户发送消息
    '''
    import random
    response = api.httpCall(
        CORP_API_TYPE['MESSAGE_SEND'],
        {
            'touser': 'randolphCaiYingGang',
            'agentid': 1000005,
            'msgtype': 'text',
            'climsgid': 'climsgidclimsgid_%f' % (random.random()),
            'text': {
                'content': '已为您自动创建甄云统一认证账号:\n账号: Z0XXXXX\n密码: XXXXXXXX \n该账号适用于所有内部平台，请妥善保存，勿借给他人!',
            },
            'safe': 0,
        })
    print(response)
    if response['errcode'] == 0:    # 返回结果正确
        return response
    else:
        return False        # 返回结果失败


@csrf_exempt
def featch_wework_user_list(request):
    '''获取企业微信用户列表
    '''
    try:
        wework_api_contact = CorpApi(Conf['CORP_ID'], Conf['CONTACT_SYNC_SECRET'])
        # 执行操作
        response = fetch_wework_department_user(api=wework_api_contact)           # 测试时候修改这里即可
        if response is False:
            res = {'code': -1,
                   'message': '企业微信接口调用失败!',
                   'status': 'error',
                   }
            return JsonResponse(res)
        else:
            # 返回执行结果
            res = {'code': 0,
                   'message': '企业微信接口连通!',
                   'status': 'ok',
                   'data': response['userlist'],
                   }
            return JsonResponse(res)
    except BaseException as e:
        print(str(e))
        res = {'code': -1,
               'message': '企业微信接口调用失败!',
               'status': 'error',
               }
        return JsonResponse(res)
