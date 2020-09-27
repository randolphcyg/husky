"""husky URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/2.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from django.conf.urls import include, url
from user.views import login_view, current_user
from visual.views import bugs
from ad.views import (fetch_ad_account_list,
                      add_ad_account,
                      save_ad_server_config,
                      test_ad_server_config_is_connect,
                      load_ad_server_config_form_data,
                      load_mail_server_config_form_data,
                      save_mail_server_config,
                      test_send_mail,
                      )


urlpatterns = [
    path('admin/', admin.site.urls),
    url(r'^api/login', login_view, name='login'),
    url(r'^api/currentUser', current_user, name='currentUser'),
    url(r'^api/items', bugs, name='items'),
    url(r'^api/fetchAdAccountList', fetch_ad_account_list, name='fetchAdAccountList'),     # 读取AD服务器账号列表
    url(r'^api/addAdAccount', add_ad_account, name='addAdAccount'),       # 创建AD服务器账号
    url(r'api/saveAdServerConfig', save_ad_server_config, name='saveAdServerConfig'),      # 保存AD服务器配置
    url(r'api/testAdServerConfigIsConnect', test_ad_server_config_is_connect, name='testAdServerConfigIsConnect'),       # 测试AD域服务器配置连通
    url(r'api/loadAdServerConfigFormData', load_ad_server_config_form_data, name='loadAdServerConfigFormData'),
    url(r'api/saveMailServerConfig', save_mail_server_config, name='saveMailServerConfig'),      # 保存邮件服务器配置
    url(r'api/loadMailServerConfigFormData', load_mail_server_config_form_data, name='loadMailServerConfigFormData'),
    url(r'api/testSendMail', test_send_mail, name='testSendMail')   # 测试发送邮件
]
