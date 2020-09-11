from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
# from django.views.decorators.csrf import csrf_exempt

# Create your views here.

def login_view(request):
    print('触发后端登录函数')
    # next_url = request.GET.get('next', '/index/')
    # if request.method == "POST":
    #     username = request.POST.get('username')
    #     password = request.POST.get('password')
    #     user = authenticate(username=username, password=password)
    #     if user:
    #         login(request, user)
    #         return redirect(next_url)
    #     else:
    #         return render(request, 'login.html', {'info': '账号或密码错误!', 'next': next_url})
    # else:
    #     return render(request, 'login.html', {'next': next_url})
    return render(request, "", {})

def logout_view(request):
    logout(request)
    return redirect("/login/")


def redirect_login(request):
    return redirect('/login/')


def index_view(request):
    return redirect("/user/index/")