declare namespace API {
  export interface CurrentUser {
    avatar?: string; // 头像
    name?: string; // 姓名
    title?: string; // 职位
    group?: string; // 组
    signature?: string; // 签名
    tags?: {
      key: string;
      label: string;
    }[];
    userid?: string;
    access?: 'user' | 'guest' | 'admin'; // 权限
    unreadCount?: number;
  }

  export interface LoginStateType {
    status?: 'ok' | 'error'; // 登录状态
    type?: string; // 登录类型
    message?: string; // 登录返回消息
  }

  export interface NoticeIconData {
    id: string;
    key: string;
    avatar: string;
    title: string;
    datetime: string;
    type: string;
    read?: boolean;
    description: string;
    clickClose?: boolean;
    extra: any;
    status: string;
  }
}
