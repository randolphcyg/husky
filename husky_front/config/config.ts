// https://umijs.org/config/
import { defineConfig } from 'umi';
import defaultSettings from './defaultSettings';
import proxy from './proxy';

const { REACT_APP_ENV } = process.env;

export default defineConfig({
  hash: true,
  antd: {},
  dva: {
    hmr: true,
  },
  layout: {
    name: 'going-link',
    locale: true,
    siderWidth: 208,
    // logo: false,   // 不显示默认logo
    logo: '../zy.svg',  // 显示执行logo
  },
  locale: {
    // default zh-CN
    default: 'zh-CN',
    // default true, when it is true, will use `navigator.language` overwrite default
    antd: true,
    baseNavigator: true,
  },
  dynamicImport: {
    loading: '@/components/PageLoading/index',
  },
  targets: {
    ie: 11,
  },
  // umi routes: https://umijs.org/docs/routing
  routes: [
    {
      path: '/user',
      layout: false,
      routes: [
        {
          name: 'login',
          path: '/user/login',
          component: './user/login',
        },
      ],
    },
    {
      path: '/welcome',
      name: 'welcome',
      icon: 'smile',
      component: './Welcome',
    },
    // ad域
    {
      path: '/ad',
      name: 'ad',
      icon: 'windows',
      access: 'canAdmin',
      routes: [
        {
          path: '/ad/server',
          name: 'server',
          component: './ad/server',
        },
        {
          path: '/ad/user',
          name: 'user',
          component: './ad/user',
        },
      ],
    },
    // 可视化
    {
      path: '/visual',
      name: 'visual',
      icon: 'pieChart',
      access: 'canAdmin',
      routes: [
        {
          path: '/visual/bug',
          name: 'bug',
          component: './visual/bug',
        },
      ],
    },
    // 示例
    {
      path: '/demo',
      name: 'demo',
      icon: 'apple',
      access: 'canAdmin',
      component: './demo',
    },
    {
      path: '/',
      redirect: '/welcome',
    },
    {
      component: './404',
    },
  ],
  // Theme for antd: https://ant.design/docs/react/customize-theme-cn
  theme: {
    // ...darkTheme,
    'primary-color': defaultSettings.primaryColor,
  },
  // @ts-ignore
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
