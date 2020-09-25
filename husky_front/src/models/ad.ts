import { fetchAdAccountList } from '@/services/ad';
import { message } from 'antd';

export default {
  namespace: 'ad',
  state: {
    adAccountList: [],
    loading: true, // 表格加载标记，初始化值为true
  },
  effects: {
    *fetchAdAccountList({ payload }, { call, put }) {
      console.log('model-effects-fetchAdAccountList');
      const response = yield call(fetchAdAccountList, payload);
      if (response.code === 0) {
        yield put({
          type: 'setAccountList',
          payload: response.body,
        });
      } else {
        message.error(response.message);
        yield put({
          type: 'setAccountList',
          payload: [],
        });
      }
    },
  },
  reducers: {
    setAccountList(state, action) {
      return {
        ...state,
        adAccountList: action.payload,
        loading: false, // 表格加载标记，数据载入完毕设为false
      };
    },
  },
};
