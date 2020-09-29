import { LockTwoTone, MailTwoTone, MobileTwoTone, UserOutlined } from '@ant-design/icons';
import React from 'react';
import styles from './index.less';

export default {
  Username: {
    props: {
      size: 'large',
      id: 'username',
      prefix: (
        <UserOutlined
          style={{
            color: '#1890ff',
          }}
          className={styles.prefixIcon}
        />
      ),
      placeholder: 'admin',
    },
    rules: [
      {
        required: true,
        message: 'Please enter username!',
      },
    ],
  },
  Password: {
    props: {
      size: 'large',
      prefix: <LockTwoTone className={styles.prefixIcon} />,
      type: 'password',
      id: 'password',
      placeholder: 'admin',
    },
    rules: [
      {
        required: true,
        message: 'Please enter password!',
      },
    ],
  },
  Mobile: {
    props: {
      size: 'large',
      prefix: <MobileTwoTone className={styles.prefixIcon} />,
      placeholder: 'ldap account',
    },
    rules: [
      {
        required: true,
        message: 'Please enter ldap account!',
      },
    ],
  },
  Captcha: {
    props: {
      size: 'large',
      prefix: <MailTwoTone className={styles.prefixIcon} />,
      placeholder: 'ldap pwd',
    },
    rules: [
      {
        required: true,
        message: 'Please enter ldap pwd!',
      },
    ],
  },
};
