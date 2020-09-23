from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connections
import json
# Create your views here.


@csrf_exempt
def fetchADUserList(request):
    '''这里查询AD域的用户列表
    '''
    body = []
    body.append(
        {
            'sam': 'Z029354',
            'name': '小明',
            'department': '甄云科技/上海总部/研发中心/采购协同',
            'email': 'XXX@hand-china.com',
            'telphone': '15002510343',
            'title': '技术顾问',
        }
    )
    res = {
        'code': 0,
        'message': '成功',
        'body': body
    }
    return JsonResponse(res)
