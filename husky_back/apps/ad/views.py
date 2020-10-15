import re
import json
import logging
import random
import string
from datetime import datetime, timedelta

from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
# redis
from django_redis import get_redis_connection
from ldap3 import (ALL, ALL_ATTRIBUTES, MODIFY_REPLACE, NTLM, SASL, SIMPLE,
                   SUBTREE, SYNC, Connection, Server)

from ad import tasks

logger = logging.getLogger("info_logger")
error_logger = logging.getLogger("error_logger")

# Create your views here.


@csrf_exempt
def ldap_login(request):
    '''LDAP登录方式
    '''
    if request.method == 'POST':
        # 前端传值
        req_data = json.loads(request.body)
        ldap = req_data.get("ldap")
        ldap_pwd = req_data.get("ldapPwd")
        type_req = req_data.get("type")
        # 从redis读取AD配置
        conn_redis = get_redis_connection("configs_cache")
        str_data = conn_redis.get('AdServerConfig')
        json_data = json.loads(str_data)
        adServerIp = json_data['adServerIp']
        baseDn = json_data['baseDn']
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
                attributes=['cn', 'givenName', 'mail', 'sAMAccountName'],
                paged_size=5
            )
            # 如果有此用户
            if res:
                entry = conn_ad.response[0]
                if 'attributes' in entry.keys():
                    # 校验dn的密码
                    dn = entry['dn']
                    try:
                        SERVER = Server(host=adServerIp,
                                        port=636,               # 636安全端口
                                        use_ssl=True,
                                        get_info=ALL,
                                        connect_timeout=3)      # 连接超时为3秒
                        conn_ad_login = Connection(server=SERVER, user=dn, password=ldap_pwd, check_names=True, lazy=False, raise_exceptions=False)
                        conn_ad_login.bind()
                        if conn_ad_login.result["result"] == 0:
                            res = {'code': 0,
                                   'message': 'LDAP用户登录成功!',
                                   'status': 'ok',
                                   }
                            return JsonResponse(res)
                        else:
                            res = {'code': -1,
                                   'message': '密码错误!',
                                   'status': 'error',
                                   }
                            return JsonResponse(res)
                    except Exception:
                        message = conn_ad_login.result["message"]
                        res = {'code': -1,
                               'message': message,
                               'status': 'error',
                               }
                        return res
                else:
                    res = {'code': -1,
                           'message': '无此LDAP用户!',
                           'data': ''}
                    return JsonResponse(res)
            else:
                res = {'code': -1,
                       'message': 'LDAP服务器错误!',
                       'data': ''}
                return JsonResponse(res)


@csrf_exempt
def modify_ad_account_pwd(dn: str) -> str:
    '''AD域自动修改密码方法
    '''
    conn_ad = access_ad_server()
    new_pwd = generate_pwd(8)
    old_pwd = ''
    # 初始化密码
    modify_pwd_res = conn_ad.extend.microsoft.modify_password(dn, new_pwd, old_pwd)
    # 设置首次登录必须修改密码
    # conn_ad.modify(dn, {'pwdLastSet': (2, [0])})
    return new_pwd


@csrf_exempt
def test_send_mail(request):
    '''测试邮件连通性
    '''
    if request.method == 'POST':
        # 接受前端请求数据
        data_req = json.loads(request.body)
        mailServerSmtpServer = data_req['mailServerSmtpServer']
        mailServerAdmin = data_req['mailServerAdmin']
        mailServerAdminPwd = data_req['mailServerAdminPwd']
        mailServerSender = data_req['mailServerSender']
        adAccountHelpFile = data_req['adAccountHelpFile']
        testMailReceiver = data_req['testMailReceiver']
        res = dict()
        try:
            # 测试发邮件异步任务
            test_send_res = tasks.test_send_create_ad_user_init_info_mail.delay(
                sAMAccountName='Z66666',
                pwd='test6666',
                mail_host=mailServerSmtpServer,
                mail_user=mailServerAdmin,
                mail_pwd=mailServerAdminPwd,
                mail_sender=mailServerSender,
                ad_help_file_url=adAccountHelpFile,
                mail_rcv=testMailReceiver,
            )
            res = {
                'code': 0,
                'message': '测试发送邮件任务已排队，请邮箱查收!',
            }
        except BaseException as e:
            error_logger.error(str(e))
            # 组装返回结果
            res = {
                'code': -1,
                'message': '发送邮件失败!',
            }
        return JsonResponse(res)


@csrf_exempt
def save_mail_server_config(request):
    '''保存邮件服务器配置信息
    '''
    if request.method == 'POST':
        # 接受前端请求数据
        data_req = json.loads(request.body)
        res = dict()
        try:
            conn = get_redis_connection("configs_cache")
            tmp = json.dumps(data_req)
            conn.set('MailServerConfig', tmp)
            # 组装返回结果
            res = {
                'code': 0,
                'message': '保存邮件服务器配置成功!',
            }
        except BaseException:
            # 组装返回结果
            res = {
                'code': -1,
                'message': '保存邮件服务器配置失败!',
            }
        return JsonResponse(res)


@csrf_exempt
def load_mail_server_config_form_data(request):
    '''默认从redis读取邮件服务器配置信息
    '''
    res = dict()
    try:
        # 从redis取配置信息
        conn = get_redis_connection("configs_cache")
        str_data = conn.get('MailServerConfig')
        json_data = json.loads(str_data)
        res = {
            'code': 0,
            'message': '获取邮件域服务器连接配置信息成功!',
            'body': json_data
        }
    except BaseException:
        res = {
            'code': -1,
            'message': '获取邮件服务器连接配置信息失败!请配置邮件服务器信息!',
        }
    return JsonResponse(res)


@csrf_exempt
def load_ad_server_config_form_data(request):
    '''默认从redis读取AD服务器配置信息
    '''
    res = dict()
    try:
        # 从redis取配置信息
        conn = get_redis_connection("configs_cache")
        str_data = conn.get('AdServerConfig')
        json_data = json.loads(str_data)
        res = {
            'code': 0,
            'message': '获取AD域服务器连接配置信息成功!',
            'body': json_data
        }
    except BaseException:
        res = {
            'code': -1,
            'message': '获取AD域服务器连接配置信息失败!请配置AD服务器信息!',
        }
    return JsonResponse(res)


@csrf_exempt
def test_access_ad_server(json_data) -> object:
    '''连接生产AD域服务器，返回连接对象
    '''
    SERVER = Server(host=json_data['adServerIp'],
                    port=636,               # 636安全端口
                    use_ssl=True,
                    get_info=ALL,
                    connect_timeout=3)      # 连接超时为3秒
    try:
        conn = Connection(
            server=SERVER,
            user=json_data['adminAccount'],
            password=json_data['adminPwd'],
            auto_bind=True,
            read_only=False,                # 禁止修改数据True
            receive_timeout=3)             # 10秒内没返回消息则触发超时异常
        logger.info("测试连接AD域服务器成功! DN:%s 连接AD结果: %s" % (json_data['adminAccount'], conn.bind()))
        return 0
    except BaseException:
        error_logger.error("测试连接AD域服务器失败! DN:%s 连接AD结果: %s" % (json_data['adminAccount'], conn.bind()))
        return -1
    finally:
        conn.closed


@csrf_exempt
def test_ad_server_config_is_connect(request):
    '''测试前端AD服务器配置连通性 同步任务
    '''
    if request.method == 'POST':
        data_req = json.loads(request.body)
        res = dict()
        try:
            # 测试连接
            access_ad_res = test_access_ad_server(data_req)
            if access_ad_res == 0:
                res = {
                    'code': access_ad_res,
                    'message': 'AD域服务器连接成功!',
                }
            else:
                res = {
                    'code': access_ad_res,
                    'message': 'AD域服务器连接失败!',
                }
        except BaseException:
            res = {
                'code': -1,
                'message': 'AD域服务器连接失败!',
            }
        return JsonResponse(res)


@csrf_exempt
def save_ad_server_config(request):
    '''保存AD域配置信息
    '''
    if request.method == 'POST':
        # 接受前端请求数据
        data_req = json.loads(request.body)
        res = dict()
        try:
            conn = get_redis_connection("configs_cache")
            tmp = json.dumps(data_req)
            conn.set('AdServerConfig', tmp)
            # 组装返回结果
            res = {
                'code': 0,
                'message': '保存AD域服务器配置成功!',
            }
        except BaseException:
            # 组装返回结果
            res = {
                'code': -1,
                'message': '保存AD域服务器配置失败!',
            }
        return JsonResponse(res)


@csrf_exempt
def access_ad_server() -> object:
    '''连接生产AD域服务器，返回连接对象
    '''
    # 从redis读取AD配置
    conn_redis = get_redis_connection("configs_cache")
    str_data_AdServerConfig = conn_redis.get('AdServerConfig')
    json_data_AdServerConfig = json.loads(str_data_AdServerConfig)
    adServerIp = json_data_AdServerConfig['adServerIp']
    adminAccount = json_data_AdServerConfig['adminAccount']
    adminPwd = json_data_AdServerConfig['adminPwd']

    server_ad = Server(host=adServerIp,
                       port=636,               # 636安全端口
                       use_ssl=True,
                       get_info=ALL,
                       connect_timeout=10)      # 连接超时为10秒
    try:
        conn_ad = Connection(
            server=server_ad,
            user=adminAccount,
            password=adminPwd,
            auto_bind=True,
            read_only=False,                # 禁止修改数据True
            receive_timeout=10)             # 10秒内没返回消息则触发超时异常
        logger.info("DN:%s 连接AD结果: %s" % (adminAccount, conn_ad.bind()))
        return conn_ad
    except BaseException as e:
        # 如果AD服务器连接超时,则需要返回网络错误，不能返回程序错误
        error_logger.error(str(e))
        # LDAP服务器连接超时!请检查VPN是否连接!
        return False
    # finally:
    #     return False


def back_ad_account_to_redis(searchFilterUser, baseDnEnabled, conn_redis_accounts) -> list:
    '''从AD服务器获取用户数据并转储到redis
    '''
    # 连接AD域
    conn_ad = access_ad_server()
    # 查询AD服务器
    attr = ['objectGUID',           # LDAP唯一标识符
            'sAMAccountName',       # SAM账号
            'distinguishedName',    # dn
            'accountExpires',       # 账户过期时间
            'pwdLastSet',           # 用户下次登录必须修改密码
            'whenCreated',          # 创建时间
            'whenChanged',          # 修改时间
            'displayName',          # 显示名
            'sn',                   # 姓
            'givenName',            # 名
            'mail',                 # 邮箱
            'mobile',               # 移动电话
            'telephoneNumber',      # 电话号码
            'company',              # 公司
            'department',           # 部门
            'title',                # 职务
            'badPwdCount',          # 密码错误次数
            ]
    entry_list = conn_ad.extend.standard.paged_search(
        search_filter=searchFilterUser,
        search_base=baseDnEnabled,
        search_scope=SUBTREE,
        attributes=attr,
        paged_size=500,
        generator=False)        # 关闭生成器，结果为列表
    # 存入数据库
    body = list()
    for user in entry_list:
        # 从LDAP服务器查询任何数据都要作有无此属性的判断
        body.append(
            {
                'objectGUID': user['attributes']['objectGUID'],
                'sAMAccountName': user['attributes']['sAMAccountName'],
                'accountExpires': str(user['attributes']['accountExpires']),
                'pwdLastSet': str(user['attributes']['pwdLastSet']),
                'whenCreated': (user['attributes']['whenCreated'] + timedelta(hours=8)).strftime('%Y-%m-%d %H:%M:%S'),
                'whenChanged': (user['attributes']['whenChanged'] + timedelta(hours=8)).strftime('%Y-%m-%d %H:%M:%S'),
                'displayName': user['attributes']['displayName'],
                # 'department': '/'.join([x.replace('OU=', '') for x in user['attributes']['distinguishedName'].split(',', 1)[1].rsplit(',', 2)[0].split(',')][::-1]),
                'department': user['attributes']['distinguishedName'].split(',', 1)[1].split(',')[0].replace('OU=', ''),
                'title': user['attributes']['title'],
                'mail': user['attributes']['mail'],
                'mobile': user['attributes']['mobile'] if hasattr(user['attributes'], 'mobile') else '暂无',
                'telephoneNumber': user['attributes']['telephoneNumber'],
            }
        )
        # break
    # 将最新的数据覆盖过来
    AdServerAccounts = dict()
    AdServerAccounts['result'] = body
    json_object = json.dumps(AdServerAccounts)
    conn_redis_accounts.set('AdServerAccounts', json_object)
    logger.info('*********更新redis********')
    return body


@csrf_exempt
def fetch_ad_account_list(request) -> json:
    '''查询AD域的账户列表,前端分页，后端传符合条件的全量数据
    '''
    if request.method == 'GET':
        # 前端传值
        sAMAccountName = request.GET.get('sAMAccountName')      # ldap账号
        displayName = request.GET.get('displayName')            # 姓名
        department = request.GET.get('department')              # 部门
        whenCreatedRange = request.GET.getlist('whenCreated')            # 创建时间
        whenChangedRange = request.GET.getlist('whenChanged')            # 创建时间
        # 从redis的账号库读取数据
        conn_redis_accounts = get_redis_connection("ad_accounts_cache")
        str_data = conn_redis_accounts.get('AdServerAccounts')
        if str_data is not None:
            # 直接从redis取数据
            json_data = json.loads(str_data)
            body = json_data['result']
        else:
            # 从redis的配置库读取AD配置 后数据由LDAP服务器返回
            conn_redis_configs = get_redis_connection("configs_cache")
            str_data_config = conn_redis_configs.get('AdServerConfig')
            json_data = json.loads(str_data_config)
            searchFilterUser = json_data['searchFilterUser']
            baseDnEnabled = json_data['baseDnEnabled']
            body = back_ad_account_to_redis(searchFilterUser, baseDnEnabled, conn_redis_accounts)
        # 在这里对查询到的的数据进行查询过滤
        if sAMAccountName is not None and sAMAccountName != '':       # 根据 ldap账号 模糊查询
            body = [person for person in body if sAMAccountName in person['sAMAccountName']]
        if displayName is not None and displayName != '':       # 根据 displayName 模糊查询
            body = [person for person in body if displayName in person['displayName']]
        if department is not None and department != '':       # 根据 department 模糊查询
            body = [person for person in body if department in person['department']]
        if whenCreatedRange is not None and whenCreatedRange != []:
            body = [person for person in body if whenCreatedRange[0] < person['whenCreated'] < whenCreatedRange[1]]
        if whenChangedRange is not None and whenChangedRange != []:
            body = [person for person in body if whenChangedRange[0] < person['whenChanged'] < whenChangedRange[1]]
        # 组装返回结果
        res = {
            'code': 0,
            'message': '查询成功!',
            'data': body
        }
        return JsonResponse(res)


@csrf_exempt
def add_ad_account(request):
    '''创建AD域账户 结果返回码
    0: '创建账户成功!'
    1: '新增对象【' + dn + '】成功! 但是发送初始化账号密码失败!'
    68: '账户已经存在,请勿重复创建! 忘记密码?'
    32: '对象不存在OU,且未创建成功OU错误'
    -1: '创建对象: ' + dn + ' 失败!其他未知错误'
    -2: '检查并创建OU失败，未知原因!'
    '''
    if request.method == 'POST':
        data_req = json.loads(request.body)
        # 接受前端请求数据
        eid = data_req.get('eid')
        displayName = data_req.get('displayName')
        department = data_req.get('department')
        mail = data_req.get('mail')
        tel = data_req.get('telephoneNumber')
        title = data_req.get('title')

        # 从redis的配置库读取AD配置
        conn_redis_configs = get_redis_connection("configs_cache")
        str_data_config = conn_redis_configs.get('AdServerConfig')
        json_data = json.loads(str_data_config)
        baseDn = json_data['baseDn']
        zyPrefix = json_data['zyPrefix']
        handPrefix = json_data['handPrefix']
        baseDnHand = json_data['baseDnHand']

        # 用户组织判断
        if '甄云科技' in department and '.' in department and department.split('.')[0] == '甄云科技':
            sAMAccountName_prefix = zyPrefix
            department_list = department.split('.')
            department_list.insert(1, '上海总部')
            dn = 'CN=' + str(displayName + str(eid)) + ',' + 'OU=' + ',OU='.join(department_list[::-1]) + ',' + baseDn
        elif '汉得信息' in department:
            sAMAccountName_prefix = handPrefix
            dn = 'CN=' + str(displayName + str(eid)) + ',' + baseDnHand
        else:
            res = {
                'code': -1,
                'message': '暂不支持创建非子母公司账号!',
            }
            return JsonResponse(res)
        sAMAccountName = sAMAccountName_prefix + str(eid).zfill(6)
        # 组装AD域创建用户所需要的数据
        user_info = [sAMAccountName, dn, displayName, mail, tel, title]
        tasks.create_ad_obj.delay(info=user_info)     # 异步任务
        res = {
            'code': 0,
            'message': '创建任务排队中，请稍后复查执行结果!',
        }
        logger.info('创建用户异步任务: ' + dn)
        return JsonResponse(res)


@csrf_exempt
def reset_ad_account_pwd(request):
    '''重设AD域账户密码
    '''
    if request.method == 'POST':
        data_req = json.loads(request.body)
        # 接受前端请求数据
        resetPwdDisplayName = data_req.get('resetPwdDisplayName')
        resetPwdMail = data_req.get('resetPwdMail')
        resetPwdSam = data_req.get('resetPwdSam')
        # 密码生成逻辑
        if 'newManualPwd' in data_req.keys():       # 手动设置密码 后端再次校验密码强度
            newManualPwd = data_req.get('newManualPwd')       # 前端传过来的新密码
            if newManualPwd is not None:
                pwd_judge_res = judge_pwd_level(newManualPwd)
                if not pwd_judge_res:
                    res = {
                        'code': -1,
                        'message': '八位密码复杂度要求: 大小写、数字、特殊字符【!@#$%^&*?】四个必须满足三个!',
                    }
                    return JsonResponse(res)
        else:           # 自动设置密码
            newManualPwd = generate_pwd(8)
        # 异步任务
        if newManualPwd:
            filter_phrase_by_sAMAccountName = "(&(objectclass=person)(sAMAccountName=" + resetPwdSam + "))"
            info = [resetPwdSam, resetPwdMail, filter_phrase_by_sAMAccountName, newManualPwd]
            tasks.reset_ad_user_pwd.delay(info=info)
        res = {
            'code': 0,
            'message': '修改密码任务排队中，请稍后复查执行结果!',
        }
        return JsonResponse(res)


def judge_pwd_level(pwd):
    '''密码复杂度判断
    '''
    level = 0
    NUMBER = re.compile(r'[0-9]')
    LOWER_CASE = re.compile(r'[a-z]')
    UPPER_CASE = re.compile(r'[A-Z]')
    OTHERS = re.compile(r'[^0-9A-Za-z]')
    if len(pwd) < 8:
        return False
    else:
        if NUMBER.search(pwd):
            level += 1
        if LOWER_CASE.search(pwd):
            level += 1
        if UPPER_CASE.search(pwd):
            level += 1
        if OTHERS.search(pwd):
            level += 1
        # 密码复杂度要求
        if level >= 3:
            return True
        else:
            return False


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
    pwd_list.extend(random.sample('!@#$%^&*?', a))
    # 从四种类别中再取余数个字符
    pwd_list.extend(random.sample(string.digits + string.ascii_lowercase + string.ascii_uppercase + '!@#$%^&*?', b))
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
    # 从redis的配置库读取AD配置
    conn_redis_configs = get_redis_connection("configs_cache")
    str_data_AdServerConfig = conn_redis_configs.get('AdServerConfig')
    json_data_AdServerConfig = json.loads(str_data_AdServerConfig)
    searchFilterOu = json_data_AdServerConfig['searchFilterOu']

    if ou_list is None:
        ou_list = []
    conn.search(ou, searchFilterOu)      # 判断OU存在性

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
