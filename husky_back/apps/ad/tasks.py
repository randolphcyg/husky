from __future__ import absolute_import

import json
import logging
import os
import smtplib
from email.header import Header
from email.mime.image import MIMEImage
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from celery import shared_task
from django.conf import settings
# redis
from django_redis import get_redis_connection
from ldap3 import (ALL, ALL_ATTRIBUTES, MODIFY_REPLACE, NTLM, SASL, SIMPLE,
                   SUBTREE, SYNC, Connection, Server)

from ad.views import (access_ad_server, back_ad_account_to_redis, check_ou,
                      modify_ad_account_pwd)

logger = logging.getLogger("info_logger")
error_logger = logging.getLogger("error_logger")


@shared_task(name='')
def auto_aync_remote_mysql():
    '''定时同步远程mysql数据库
    '''
    import time
    print('auto_aync 测试')
    logger.info('每分钟定时任务测试!')
    return 'auto_aync 测试'


@shared_task(name='create_ad_obj')
def reset_ad_user_pwd(info):
    '''AD域重设密码的异步方法
    '''
    [sAMAccountName, displayName, mail, pwd] = info
    print(info)
    pass
    

@shared_task(name='create_ad_obj')
def create_ad_obj(info=None, type='user'):
    '''AD域创建对象的异步方法
    '''
    object_class = {'user': ['user', 'posixGroup', 'top'],
                    'ou': ['organizationalUnit', 'posixGroup', 'top'],
                    }
    if info is not None:
        [sAMAccountName, dn, displayName, mail, tel, title] = info
        user_attr = {'sAMAccountname': sAMAccountName,      # 登录名
                     'userAccountControl': 544,  # 启用账户
                     'displayname': displayName,        # 姓名
                     'givenName': displayName[0:1],     # 姓
                     'sn': displayName[1:],             # 名
                     'title': title,             # 头衔
                     'mail': mail,              # 邮箱
                     'telephoneNumber': tel,     # 电话号
                     }
    else:
        user_attr = None
    # 创建之前需要对dn中的OU部分进行判断，如果没有需要创建
    dn_base = dn.split(',', 1)[1]
    # 用到的时候连接AD服务器
    conn_ad = access_ad_server()
    check_ou_res = check_ou(conn_ad, dn_base)
    if not check_ou_res:        # 判断是否有这个OU路径 没有则返回-2
        return -2
    else:
        # 这里建立LDAP服务器的连接 里面数据一定有问题
        conn_ad.add(dn=dn, object_class=object_class[type], attributes=user_attr)
        add_result = conn_ad.result
        if add_result['result'] == 0:
            if type == 'user':          # 若是新增用户对象，则需要一些初始化操作
                new_pwd = modify_ad_account_pwd(dn=dn)
                # 此时账号已经创建，则需要从AD域向redis更新账号信息
                # 从redis的配置库读取AD配置 数据由AD服务器返回
                conn_redis_configs = get_redis_connection("configs_cache")
                str_data_config = conn_redis_configs.get('AdServerConfig')
                json_data = json.loads(str_data_config)
                back_ad_account_to_redis(searchFilterUser=json_data['searchFilterUser'],
                                         baseDnEnabled=json_data['baseDnEnabled'],
                                         conn_redis_accounts=get_redis_connection("ad_accounts_cache"))
                # 此处将生成的账号密码邮件发送给对应人员
                # 从redis取配置信息
                conn_redis = get_redis_connection("configs_cache")
                str_data = conn_redis.get('MailServerConfig')
                json_data = json.loads(str_data)
                send_mail_res = send_create_ad_user_init_info_mail(sAMAccountName=sAMAccountName,
                                                                   pwd=new_pwd,
                                                                   mail_host=json_data['mailServerSmtpServer'],
                                                                   mail_user=json_data['mailServerAdmin'],
                                                                   mail_pwd=json_data['mailServerAdminPwd'],
                                                                   mail_sender=json_data['mailServerSender'],
                                                                   ad_help_file_url=json_data['adAccountHelpFile'],
                                                                   mail_rcv=mail,
                                                                   )
                if send_mail_res == 0:
                    return 0
                else:
                    # 此时密码请保留一份
                    error_logger.log("发送邮件失败，保留账号: " + sAMAccountName + "密码: " + new_pwd)
                    return 1
        else:
            return add_result['result']


@shared_task(name='send_create_ad_user_init_info_mail')
def send_create_ad_user_init_info_mail(sAMAccountName: str,
                                       pwd: str,
                                       mail_host: str,
                                       mail_user: str,
                                       mail_pwd: str,
                                       mail_sender: str,
                                       ad_help_file_url: str,
                                       mail_rcv: str,
                                       ) -> int:
    '''创建账户成功，给该用户邮箱发送邮件
    sAMAccountName: AD账号
    pwd: AD账号密码
    '''
    # 邮件标题
    mail_title = '【AD域初始账号密码创建通知】'
    # 邮件内容链接
    UUAP_URL = "https://ldap.going-link.net/RDWeb/Pages/zh-CN/password.aspx"
    UUAP_MANUAL_URL = ad_help_file_url
    # 登录
    smtpObj = smtplib.SMTP()
    smtpObj.connect(mail_host, 25)    # 25 为 SMTP 端口号
    smtpObj.login(mail_user, mail_pwd)

    try:
        message = MIMEMultipart('related')            # 消息基础
        message["Subject"] = Header(mail_title, 'utf-8')
        sender = ("%s<" + mail_sender + ">") % (Header(mail_sender, 'utf-8'),)
        message['From'] = Header(sender, 'utf-8')
        message['To'] = Header(mail_rcv, 'utf-8')
        msgAlternative = MIMEMultipart('alternative')
        message.attach(msgAlternative)
        mail_msg = """
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]--><!--[if !IE]><!--><html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]--><head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title></title>
            <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->
            <meta name="viewport" content="width=device-width" /><style type="text/css">
        @media only screen and (min-width: 620px){.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:26px !important;line-height:34px !important}.wrapper h2{}.wrapper h2{font-size:20px !important;line-height:28px !important}.wrapper h3{}.column{}.wrapper .size-8{font-size:8px !important;line-height:14px !important}.wrapper .size-9{font-size:9px !important;line-height:16px !important}.wrapper .size-10{font-size:10px !important;line-height:18px !important}.wrapper .size-11{font-size:11px !important;line-height:19px !important}.wrapper .size-12{font-size:12px !important;line-height:19px !important}.wrapper .size-13{font-size:13px !important;line-height:21px !important}.wrapper .size-14{font-size:14px !important;line-height:21px !important}.wrapper .size-15{font-size:15px !important;line-height:23px !important}.wrapper .size-16{font-size:16px !important;line-height:24px
        !important}.wrapper .size-17{font-size:17px !important;line-height:26px !important}.wrapper .size-18{font-size:18px !important;line-height:26px !important}.wrapper .size-20{font-size:20px !important;line-height:28px !important}.wrapper .size-22{font-size:22px !important;line-height:31px !important}.wrapper .size-24{font-size:24px !important;line-height:32px !important}.wrapper .size-26{font-size:26px !important;line-height:34px !important}.wrapper .size-28{font-size:28px !important;line-height:36px !important}.wrapper .size-30{font-size:30px !important;line-height:38px !important}.wrapper .size-32{font-size:32px !important;line-height:40px !important}.wrapper .size-34{font-size:34px !important;line-height:43px !important}.wrapper .size-36{font-size:36px !important;line-height:43px !important}.wrapper .size-40{font-size:40px !important;line-height:47px !important}.wrapper
        .size-44{font-size:44px !important;line-height:50px !important}.wrapper .size-48{font-size:48px !important;line-height:54px !important}.wrapper .size-56{font-size:56px !important;line-height:60px !important}.wrapper .size-64{font-size:64px !important;line-height:63px !important}}
        </style>
            <meta name="x-apple-disable-message-reformatting" />
            <style type="text/css">
        body {
        margin: 0;
        padding: 0;
        }
        table {
        border-collapse: collapse;
        table-layout: fixed;
        }
        * {
        line-height: inherit;
        }
        [x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        }
        .wrapper .footer__share-button a:hover,
        .wrapper .footer__share-button a:focus {
        color: #ffffff !important;
        }
        .btn a:hover,
        .btn a:focus,
        .footer__share-button a:hover,
        .footer__share-button a:focus,
        .email-footer__links a:hover,
        .email-footer__links a:focus {
        opacity: 0.8;
        }
        .preheader,
        .header,
        .layout,
        .column {
        transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
        }
        .preheader td {
        padding-bottom: 8px;
        }
        .layout,
        div.header {
        max-width: 400px !important;
        -fallback-width: 95% !important;
        width: calc(100% - 20px) !important;
        }
        div.preheader {
        max-width: 360px !important;
        -fallback-width: 90% !important;
        width: calc(100% - 60px) !important;
        }
        .snippet,
        .webversion {
        Float: none !important;
        }
        .stack .column {
        max-width: 400px !important;
        width: 100% !important;
        }
        .fixed-width.has-border {
        max-width: 402px !important;
        }
        .fixed-width.has-border .layout__inner {
        box-sizing: border-box;
        }
        .snippet,
        .webversion {
        width: 50% !important;
        }
        .ie .btn {
        width: 100%;
        }
        .ie .stack .column,
        .ie .stack .gutter {
        display: table-cell;
        float: none !important;
        }
        .ie div.preheader,
        .ie .email-footer {
        max-width: 560px !important;
        width: 560px !important;
        }
        .ie .snippet,
        .ie .webversion {
        width: 280px !important;
        }
        .ie div.header,
        .ie .layout {
        max-width: 600px !important;
        width: 600px !important;
        }
        .ie .two-col .column {
        max-width: 300px !important;
        width: 300px !important;
        }
        .ie .three-col .column,
        .ie .narrow {
        max-width: 200px !important;
        width: 200px !important;
        }
        .ie .wide {
        width: 400px !important;
        }
        .ie .stack.fixed-width.has-border,
        .ie .stack.has-gutter.has-border {
        max-width: 602px !important;
        width: 602px !important;
        }
        .ie .stack.two-col.has-gutter .column {
        max-width: 290px !important;
        width: 290px !important;
        }
        .ie .stack.three-col.has-gutter .column,
        .ie .stack.has-gutter .narrow {
        max-width: 188px !important;
        width: 188px !important;
        }
        .ie .stack.has-gutter .wide {
        max-width: 394px !important;
        width: 394px !important;
        }
        .ie .stack.two-col.has-gutter.has-border .column {
        max-width: 292px !important;
        width: 292px !important;
        }
        .ie .stack.three-col.has-gutter.has-border .column,
        .ie .stack.has-gutter.has-border .narrow {
        max-width: 190px !important;
        width: 190px !important;
        }
        .ie .stack.has-gutter.has-border .wide {
        max-width: 396px !important;
        width: 396px !important;
        }
        .ie .fixed-width .layout__inner {
        border-left: 0 none white !important;
        border-right: 0 none white !important;
        }
        .ie .layout__edges {
        display: none;
        }
        .mso .layout__edges {
        font-size: 0;
        }
        .layout-fixed-width,
        .mso .layout-full-width {
        background-color: #ffffff;
        }
        @media only screen and (min-width: 620px) {
        .column,
        .gutter {
            display: table-cell;
            Float: none !important;
            vertical-align: top;
        }
        div.preheader,
        .email-footer {
            max-width: 560px !important;
            width: 560px !important;
        }
        .snippet,
        .webversion {
            width: 280px !important;
        }
        div.header,
        .layout,
        .one-col .column {
            max-width: 600px !important;
            width: 600px !important;
        }
        .fixed-width.has-border,
        .fixed-width.x_has-border,
        .has-gutter.has-border,
        .has-gutter.x_has-border {
            max-width: 602px !important;
            width: 602px !important;
        }
        .two-col .column {
            max-width: 300px !important;
            width: 300px !important;
        }
        .three-col .column,
        .column.narrow,
        .column.x_narrow {
            max-width: 200px !important;
            width: 200px !important;
        }
        .column.wide,
        .column.x_wide {
            width: 400px !important;
        }
        .two-col.has-gutter .column,
        .two-col.x_has-gutter .column {
            max-width: 290px !important;
            width: 290px !important;
        }
        .three-col.has-gutter .column,
        .three-col.x_has-gutter .column,
        .has-gutter .narrow {
            max-width: 188px !important;
            width: 188px !important;
        }
        .has-gutter .wide {
            max-width: 394px !important;
            width: 394px !important;
        }
        .two-col.has-gutter.has-border .column,
        .two-col.x_has-gutter.x_has-border .column {
            max-width: 292px !important;
            width: 292px !important;
        }
        .three-col.has-gutter.has-border .column,
        .three-col.x_has-gutter.x_has-border .column,
        .has-gutter.has-border .narrow,
        .has-gutter.x_has-border .narrow {
            max-width: 190px !important;
            width: 190px !important;
        }
        .has-gutter.has-border .wide,
        .has-gutter.x_has-border .wide {
            max-width: 396px !important;
            width: 396px !important;
        }
        }
        @supports (display: flex) {
        @media only screen and (min-width: 620px) {
            .fixed-width.has-border .layout__inner {
            display: flex !important;
            }
        }
        }
        @media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {
        .fblike {
            background-image: url(https://i7.createsend1.com/static/eb/master/13-the-blueprint-3/images/fblike@2x.png) !important;
        }
        .tweet {
            background-image: url(https://i8.createsend1.com/static/eb/master/13-the-blueprint-3/images/tweet@2x.png) !important;
        }
        .linkedinshare {
            background-image: url(https://i9.createsend1.com/static/eb/master/13-the-blueprint-3/images/lishare@2x.png) !important;
        }
        .forwardtoafriend {
            background-image: url(https://i10.createsend1.com/static/eb/master/13-the-blueprint-3/images/forward@2x.png) !important;
        }
        }
        @media (max-width: 321px) {
        .fixed-width.has-border .layout__inner {
            border-width: 1px 0 !important;
        }
        .layout,
        .stack .column {
            min-width: 320px !important;
            width: 320px !important;
        }
        .border {
            display: none;
        }
        .has-gutter .border {
            display: table-cell;
        }
        }
        .mso div {
        border: 0 none white !important;
        }
        .mso .w560 .divider {
        Margin-left: 260px !important;
        Margin-right: 260px !important;
        }
        .mso .w360 .divider {
        Margin-left: 160px !important;
        Margin-right: 160px !important;
        }
        .mso .w260 .divider {
        Margin-left: 110px !important;
        Margin-right: 110px !important;
        }
        .mso .w160 .divider {
        Margin-left: 60px !important;
        Margin-right: 60px !important;
        }
        .mso .w354 .divider {
        Margin-left: 157px !important;
        Margin-right: 157px !important;
        }
        .mso .w250 .divider {
        Margin-left: 105px !important;
        Margin-right: 105px !important;
        }
        .mso .w148 .divider {
        Margin-left: 54px !important;
        Margin-right: 54px !important;
        }
        .mso .size-8,
        .ie .size-8 {
        font-size: 8px !important;
        line-height: 14px !important;
        }
        .mso .size-9,
        .ie .size-9 {
        font-size: 9px !important;
        line-height: 16px !important;
        }
        .mso .size-10,
        .ie .size-10 {
        font-size: 10px !important;
        line-height: 18px !important;
        }
        .mso .size-11,
        .ie .size-11 {
        font-size: 11px !important;
        line-height: 19px !important;
        }
        .mso .size-12,
        .ie .size-12 {
        font-size: 12px !important;
        line-height: 19px !important;
        }
        .mso .size-13,
        .ie .size-13 {
        font-size: 13px !important;
        line-height: 21px !important;
        }
        .mso .size-14,
        .ie .size-14 {
        font-size: 14px !important;
        line-height: 21px !important;
        }
        .mso .size-15,
        .ie .size-15 {
        font-size: 15px !important;
        line-height: 23px !important;
        }
        .mso .size-16,
        .ie .size-16 {
        font-size: 16px !important;
        line-height: 24px !important;
        }
        .mso .size-17,
        .ie .size-17 {
        font-size: 17px !important;
        line-height: 26px !important;
        }
        .mso .size-18,
        .ie .size-18 {
        font-size: 18px !important;
        line-height: 26px !important;
        }
        .mso .size-20,
        .ie .size-20 {
        font-size: 20px !important;
        line-height: 28px !important;
        }
        .mso .size-22,
        .ie .size-22 {
        font-size: 22px !important;
        line-height: 31px !important;
        }
        .mso .size-24,
        .ie .size-24 {
        font-size: 24px !important;
        line-height: 32px !important;
        }
        .mso .size-26,
        .ie .size-26 {
        font-size: 26px !important;
        line-height: 34px !important;
        }
        .mso .size-28,
        .ie .size-28 {
        font-size: 28px !important;
        line-height: 36px !important;
        }
        .mso .size-30,
        .ie .size-30 {
        font-size: 30px !important;
        line-height: 38px !important;
        }
        .mso .size-32,
        .ie .size-32 {
        font-size: 32px !important;
        line-height: 40px !important;
        }
        .mso .size-34,
        .ie .size-34 {
        font-size: 34px !important;
        line-height: 43px !important;
        }
        .mso .size-36,
        .ie .size-36 {
        font-size: 36px !important;
        line-height: 43px !important;
        }
        .mso .size-40,
        .ie .size-40 {
        font-size: 40px !important;
        line-height: 47px !important;
        }
        .mso .size-44,
        .ie .size-44 {
        font-size: 44px !important;
        line-height: 50px !important;
        }
        .mso .size-48,
        .ie .size-48 {
        font-size: 48px !important;
        line-height: 54px !important;
        }
        .mso .size-56,
        .ie .size-56 {
        font-size: 56px !important;
        line-height: 60px !important;
        }
        .mso .size-64,
        .ie .size-64 {
        font-size: 64px !important;
        line-height: 63px !important;
        }
        </style>

        <!--[if !mso]><!--><style type="text/css">
        @import url(https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,400italic,700italic|Ubuntu:400,700,400italic,700italic);
        </style><link href="https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,400italic,700italic|Ubuntu:400,700,400italic,700italic" rel="stylesheet" type="text/css" /><!--<![endif]--><style type="text/css">
        body{background-color:#fbfbfb}.logo a:hover,.logo a:focus{color:#1e2e3b !important}.mso .layout-has-border{border-top:1px solid #c8c8c8;border-bottom:1px solid #c8c8c8}.mso .layout-has-bottom-border{border-bottom:1px solid #c8c8c8}.mso .border,.ie .border{background-color:#c8c8c8}.mso h1,.ie h1{}.mso h1,.ie h1{font-size:26px !important;line-height:34px !important}.mso h2,.ie h2{}.mso h2,.ie h2{font-size:20px !important;line-height:28px !important}.mso h3,.ie h3{}.mso .layout__inner,.ie .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:Georgia,serif}
        </style><meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="My First Campaign" />
        </head>
        <!--[if mso]>
        <body class="mso">
        <![endif]-->
        <!--[if !mso]><!-->
        <body class="full-padding" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;">
        <!--<![endif]-->
            <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fbfbfb;" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td>
            <div role="banner">
                <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
                <div style="border-collapse: collapse;display: table;width: 100%;">
                <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->
                    <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #999;font-family: Georgia,serif;">

                    </div>
                <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->
                    <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #999;font-family: Georgia,serif;">

                    </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
                </div>
                <div class="header" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);" id="emb-email-header-container">
                <!--[if (mso)|(IE)]><table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 600px"><![endif]-->
                <div class="logo emb-logo-margin-box" style="font-size: 26px;line-height: 32px;Margin-top: 47px;Margin-bottom: 9px;color: #41637e;font-family: Avenir,sans-serif;Margin-left: 20px;Margin-right: 20px;" align="center">
                    <div class="logo-center" align="center" id="emb-email-header"><a style="text-decoration: none;transition: opacity 0.1s ease-in;color: #41637e;" href="https://www.going-link.com/"><img style="display: block;height: auto;width: 100%;border: 0;max-width: 205px;" src="cid:zy" alt="" width="205" /></a></div>
                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
            </div>
            <div>
            <div class="layout one-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: #ffffff;">
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #ffffff;"><td style="width: 600px" class="w560"><![endif]-->
                <div class="column" style="text-align: left;color: #565656;font-size: 14px;line-height: 21px;font-family: Georgia,serif;">

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;">
            <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                <h1 class="size-24" style="Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #565656;font-size: 20px;line-height: 28px;font-family: Avenir,sans-serif;" lang="x-size-24">&#29956;&#20113;&#31185;&#25216;&#32479;&#19968;&#35748;&#35777;&#36134;&#21495;</h1><p style="Margin-top: 20px;Margin-bottom: 0;font-family: ubuntu,sans-serif;"><span class="font-ubuntu">&#24744;&#22909;&#65292;&#24050;&#20026;&#24744;&#21019;&#24314;&#36134;&#21495;&#65292;&#20449;&#24687;&#22914;&#19979;&#65306;</span></p><ul style="Margin-top: 20px;Margin-bottom: 0;Margin-left: 24px;padding: 0;list-style-type: disc;"><li style="Margin-top: 20px;Margin-bottom: 0;Margin-left: 0;text-align: left;font-family: Ubuntu, sans-serif;"><span class="font-ubuntu"><strong>&#29992;&#25143;&#21517;</strong>: """ + sAMAccountName + """</span></li><li style="Margin-top: 0;Margin-bottom: 0;Margin-left: 0;font-family: Ubuntu,
        sans-serif;"><span class="font-ubuntu"><strong>&#21021;&#22987;&#23494;&#30721;</strong>: """ + pwd + """</span></li></ul><p style="Margin-top: 20px;Margin-bottom: 0;font-family: verdana,sans-serif;"><span class="font-verdana">&#8203;&#8203;<strong>&#21021;&#22987;&#23494;&#30721;&#21487;&#20197;&#20462;&#25913;</strong>&#65292;&#35831;&#21450;&#26102;&#20462;&#25913;&#23494;&#30721;&#65281;</span></p><p style="Margin-top: 20px;Margin-bottom: 20px;font-family: verdana,sans-serif;"><span class="font-verdana"><strong>&#36134;&#21495;&#23494;&#30721;&#20449;&#24687;&#20165;&#38480;&#26412;&#20154;&#20351;&#29992;</strong>&#65292;&#19981;&#24471;&#20511;&#19982;&#20182;&#20154;!</span></p>
            </div>
            </div>

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 24px;">
            <div class="divider" style="display: block;font-size: 2px;line-height: 2px;Margin-left: auto;Margin-right: auto;width: 40px;background-color: #c8c8c8;">&nbsp;</div>
            </div>

                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
            </div>

            <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 20px;">&nbsp;</div>

            <div class="layout two-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: #ffffff;">
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #ffffff;"><td style="width: 300px" valign="top" class="w260"><![endif]-->
                <div class="column" style="text-align: left;color: #565656;font-size: 14px;line-height: 21px;font-family: Georgia,serif;max-width: 320px;min-width: 300px; width: 320px;width: calc(12300px - 2000%);Float: left;">

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;Margin-bottom: 24px;">
            <div class="btn btn--depth btn--medium" style="text-align:center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 12px;font-weight: bold;line-height: 22px;padding: 10px 20px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;border: 1px solid rgba(0, 0, 0, 0.25);box-shadow: inset 0 -3px 0 -1px rgba(0, 0, 0, 0.2), inset 0 2px 1px -1px #ffffff;text-shadow: 0 1px 0 rgba(0, 0, 0, 0.21);background-color: #38deba;font-family: Roboto Condensed, Arial Narrow, Avenir Next Condensed, Roboto, sans-serif;" href=\"""" + UUAP_URL + """\">&#33258;&#21161;&#20462;&#25913;&#23494;&#30721;</a><![endif]>
            <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://ldap.going-link.net/RDWeb/Pages/zh-CN/password.aspx" style="width:112px" arcsize="10%" strokecolor="#2AA68C" filled="t"><v:fill type="gradient" angle="180" color="#38DEBA" color2="#30BD9E"></v:fill><v:textbox style="mso-fit-shape-to-text:t" inset="0px,9px,0px,9px"><center style="font-size:12px;line-height:22px;color:#FFFFFF;font-family:Roboto Condensed,Arial Narrow,Avenir Next Condensed,Roboto,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">&#33258;&#21161;&#20462;&#25913;&#23494;&#30721;</center></v:textbox></v:roundrect><![endif]--></div>
            </div>

                </div>
                <!--[if (mso)|(IE)]></td><td style="width: 300px" valign="top" class="w260"><![endif]-->
                <div class="column" style="text-align: left;color: #565656;font-size: 14px;line-height: 21px;font-family: Georgia,serif;max-width: 320px;min-width: 300px; width: 320px;width: calc(12300px - 2000%);Float: left;">

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;Margin-bottom: 24px;">
            <div class="btn btn--depth btn--medium" style="text-align:center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 12px;font-weight: bold;line-height: 22px;padding: 10px 20px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;border: 1px solid rgba(0, 0, 0, 0.25);box-shadow: inset 0 -3px 0 -1px rgba(0, 0, 0, 0.2), inset 0 2px 1px -1px #ffffff;text-shadow: 0 1px 0 rgba(0, 0, 0, 0.21);background-color: #42dedb;font-family: Trebuchet MS, Lucida Grande, Lucida Sans Unicode, sans-serif;" href=\"""" + UUAP_MANUAL_URL + """\">&#24110;&#21161;&#35828;&#26126;&#25991;&#26723;</a><![endif]>
            <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://open-console.going-link.com/#/knowledge/project/doc/3?baseName=SRM%E7%9F%A5%E8%AF%86%E5%BA%93&id=16&name=SRM%E4%BA%A7%E5%93%81%E5%B9%B3%E5%8F%B0&orgId=1&organizationId=1&spaceId=105&type=project" style="width:112px" arcsize="10%" strokecolor="#32A6A4" filled="t"><v:fill type="gradient" angle="180" color="#42DEDB" color2="#38BDBA"></v:fill><v:textbox style="mso-fit-shape-to-text:t" inset="0px,9px,0px,9px"><center style="font-size:12px;line-height:22px;color:#FFFFFF;font-family:Trebuchet MS,Lucida Grande,Lucida Sans Unicode,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">&#24110;&#21161;&#35828;&#26126;&#25991;&#26723;</center></v:textbox></v:roundrect><![endif]--></div>
            </div>

                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
            </div>

            <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 20px;">&nbsp;</div>


            <div role="contentinfo">
                <div class="layout email-footer stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 400px;" valign="top" class="w360"><![endif]-->
                    <div class="column wide" style="text-align: left;font-size: 12px;line-height: 19px;color: #999;font-family: Georgia,serif;Float: left;max-width: 400px;min-width: 320px; width: 320px;width: calc(8000% - 47600px);">
                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">

                        <div style="font-size: 12px;line-height: 19px;">
                        <div>&#29956;&#20113;&#31185;&#25216;</div>
                        </div>
                        <div style="font-size: 12px;line-height: 19px;Margin-top: 18px;">

                        </div>
                        <!--[if mso]>&nbsp;<![endif]-->
                    </div>
                    </div>
                <!--[if (mso)|(IE)]></td><td style="width: 200px;" valign="top" class="w160"><![endif]-->
                    <div class="column narrow" style="text-align: left;font-size: 12px;line-height: 19px;color: #999;font-family: Georgia,serif;Float: left;max-width: 320px;min-width: 200px; width: 320px;width: calc(72200px - 12000%);">
                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
                    </div>
                    </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
                </div>
            </div>
            <div style="line-height:40px;font-size:40px;">&nbsp;</div>
            </div></td></tr></tbody></table>
        </body></html>
        """
        msgAlternative.attach(MIMEText(mail_msg, 'html', 'utf-8'))
        img_url = os.path.join(settings.BASE_DIR, r"static\images\zy.png")
        fp = open(img_url, 'rb')       # 图片位置
        msgImage = MIMEImage(fp.read())
        fp.close()
        # 定义图片 ID，在 HTML 文本中引用
        msgImage.add_header('Content-ID', '<zy>')
        message.attach(msgImage)
        smtpObj.sendmail(from_addr=mail_user, to_addrs=[mail_rcv], msg=str(message))
        return 0
    except smtplib.SMTPException as e:
        error_logger(str(e))
        return 1
    smtpObj.quit()


@shared_task(name='test_send_create_ad_user_init_info_mail')
def test_send_create_ad_user_init_info_mail(sAMAccountName: str,
                                            pwd: str,
                                            mail_host: str,
                                            mail_user: str,
                                            mail_pwd: str,
                                            mail_sender: str,
                                            ad_help_file_url: str,
                                            mail_rcv: str,
                                            ) -> int:
    '''给指定邮箱邮箱发送测试邮件异步任务
    sAMAccountName: AD账号
    pwd: AD账号密码
    '''
    # 邮件标题
    mail_title = '【测试邮件-AD域初始账号密码创建通知】'
    # 邮件内容链接
    UUAP_URL = "https://ldap.going-link.net/RDWeb/Pages/zh-CN/password.aspx"
    UUAP_MANUAL_URL = ad_help_file_url
    # 登录
    smtpObj = smtplib.SMTP()
    smtpObj.connect(mail_host, 25)    # 25 为 SMTP 端口号
    smtpObj.login(mail_user, mail_pwd)
    try:
        message = MIMEMultipart('related')            # 消息基础
        message["Subject"] = Header(mail_title, 'utf-8')
        message['From'] = Header(mail_sender, 'utf-8')
        message['To'] = Header(mail_rcv, 'utf-8')
        msgAlternative = MIMEMultipart('alternative')
        message.attach(msgAlternative)
        mail_msg = """
        <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"><!--[if IE]><html xmlns="http://www.w3.org/1999/xhtml" class="ie"><![endif]--><!--[if !IE]><!--><html style="margin: 0;padding: 0;" xmlns="http://www.w3.org/1999/xhtml"><!--<![endif]--><head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <title></title>
            <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge" /><!--<![endif]-->
            <meta name="viewport" content="width=device-width" /><style type="text/css">
        @media only screen and (min-width: 620px){.wrapper{min-width:600px !important}.wrapper h1{}.wrapper h1{font-size:26px !important;line-height:34px !important}.wrapper h2{}.wrapper h2{font-size:20px !important;line-height:28px !important}.wrapper h3{}.column{}.wrapper .size-8{font-size:8px !important;line-height:14px !important}.wrapper .size-9{font-size:9px !important;line-height:16px !important}.wrapper .size-10{font-size:10px !important;line-height:18px !important}.wrapper .size-11{font-size:11px !important;line-height:19px !important}.wrapper .size-12{font-size:12px !important;line-height:19px !important}.wrapper .size-13{font-size:13px !important;line-height:21px !important}.wrapper .size-14{font-size:14px !important;line-height:21px !important}.wrapper .size-15{font-size:15px !important;line-height:23px !important}.wrapper .size-16{font-size:16px !important;line-height:24px
        !important}.wrapper .size-17{font-size:17px !important;line-height:26px !important}.wrapper .size-18{font-size:18px !important;line-height:26px !important}.wrapper .size-20{font-size:20px !important;line-height:28px !important}.wrapper .size-22{font-size:22px !important;line-height:31px !important}.wrapper .size-24{font-size:24px !important;line-height:32px !important}.wrapper .size-26{font-size:26px !important;line-height:34px !important}.wrapper .size-28{font-size:28px !important;line-height:36px !important}.wrapper .size-30{font-size:30px !important;line-height:38px !important}.wrapper .size-32{font-size:32px !important;line-height:40px !important}.wrapper .size-34{font-size:34px !important;line-height:43px !important}.wrapper .size-36{font-size:36px !important;line-height:43px !important}.wrapper .size-40{font-size:40px !important;line-height:47px !important}.wrapper
        .size-44{font-size:44px !important;line-height:50px !important}.wrapper .size-48{font-size:48px !important;line-height:54px !important}.wrapper .size-56{font-size:56px !important;line-height:60px !important}.wrapper .size-64{font-size:64px !important;line-height:63px !important}}
        </style>
            <meta name="x-apple-disable-message-reformatting" />
            <style type="text/css">
        body {
        margin: 0;
        padding: 0;
        }
        table {
        border-collapse: collapse;
        table-layout: fixed;
        }
        * {
        line-height: inherit;
        }
        [x-apple-data-detectors] {
        color: inherit !important;
        text-decoration: none !important;
        }
        .wrapper .footer__share-button a:hover,
        .wrapper .footer__share-button a:focus {
        color: #ffffff !important;
        }
        .btn a:hover,
        .btn a:focus,
        .footer__share-button a:hover,
        .footer__share-button a:focus,
        .email-footer__links a:hover,
        .email-footer__links a:focus {
        opacity: 0.8;
        }
        .preheader,
        .header,
        .layout,
        .column {
        transition: width 0.25s ease-in-out, max-width 0.25s ease-in-out;
        }
        .preheader td {
        padding-bottom: 8px;
        }
        .layout,
        div.header {
        max-width: 400px !important;
        -fallback-width: 95% !important;
        width: calc(100% - 20px) !important;
        }
        div.preheader {
        max-width: 360px !important;
        -fallback-width: 90% !important;
        width: calc(100% - 60px) !important;
        }
        .snippet,
        .webversion {
        Float: none !important;
        }
        .stack .column {
        max-width: 400px !important;
        width: 100% !important;
        }
        .fixed-width.has-border {
        max-width: 402px !important;
        }
        .fixed-width.has-border .layout__inner {
        box-sizing: border-box;
        }
        .snippet,
        .webversion {
        width: 50% !important;
        }
        .ie .btn {
        width: 100%;
        }
        .ie .stack .column,
        .ie .stack .gutter {
        display: table-cell;
        float: none !important;
        }
        .ie div.preheader,
        .ie .email-footer {
        max-width: 560px !important;
        width: 560px !important;
        }
        .ie .snippet,
        .ie .webversion {
        width: 280px !important;
        }
        .ie div.header,
        .ie .layout {
        max-width: 600px !important;
        width: 600px !important;
        }
        .ie .two-col .column {
        max-width: 300px !important;
        width: 300px !important;
        }
        .ie .three-col .column,
        .ie .narrow {
        max-width: 200px !important;
        width: 200px !important;
        }
        .ie .wide {
        width: 400px !important;
        }
        .ie .stack.fixed-width.has-border,
        .ie .stack.has-gutter.has-border {
        max-width: 602px !important;
        width: 602px !important;
        }
        .ie .stack.two-col.has-gutter .column {
        max-width: 290px !important;
        width: 290px !important;
        }
        .ie .stack.three-col.has-gutter .column,
        .ie .stack.has-gutter .narrow {
        max-width: 188px !important;
        width: 188px !important;
        }
        .ie .stack.has-gutter .wide {
        max-width: 394px !important;
        width: 394px !important;
        }
        .ie .stack.two-col.has-gutter.has-border .column {
        max-width: 292px !important;
        width: 292px !important;
        }
        .ie .stack.three-col.has-gutter.has-border .column,
        .ie .stack.has-gutter.has-border .narrow {
        max-width: 190px !important;
        width: 190px !important;
        }
        .ie .stack.has-gutter.has-border .wide {
        max-width: 396px !important;
        width: 396px !important;
        }
        .ie .fixed-width .layout__inner {
        border-left: 0 none white !important;
        border-right: 0 none white !important;
        }
        .ie .layout__edges {
        display: none;
        }
        .mso .layout__edges {
        font-size: 0;
        }
        .layout-fixed-width,
        .mso .layout-full-width {
        background-color: #ffffff;
        }
        @media only screen and (min-width: 620px) {
        .column,
        .gutter {
            display: table-cell;
            Float: none !important;
            vertical-align: top;
        }
        div.preheader,
        .email-footer {
            max-width: 560px !important;
            width: 560px !important;
        }
        .snippet,
        .webversion {
            width: 280px !important;
        }
        div.header,
        .layout,
        .one-col .column {
            max-width: 600px !important;
            width: 600px !important;
        }
        .fixed-width.has-border,
        .fixed-width.x_has-border,
        .has-gutter.has-border,
        .has-gutter.x_has-border {
            max-width: 602px !important;
            width: 602px !important;
        }
        .two-col .column {
            max-width: 300px !important;
            width: 300px !important;
        }
        .three-col .column,
        .column.narrow,
        .column.x_narrow {
            max-width: 200px !important;
            width: 200px !important;
        }
        .column.wide,
        .column.x_wide {
            width: 400px !important;
        }
        .two-col.has-gutter .column,
        .two-col.x_has-gutter .column {
            max-width: 290px !important;
            width: 290px !important;
        }
        .three-col.has-gutter .column,
        .three-col.x_has-gutter .column,
        .has-gutter .narrow {
            max-width: 188px !important;
            width: 188px !important;
        }
        .has-gutter .wide {
            max-width: 394px !important;
            width: 394px !important;
        }
        .two-col.has-gutter.has-border .column,
        .two-col.x_has-gutter.x_has-border .column {
            max-width: 292px !important;
            width: 292px !important;
        }
        .three-col.has-gutter.has-border .column,
        .three-col.x_has-gutter.x_has-border .column,
        .has-gutter.has-border .narrow,
        .has-gutter.x_has-border .narrow {
            max-width: 190px !important;
            width: 190px !important;
        }
        .has-gutter.has-border .wide,
        .has-gutter.x_has-border .wide {
            max-width: 396px !important;
            width: 396px !important;
        }
        }
        @supports (display: flex) {
        @media only screen and (min-width: 620px) {
            .fixed-width.has-border .layout__inner {
            display: flex !important;
            }
        }
        }
        @media only screen and (-webkit-min-device-pixel-ratio: 2), only screen and (min--moz-device-pixel-ratio: 2), only screen and (-o-min-device-pixel-ratio: 2/1), only screen and (min-device-pixel-ratio: 2), only screen and (min-resolution: 192dpi), only screen and (min-resolution: 2dppx) {
        .fblike {
            background-image: url(https://i7.createsend1.com/static/eb/master/13-the-blueprint-3/images/fblike@2x.png) !important;
        }
        .tweet {
            background-image: url(https://i8.createsend1.com/static/eb/master/13-the-blueprint-3/images/tweet@2x.png) !important;
        }
        .linkedinshare {
            background-image: url(https://i9.createsend1.com/static/eb/master/13-the-blueprint-3/images/lishare@2x.png) !important;
        }
        .forwardtoafriend {
            background-image: url(https://i10.createsend1.com/static/eb/master/13-the-blueprint-3/images/forward@2x.png) !important;
        }
        }
        @media (max-width: 321px) {
        .fixed-width.has-border .layout__inner {
            border-width: 1px 0 !important;
        }
        .layout,
        .stack .column {
            min-width: 320px !important;
            width: 320px !important;
        }
        .border {
            display: none;
        }
        .has-gutter .border {
            display: table-cell;
        }
        }
        .mso div {
        border: 0 none white !important;
        }
        .mso .w560 .divider {
        Margin-left: 260px !important;
        Margin-right: 260px !important;
        }
        .mso .w360 .divider {
        Margin-left: 160px !important;
        Margin-right: 160px !important;
        }
        .mso .w260 .divider {
        Margin-left: 110px !important;
        Margin-right: 110px !important;
        }
        .mso .w160 .divider {
        Margin-left: 60px !important;
        Margin-right: 60px !important;
        }
        .mso .w354 .divider {
        Margin-left: 157px !important;
        Margin-right: 157px !important;
        }
        .mso .w250 .divider {
        Margin-left: 105px !important;
        Margin-right: 105px !important;
        }
        .mso .w148 .divider {
        Margin-left: 54px !important;
        Margin-right: 54px !important;
        }
        .mso .size-8,
        .ie .size-8 {
        font-size: 8px !important;
        line-height: 14px !important;
        }
        .mso .size-9,
        .ie .size-9 {
        font-size: 9px !important;
        line-height: 16px !important;
        }
        .mso .size-10,
        .ie .size-10 {
        font-size: 10px !important;
        line-height: 18px !important;
        }
        .mso .size-11,
        .ie .size-11 {
        font-size: 11px !important;
        line-height: 19px !important;
        }
        .mso .size-12,
        .ie .size-12 {
        font-size: 12px !important;
        line-height: 19px !important;
        }
        .mso .size-13,
        .ie .size-13 {
        font-size: 13px !important;
        line-height: 21px !important;
        }
        .mso .size-14,
        .ie .size-14 {
        font-size: 14px !important;
        line-height: 21px !important;
        }
        .mso .size-15,
        .ie .size-15 {
        font-size: 15px !important;
        line-height: 23px !important;
        }
        .mso .size-16,
        .ie .size-16 {
        font-size: 16px !important;
        line-height: 24px !important;
        }
        .mso .size-17,
        .ie .size-17 {
        font-size: 17px !important;
        line-height: 26px !important;
        }
        .mso .size-18,
        .ie .size-18 {
        font-size: 18px !important;
        line-height: 26px !important;
        }
        .mso .size-20,
        .ie .size-20 {
        font-size: 20px !important;
        line-height: 28px !important;
        }
        .mso .size-22,
        .ie .size-22 {
        font-size: 22px !important;
        line-height: 31px !important;
        }
        .mso .size-24,
        .ie .size-24 {
        font-size: 24px !important;
        line-height: 32px !important;
        }
        .mso .size-26,
        .ie .size-26 {
        font-size: 26px !important;
        line-height: 34px !important;
        }
        .mso .size-28,
        .ie .size-28 {
        font-size: 28px !important;
        line-height: 36px !important;
        }
        .mso .size-30,
        .ie .size-30 {
        font-size: 30px !important;
        line-height: 38px !important;
        }
        .mso .size-32,
        .ie .size-32 {
        font-size: 32px !important;
        line-height: 40px !important;
        }
        .mso .size-34,
        .ie .size-34 {
        font-size: 34px !important;
        line-height: 43px !important;
        }
        .mso .size-36,
        .ie .size-36 {
        font-size: 36px !important;
        line-height: 43px !important;
        }
        .mso .size-40,
        .ie .size-40 {
        font-size: 40px !important;
        line-height: 47px !important;
        }
        .mso .size-44,
        .ie .size-44 {
        font-size: 44px !important;
        line-height: 50px !important;
        }
        .mso .size-48,
        .ie .size-48 {
        font-size: 48px !important;
        line-height: 54px !important;
        }
        .mso .size-56,
        .ie .size-56 {
        font-size: 56px !important;
        line-height: 60px !important;
        }
        .mso .size-64,
        .ie .size-64 {
        font-size: 64px !important;
        line-height: 63px !important;
        }
        </style>

        <!--[if !mso]><!--><style type="text/css">
        @import url(https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,400italic,700italic|Ubuntu:400,700,400italic,700italic);
        </style><link href="https://fonts.googleapis.com/css?family=Roboto+Condensed:400,700,400italic,700italic|Ubuntu:400,700,400italic,700italic" rel="stylesheet" type="text/css" /><!--<![endif]--><style type="text/css">
        body{background-color:#fbfbfb}.logo a:hover,.logo a:focus{color:#1e2e3b !important}.mso .layout-has-border{border-top:1px solid #c8c8c8;border-bottom:1px solid #c8c8c8}.mso .layout-has-bottom-border{border-bottom:1px solid #c8c8c8}.mso .border,.ie .border{background-color:#c8c8c8}.mso h1,.ie h1{}.mso h1,.ie h1{font-size:26px !important;line-height:34px !important}.mso h2,.ie h2{}.mso h2,.ie h2{font-size:20px !important;line-height:28px !important}.mso h3,.ie h3{}.mso .layout__inner,.ie .layout__inner{}.mso .footer__share-button p{}.mso .footer__share-button p{font-family:Georgia,serif}
        </style><meta name="robots" content="noindex,nofollow" />
        <meta property="og:title" content="My First Campaign" />
        </head>
        <!--[if mso]>
        <body class="mso">
        <![endif]-->
        <!--[if !mso]><!-->
        <body class="full-padding" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;">
        <!--<![endif]-->
            <table class="wrapper" style="border-collapse: collapse;table-layout: fixed;min-width: 320px;width: 100%;background-color: #fbfbfb;" cellpadding="0" cellspacing="0" role="presentation"><tbody><tr><td>
            <div role="banner">
                <div class="preheader" style="Margin: 0 auto;max-width: 560px;min-width: 280px; width: 280px;width: calc(28000% - 167440px);">
                <div style="border-collapse: collapse;display: table;width: 100%;">
                <!--[if (mso)|(IE)]><table align="center" class="preheader" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 280px" valign="top"><![endif]-->
                    <div class="snippet" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 140px; width: 140px;width: calc(14000% - 78120px);padding: 10px 0 5px 0;color: #999;font-family: Georgia,serif;">

                    </div>
                <!--[if (mso)|(IE)]></td><td style="width: 280px" valign="top"><![endif]-->
                    <div class="webversion" style="display: table-cell;Float: left;font-size: 12px;line-height: 19px;max-width: 280px;min-width: 139px; width: 139px;width: calc(14100% - 78680px);padding: 10px 0 5px 0;text-align: right;color: #999;font-family: Georgia,serif;">

                    </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
                </div>
                <div class="header" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);" id="emb-email-header-container">
                <!--[if (mso)|(IE)]><table align="center" class="header" cellpadding="0" cellspacing="0" role="presentation"><tr><td style="width: 600px"><![endif]-->
                <div class="logo emb-logo-margin-box" style="font-size: 26px;line-height: 32px;Margin-top: 47px;Margin-bottom: 9px;color: #41637e;font-family: Avenir,sans-serif;Margin-left: 20px;Margin-right: 20px;" align="center">
                    <div class="logo-center" align="center" id="emb-email-header"><a style="text-decoration: none;transition: opacity 0.1s ease-in;color: #41637e;" href="https://www.going-link.com/"><img style="display: block;height: auto;width: 100%;border: 0;max-width: 205px;" src="cid:zy" alt="" width="205" /></a></div>
                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
            </div>
            <div>
            <div class="layout one-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: #ffffff;">
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #ffffff;"><td style="width: 600px" class="w560"><![endif]-->
                <div class="column" style="text-align: left;color: #565656;font-size: 14px;line-height: 21px;font-family: Georgia,serif;">

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;">
            <div style="mso-line-height-rule: exactly;mso-text-raise: 11px;vertical-align: middle;">
                <h1 class="size-24" style="Margin-top: 0;Margin-bottom: 0;font-style: normal;font-weight: normal;color: #565656;font-size: 20px;line-height: 28px;font-family: Avenir,sans-serif;" lang="x-size-24">&#29956;&#20113;&#31185;&#25216;&#32479;&#19968;&#35748;&#35777;&#36134;&#21495;</h1><p style="Margin-top: 20px;Margin-bottom: 0;font-family: ubuntu,sans-serif;"><span class="font-ubuntu">&#24744;&#22909;&#65292;&#24050;&#20026;&#24744;&#21019;&#24314;&#36134;&#21495;&#65292;&#20449;&#24687;&#22914;&#19979;&#65306;</span></p><ul style="Margin-top: 20px;Margin-bottom: 0;Margin-left: 24px;padding: 0;list-style-type: disc;"><li style="Margin-top: 20px;Margin-bottom: 0;Margin-left: 0;text-align: left;font-family: Ubuntu, sans-serif;"><span class="font-ubuntu"><strong>&#29992;&#25143;&#21517;</strong>: """ + sAMAccountName + """</span></li><li style="Margin-top: 0;Margin-bottom: 0;Margin-left: 0;font-family: Ubuntu,
        sans-serif;"><span class="font-ubuntu"><strong>&#21021;&#22987;&#23494;&#30721;</strong>: """ + pwd + """</span></li></ul><p style="Margin-top: 20px;Margin-bottom: 0;font-family: verdana,sans-serif;"><span class="font-verdana">&#8203;&#8203;<strong>&#21021;&#22987;&#23494;&#30721;&#21487;&#20197;&#20462;&#25913;</strong>&#65292;&#35831;&#21450;&#26102;&#20462;&#25913;&#23494;&#30721;&#65281;</span></p><p style="Margin-top: 20px;Margin-bottom: 20px;font-family: verdana,sans-serif;"><span class="font-verdana"><strong>&#36134;&#21495;&#23494;&#30721;&#20449;&#24687;&#20165;&#38480;&#26412;&#20154;&#20351;&#29992;</strong>&#65292;&#19981;&#24471;&#20511;&#19982;&#20182;&#20154;!</span></p>
            </div>
            </div>

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-bottom: 24px;">
            <div class="divider" style="display: block;font-size: 2px;line-height: 2px;Margin-left: auto;Margin-right: auto;width: 40px;background-color: #c8c8c8;">&nbsp;</div>
            </div>

                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
            </div>

            <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 20px;">&nbsp;</div>

            <div class="layout two-col fixed-width stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;background-color: #ffffff;">
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-fixed-width" style="background-color: #ffffff;"><td style="width: 300px" valign="top" class="w260"><![endif]-->
                <div class="column" style="text-align: left;color: #565656;font-size: 14px;line-height: 21px;font-family: Georgia,serif;max-width: 320px;min-width: 300px; width: 320px;width: calc(12300px - 2000%);Float: left;">

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;Margin-bottom: 24px;">
            <div class="btn btn--depth btn--medium" style="text-align:center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 12px;font-weight: bold;line-height: 22px;padding: 10px 20px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;border: 1px solid rgba(0, 0, 0, 0.25);box-shadow: inset 0 -3px 0 -1px rgba(0, 0, 0, 0.2), inset 0 2px 1px -1px #ffffff;text-shadow: 0 1px 0 rgba(0, 0, 0, 0.21);background-color: #38deba;font-family: Roboto Condensed, Arial Narrow, Avenir Next Condensed, Roboto, sans-serif;" href=\"""" + UUAP_URL + """\">&#33258;&#21161;&#20462;&#25913;&#23494;&#30721;</a><![endif]>
            <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://ldap.going-link.net/RDWeb/Pages/zh-CN/password.aspx" style="width:112px" arcsize="10%" strokecolor="#2AA68C" filled="t"><v:fill type="gradient" angle="180" color="#38DEBA" color2="#30BD9E"></v:fill><v:textbox style="mso-fit-shape-to-text:t" inset="0px,9px,0px,9px"><center style="font-size:12px;line-height:22px;color:#FFFFFF;font-family:Roboto Condensed,Arial Narrow,Avenir Next Condensed,Roboto,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">&#33258;&#21161;&#20462;&#25913;&#23494;&#30721;</center></v:textbox></v:roundrect><![endif]--></div>
            </div>

                </div>
                <!--[if (mso)|(IE)]></td><td style="width: 300px" valign="top" class="w260"><![endif]-->
                <div class="column" style="text-align: left;color: #565656;font-size: 14px;line-height: 21px;font-family: Georgia,serif;max-width: 320px;min-width: 300px; width: 320px;width: calc(12300px - 2000%);Float: left;">

                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 24px;Margin-bottom: 24px;">
            <div class="btn btn--depth btn--medium" style="text-align:center;">
                <![if !mso]><a style="border-radius: 4px;display: inline-block;font-size: 12px;font-weight: bold;line-height: 22px;padding: 10px 20px;text-align: center;text-decoration: none !important;transition: opacity 0.1s ease-in;color: #ffffff !important;border: 1px solid rgba(0, 0, 0, 0.25);box-shadow: inset 0 -3px 0 -1px rgba(0, 0, 0, 0.2), inset 0 2px 1px -1px #ffffff;text-shadow: 0 1px 0 rgba(0, 0, 0, 0.21);background-color: #42dedb;font-family: Trebuchet MS, Lucida Grande, Lucida Sans Unicode, sans-serif;" href=\"""" + UUAP_MANUAL_URL + """\">&#24110;&#21161;&#35828;&#26126;&#25991;&#26723;</a><![endif]>
            <!--[if mso]><p style="line-height:0;margin:0;">&nbsp;</p><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="https://open-console.going-link.com/#/knowledge/project/doc/3?baseName=SRM%E7%9F%A5%E8%AF%86%E5%BA%93&id=16&name=SRM%E4%BA%A7%E5%93%81%E5%B9%B3%E5%8F%B0&orgId=1&organizationId=1&spaceId=105&type=project" style="width:112px" arcsize="10%" strokecolor="#32A6A4" filled="t"><v:fill type="gradient" angle="180" color="#42DEDB" color2="#38BDBA"></v:fill><v:textbox style="mso-fit-shape-to-text:t" inset="0px,9px,0px,9px"><center style="font-size:12px;line-height:22px;color:#FFFFFF;font-family:Trebuchet MS,Lucida Grande,Lucida Sans Unicode,sans-serif;font-weight:bold;mso-line-height-rule:exactly;mso-text-raise:4px">&#24110;&#21161;&#35828;&#26126;&#25991;&#26723;</center></v:textbox></v:roundrect><![endif]--></div>
            </div>

                </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
            </div>

            <div style="mso-line-height-rule: exactly;line-height: 20px;font-size: 20px;">&nbsp;</div>


            <div role="contentinfo">
                <div class="layout email-footer stack" style="Margin: 0 auto;max-width: 600px;min-width: 320px; width: 320px;width: calc(28000% - 167400px);overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;">
                <div class="layout__inner" style="border-collapse: collapse;display: table;width: 100%;">
                <!--[if (mso)|(IE)]><table align="center" cellpadding="0" cellspacing="0" role="presentation"><tr class="layout-email-footer"><td style="width: 400px;" valign="top" class="w360"><![endif]-->
                    <div class="column wide" style="text-align: left;font-size: 12px;line-height: 19px;color: #999;font-family: Georgia,serif;Float: left;max-width: 400px;min-width: 320px; width: 320px;width: calc(8000% - 47600px);">
                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">

                        <div style="font-size: 12px;line-height: 19px;">
                        <div>&#29956;&#20113;&#31185;&#25216;</div>
                        </div>
                        <div style="font-size: 12px;line-height: 19px;Margin-top: 18px;">

                        </div>
                        <!--[if mso]>&nbsp;<![endif]-->
                    </div>
                    </div>
                <!--[if (mso)|(IE)]></td><td style="width: 200px;" valign="top" class="w160"><![endif]-->
                    <div class="column narrow" style="text-align: left;font-size: 12px;line-height: 19px;color: #999;font-family: Georgia,serif;Float: left;max-width: 320px;min-width: 200px; width: 320px;width: calc(72200px - 12000%);">
                    <div style="Margin-left: 20px;Margin-right: 20px;Margin-top: 10px;Margin-bottom: 10px;">
                    </div>
                    </div>
                <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
                </div>
                </div>
            </div>
            <div style="line-height:40px;font-size:40px;">&nbsp;</div>
            </div></td></tr></tbody></table>
        </body></html>
        """
        msgAlternative.attach(MIMEText(mail_msg, 'html', 'utf-8'))
        img_url = os.path.join(settings.BASE_DIR, r"static\images\zy.png")
        fp = open(img_url, 'rb')       # 图片位置
        msgImage = MIMEImage(fp.read())
        fp.close()
        # 定义图片 ID，在 HTML 文本中引用
        msgImage.add_header('Content-ID', '<zy>')
        message.attach(msgImage)
        smtpObj.sendmail(from_addr=mail_user, to_addrs=[mail_rcv], msg=str(message))
        logger.info("测试发送邮件成功!" + "测试发件人: " + mail_user + "测试收件人: " + mail_rcv)
        return 0
    except smtplib.SMTPException as e:
        error_logger(str(e))
        return 1
    smtpObj.quit()
