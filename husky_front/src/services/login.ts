import { request } from 'umi';

export interface LoginParamsType {
  username: string; // 系统账号
  password: string; // 系统密码
  ldap: string; // LDAP账号
  ldapPwd: string; // LDAP密码
  type: string; // 登录类型
}

// ldap登录方式
export async function ldapAccountLogin(params: LoginParamsType) {
  return request<API.LoginStateType>('/api/ldapLogin/', {
    method: 'POST',
    data: params,
  });
}

// husky系统自带登录方法
export async function huskyAccountLogin(params: LoginParamsType) {
  return request<API.LoginStateType>('/api/login/', {
    method: 'POST',
    data: params,
  });
}

// 登出
export async function outLogin() {
  return request('/api/login/outLogin');
}
