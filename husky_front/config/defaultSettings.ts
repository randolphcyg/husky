import { Settings as LayoutSettings } from '@ant-design/pro-layout';

export default {
  navTheme: 'light',
  // 拂晓蓝
  primaryColor: '#1890ff',
  layout: 'mix',
  contentWidth: 'Fluid',
  fixedHeader: false,
  fixSiderbar: true,
  colorWeak: false,
  menu: {
    disableLocal: true, // 关闭国际化
    locale: true,
    // mode: "vertical",   // 弹出菜单
  },
  autoHideHeader: true, // 下滑时自动隐藏页头
  title: '账号中心及可视化综合平台',
  pwa: false,
  iconfontUrl: '',
} as LayoutSettings & {
  pwa: boolean;
};
