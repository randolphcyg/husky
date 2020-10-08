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
    // logo: false,   // 不显示默认logo
    logo: '../zy.svg', // 显示执行logo
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
    // 欢迎页
    {
      path: '/welcome',
      name: 'welcome',
      icon: 'smile',
      component: './Welcome',
    },
    // 配置中心
    {
      path: '/config',
      name: 'config',
      icon: 'setting',
      access: 'canAdmin',
      component: './config',
    },
    // AD域
    {
      path: '/ad',
      name: 'ad',
      icon: 'windows',
      access: 'canAdmin',
      routes: [
        {
          path: '/ad/account',
          name: 'account',
          component: './ad/account',
        },
        {
          path: '/ad/server',
          name: 'server',
          component: './ad/server',
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
    // 企业微信测试
    {
      path: '/wework',
      name: 'wework',
      icon: 'Wechat',
      access: 'canAdmin',
      component: './wework',
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
  title: false,
  ignoreMomentLocale: true,
  proxy: proxy[REACT_APP_ENV || 'dev'],
  manifest: {
    basePath: '/',
  },
});
