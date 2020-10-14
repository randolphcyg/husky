import { PageContainer } from '@ant-design/pro-layout';
import { Menu } from 'antd';
import React, { Component } from 'react';
import { Dispatch, FormattedMessage } from 'umi';
import AccountView from './components/AccountView';
import AdServerView from './components/AdServerView';
import MsgView from './components/MsgView';
import styles from './style.less';



const { Item } = Menu;

interface SettingsProps {
  dispatch: Dispatch;
}

type SettingsStateKeys = 'account' | 'ad' | 'msg';
interface SettingsState {
  mode: 'inline' | 'horizontal';
  menuMap: {
    [key: string]: React.ReactNode;
  };
  selectKey: SettingsStateKeys;
}

class Settings extends Component<SettingsProps, SettingsState> {
  main: HTMLDivElement | undefined = undefined;

  constructor(props: SettingsProps) {
    super(props);
    // 菜单映射
    const menuMap = {
      account: (
        <FormattedMessage
          id="accountandsettings.menuMap.account-basic"
          defaultMessage="Basic Account Settings"
        />
      ),
      ad: (
        <FormattedMessage
          id="accountandsettings.menuMap.ad-server-basic"
          defaultMessage="Basic Ad Server Settings"
        />
      ),
      msg: (
        <FormattedMessage
          id="accountandsettings.menuMap.msg-basic"
          defaultMessage="Mail Server Settings"
        />
      ),
    };
    this.state = {
      mode: 'inline',
      menuMap,
      selectKey: 'msg', // 默认选中的tab页 开发时注意换成方便的
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.resize);
    this.resize();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resize);
  }

  getMenu = () => {
    const { menuMap } = this.state;
    return Object.keys(menuMap).map((item) => <Item key={item}>{menuMap[item]}</Item>);
  };

  getRightTitle = () => {
    const { selectKey, menuMap } = this.state;
    return menuMap[selectKey];
  };

  selectKey = (key: SettingsStateKeys) => {
    this.setState({
      selectKey: key,
    });
  };

  resize = () => {
    if (!this.main) {
      return;
    }
    requestAnimationFrame(() => {
      if (!this.main) {
        return;
      }
      let mode: 'inline' | 'horizontal' = 'inline';
      const { offsetWidth } = this.main;
      if (this.main.offsetWidth < 641 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      if (window.innerWidth < 768 && offsetWidth > 400) {
        mode = 'horizontal';
      }
      this.setState({
        mode,
      });
    });
  };

  renderChildren = () => {
    const { selectKey } = this.state;
    switch (selectKey) {
      case 'account':
        return <AccountView />;
      case 'ad':
        return <AdServerView />;
      case 'msg':
        return <MsgView />;
      default:
        break;
    }

    return null;
  };

  render() {
    const { mode, selectKey } = this.state;
    return (
      <PageContainer title='配置中心'>
        <div
          className={styles.main}
          ref={(ref) => {
            if (ref) {
              this.main = ref;
            }
          }}
        >
          <div className={styles.leftMenu}>
            <Menu
              mode={mode}
              selectedKeys={[selectKey]}
              onClick={({ key }) => this.selectKey(key as SettingsStateKeys)}
            >
              {this.getMenu()}
            </Menu>
          </div>
          <div className={styles.right}>
            <div className={styles.title}>{this.getRightTitle()}</div>
            {this.renderChildren()}
          </div>
        </div>
      </PageContainer>
    );
  }
}

export default Settings;
