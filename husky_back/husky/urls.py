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
from apps.ad.views import (add_ad_account, fetch_ad_account_list, ldap_login,
                           load_ad_server_config_form_data,
                           load_mail_server_config_form_data,
                           reset_ad_account_pwd, save_ad_server_config,
                           save_mail_server_config,
                           test_ad_server_config_is_connect, test_send_mail)
from apps.user.views import (current_user, load_account_config, login_view,
                             save_account_config)
from apps.wework.views import (featch_wework_user_list, wework_contact,
                               wework_ldap)
from django.conf.urls import include, url
from django.contrib import admin
from django.urls import path

urlpatterns = [
    # path('admin/', admin.site.urls),
    url(r'^api/login', login_view, name='login'),
    url(r'^api/ldapLogin', ldap_login, name='ldapLogin'),
    url(r'^api/currentUser', current_user, name='currentUser'),
    url(r'^api/fetchAdAccountList', fetch_ad_account_list, name='fetchAdAccountList'),     # 读取AD服务器账号列表
    url(r'^api/addAdAccount', add_ad_account, name='addAdAccount'),       # 创建AD服务器账号
    url(r'^api/resetAdAccountPwd', reset_ad_account_pwd, name='resetAdAccountPwd'),       # 重设AD服务器账号密码(管理员)
    url(r'api/saveAdServerConfig', save_ad_server_config, name='saveAdServerConfig'),      # 保存AD服务器配置
    url(r'api/testAdServerConfigIsConnect', test_ad_server_config_is_connect, name='testAdServerConfigIsConnect'),       # 测试AD域服务器配置连通
    url(r'api/loadAdServerConfigFormData', load_ad_server_config_form_data, name='loadAdServerConfigFormData'),
    url(r'api/saveMailServerConfig', save_mail_server_config, name='saveMailServerConfig'),      # 保存邮件服务器配置
    url(r'api/loadMailServerConfigFormData', load_mail_server_config_form_data, name='loadMailServerConfigFormData'),
    url(r'api/testSendMail', test_send_mail, name='testSendMail'),   # 测试发送邮件
    url(r'api/loadAccountConfigFormData', load_account_config, name='loadAccountConfigFormData'),     # 加载用户设置
    url(r'api/saveAccountConfig', save_account_config, name='saveAccountConfig'),     # 保存用户设置
    # 企业微信通讯录管理
    url(r'api/weworkContact', wework_contact, name='weworkContact'),
    # 企业微信自建应用
    url(r'api/weworkLdap', wework_ldap, name='weworkLdap'),
    # 企业微信自建应用
    url(r'api/featchWeworkUserList', featch_wework_user_list, name='featchWeworkUserList'),
]
