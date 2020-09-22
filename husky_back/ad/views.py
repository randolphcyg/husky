from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connections
# Create your views here.


@csrf_exempt
def ad_user():
    res = {}
    return JsonResponse(res)
