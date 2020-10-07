import logo from '@/assets/logo.svg';
import Footer from '@/components/Footer';
import { huskyAccountLogin, ldapAccountLogin, LoginParamsType } from '@/services/login';
import { Alert, Checkbox, message } from 'antd';
import React, { useState } from 'react';
import { history, History, Link, SelectLang, useModel } from 'umi';
import LoginFrom from './components/Login';
import styles from './style.less';

const { Tab, Username, Password, Ldap, LdapPwd, Submit } = LoginFrom;

const LoginMessage: React.FC<{
  content: string;
}> = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

/**
 * 此方法会跳转到 redirect 参数所在的位置
 */
const replaceGoto = () => {
  setTimeout(() => {
    const { query } = history.location;
    const { redirect } = query as { redirect: string };
    if (!redirect) {
      history.replace('/');
      return;
    }
    (history as History).replace(redirect);
  }, 10);
};

const Login: React.FC<{}> = () => {
  const [userLoginState, setUserLoginState] = useState<API.LoginStateType>({});
  const [submitting, setSubmitting] = useState(false);
  const { initialState, setInitialState } = useModel('@@initialState');
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState<string>('ldap');
  const handleSubmit = async (values: LoginParamsType) => {
    setSubmitting(true);
    if (type == 'ldap') {   // ldap登录方式
      try {
        // 登录 ldapAccountLogin
        const msg = await ldapAccountLogin({ ...values, type });
        if (msg.status === 'ok' && initialState) {
          message.success(msg.message);
          const currentUser = await initialState?.fetchUserInfo(values['ldap']);
          setInitialState({
            ...initialState,
            currentUser,
          });
          replaceGoto();
          return;
        } else {
          message.error(msg.message);
        }
        // 如果失败去设置用户错误信息
        setUserLoginState(msg);
      } catch (error) {
        message.error('登录失败，请重试!');
      }
    } else if (type == 'account') {   // account登录方式
      try {
        // 登录 huskyAccountLogin 
        const msg = await huskyAccountLogin({ ...values, type });
        if (msg.status === 'ok' && initialState) {
          message.success(msg.message);
          const currentUser = await initialState?.fetchUserInfo(values['ldap']);
          setInitialState({
            ...initialState,
            currentUser,
          });
          replaceGoto();
          return;
        } else {
          message.error(msg.message);
        }
        // 如果失败去设置用户错误信息
        setUserLoginState(msg);
      } catch (error) {
        message.error('登录失败，请重试!');
      }
    }
    // 表单提交状态
    setSubmitting(false);
  };

  const { status, type: loginType } = userLoginState;

  return (
    <div className={styles.container}>
      <div className={styles.lang}>
        <SelectLang />
      </div>
      <div className={styles.content}>
        <div className={styles.top}>
          <div className={styles.header}>
            <Link to="/">
              <img alt="logo" className={styles.logo} src={logo} />
              <span className={styles.title}>账号中心及可视化综合平台</span>
            </Link>
          </div>
          <div className={styles.desc}>世界上几乎没有一蹴而就的事情，指望努力比希冀希望更有意义</div>
        </div>

        <div className={styles.main}>
          <LoginFrom activeKey={type} onTabChange={setType} onSubmit={handleSubmit}>
            <Tab key="ldap" tab="ldap登录">
              {status === 'error' && loginType === 'ldap' && !submitting && (
                <LoginMessage content="ldap账号或密码错误!" />
              )}
              <Ldap
                name="ldap"
                placeholder="ldap账号"
                rules={[
                  {
                    required: true,
                    message: '请输入ldap账号!',
                  },
                ]}
              />
              <LdapPwd
                name="ldapPwd"
                placeholder="ldap密码"
                rules={[
                  {
                    required: true,
                    message: '请输入ldap密码!',
                  },
                ]}
              />
            </Tab>
            <Tab key="account" tab="普通登录">
              {status === 'error' && loginType === 'account' && !submitting && (
                <LoginMessage content="账户或密码错误!" />
              )}
              <Username
                name="username"
                placeholder="用户名"
                rules={[
                  {
                    required: true,
                    message: '请输入用户名!',
                  },
                ]}
              />
              <Password
                name="password"
                placeholder="密码"
                rules={[
                  {
                    required: true,
                    message: '请输入密码!',
                  },
                ]}
              />
            </Tab>
            <div>
              <Checkbox checked={autoLogin} onChange={(e) => setAutoLogin(e.target.checked)}>
                自动登录
              </Checkbox>
              <a
                style={{
                  float: 'right',
                }}
              >
                忘记密码
              </a>
            </div>
            <Submit loading={submitting}>登录</Submit>
          </LoginFrom>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;