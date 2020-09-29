import { request } from 'umi';

export interface LoginParamsType {
  username: string;
  password: string;
  mobile: string;
  captcha: string;
  type: string;
}

// husky系统自带登录方法
export async function huskyAccountLogin(params: LoginParamsType) {
  return request<API.LoginStateType>('/api/login/', {
    method: 'POST',
    data: params,
  });
}

export async function getFakeCaptcha(mobile: string) {
  return request(`/api/login/captcha?mobile=${mobile}`);
}

export async function outLogin() {
  return request('/api/login/outLogin');
}

// ldap登录方式
export async function ldapAccountLogin(params: LoginParamsType) {
  return request<API.LoginStateType>('/api/ldapLogin/', {
    method: 'POST',
    data: params,
  });
}