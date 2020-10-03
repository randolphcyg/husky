import { request } from 'umi';

export interface LoginParamsType {
  username: string;
  password: string;
  ldap: string;
  ldapPwd: string;
  type: string;
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
