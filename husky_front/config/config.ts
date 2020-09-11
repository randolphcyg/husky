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
    name: 'Ant Design Pro',
    locale: true,
    siderWidth: 208,
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
      icon: 'table',
      access: 'canAdmin',
      // component: './ad',
      routes: [
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
      icon: 'crown',
      access: 'canAdmin',
      component: './visual',
      routes: [
        {
          path: '/visual/bug',
          name: 'bug',
          icon: 'smile',
          component: './visual/bug',
        },
      ],
    },
    // 示例
    {
      path: '/demo',
      name: 'demo',
      icon: 'smile',
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
