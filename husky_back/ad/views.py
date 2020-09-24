from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.db import connections
import json
from ldap3 import (ALL, ALL_ATTRIBUTES, MODIFY_REPLACE, NTLM, SASL, SIMPLE,
                   SUBTREE, SYNC, Connection, Server)
import winrm
from django.conf import settings
import random
import re
import string
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
            receive_timeout=3)             # 10秒内没返回消息则触发超时异常
        print("distinguishedName:%s res: %s" % (settings.AD_ADMIN, conn.bind()))
        return conn
    except BaseException as e:
        print(e)
        print("AD域连接失败，请检查IP/账户/密码")
    # finally:
    #     conn.closed


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
    if request.method == 'POST':
        data_req = json.loads(request.body)
        # 接受前端请求数据
        eid = data_req.get('eid')
        name = data_req.get('name')
        department = data_req.get('department')
        email = data_req.get('email')
        tel = data_req.get('tel')
        title = data_req.get('title')
        # 准备AD域创建用户所需要的数据
        # 用户组织判断
        if department.split('.')[0] == '甄云科技':
            sam_prefix = settings.ZHENYUN_SAM_PREFIX
            department_list = department.split('.')
            department_list.insert(1, '上海总部')
            dn = 'CN=' + str(name + str(eid)) + ',' + 'OU=' + ',OU='.join(department_list[::-1]) + ',' + settings.BASE_DN
        else:
            sam_prefix = settings.HAND_SAM_PREFIX
            dn = settings.HAND_BASE_DN + ',' + settings.BASE_DN
        sam = sam_prefix + str(eid).zfill(6)
        user_info = [sam, dn, name, email, tel, title]

        create_res_code = create_obj(info=user_info)     # 创建对象结果，创建成功返回数值0
        res_code_map = {
            0: '创建用户成功!',
            1: '新增对象【' + dn + '】成功! 但是发送初始化账号密码失败!',
            68: '用户已经存在,请勿重复创建! 忘记密码?',
            32: '对象不存在OU,且未创建成功OU错误',
            -1: '创建对象: ' + dn + ' 失败!其他未知错误',
            -2: '检查并创建OU失败，未知原因!',
        }
        # 组装返回结果
        res = {
            'code': create_res_code,
            'message': res_code_map[create_res_code],
        }
        return JsonResponse(res)


@csrf_exempt
def create_obj(dn=None, type='user', info=None):
    '''AD域创建对象的公共方法
    '''
    object_class = {'user': ['user', 'posixGroup', 'top'],
                    'ou': ['organizationalUnit', 'posixGroup', 'top'],
                    }
    if info is not None:
        [sam, dn, name, email, tel, title] = info
        user_attr = {'sAMAccountname': sam,      # 登录名
                     'userAccountControl': 544,  # 启用账户
                     'displayname': name,        # 姓名
                     'givenName': name[0:1],     # 姓
                     'sn': name[1:],             # 名
                     'title': title,             # 头衔
                     'mail': email,              # 邮箱
                     'telephoneNumber': tel,     # 电话号
                     }
    else:
        user_attr = None
    # 创建之前需要对dn中的OU部分进行判断，如果没有需要创建
    dn_base = dn.split(',', 1)[1]
    # 用到的时候连接AD服务器
    conn = accessADServer()
    check_ou_res = check_ou(conn, dn_base)
    if not check_ou_res:
        return -2
    else:
        conn.add(dn=dn, object_class=object_class[type], attributes=user_attr)
        add_result = conn.result

        if add_result['result'] == 0:
            if type == 'user':          # 若是新增用户对象，则需要一些初始化操作
                conn.modify(dn, {'userAccountControl': [('MODIFY_REPLACE', 512)]})         # 激活用户                                                               # 如果是用户时
                new_pwd = generate_pwd(8)
                old_pwd = ''
                conn.extend.microsoft.modify_password(dn, new_pwd, old_pwd)                # 初始化密码
                # 此处将生成的账号密码邮件发送给对应人员
                save_res = send_create_ad_user_init_info_mail(sam, new_pwd)
                if save_res:
                    return 0
                else:
                    return 1
                    # 此时密码请保留一份
                # 密码设置为下次登录需要修改密码
                # conn.modify(dn, {'pwdLastSet': (2, [0])})                                  # 设置第一次登录必须修改密码
        else:
            return add_result['result']


@csrf_exempt
def generate_pwd(count):
    '''
    @param count{int} 所需密码长度
    @return: pwd: 生成的随机密码
    @msg: 生成随机密码，必有数字、大小写、特殊字符且数目伪均等；
    '''
    pwd_list = []
    a, b = count // 4, count % 4
    # 四种类别先均分除数个字符
    pwd_list.extend(random.sample(string.digits, a))
    pwd_list.extend(random.sample(string.ascii_lowercase, a))
    pwd_list.extend(random.sample(string.ascii_uppercase, a))
    pwd_list.extend(random.sample('!@#$%^&*()', a))
    # 从四种类别中再取余数个字符
    pwd_list.extend(random.sample(string.digits + string.ascii_lowercase + string.ascii_uppercase + '!@#$%^&*()', b))
    random.shuffle(pwd_list)
    pwd_str = ''.join(pwd_list)
    return pwd_str


@csrf_exempt
def check_ou(conn, ou, ou_list=None):
    '''
    @param {type}
    @return:
    @msg: 递归函数
    如何判断OU是修改了名字而不是新建的：当一个OU里面没有人就判断此OU被修改了名字，删除此OU；
    不管是新建还是修改了名字，都会将人员转移到新的OU下面：需要新建OU则创建OU后再添加/转移人员
    check_ou的作用是为人员的变动准备好OU
    '''
    if ou_list is None:
        ou_list = []
    conn.search(ou, settings.OU_SEARCH_FILTER)      # 判断OU存在性

    while conn.result['result'] == 0:
        if ou_list:
            for ou in ou_list[::-1]:
                conn.add(ou, 'organizationalUnit')
        return True
    else:
        ou_list.append(ou)
        ou = ",".join(ou.split(",")[1:])
        check_ou(conn, ou, ou_list)  # 递归判断
        return True


@csrf_exempt
def send_create_ad_user_init_info_mail(sam: string, pwd: string) -> bool:
    '''创建账户成功，给该用户邮箱发送邮件
    sam: AD账号
    pwd: AD账号密码
    '''
    print(sam, pwd)
    return True
