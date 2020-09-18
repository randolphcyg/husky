import { getAll } from '@/services/visual';
import { message } from 'antd';

export default {
  namespace: 'todo',
  state: {
    todoList: [],
  },
  effects: {
    *fetchTodoList({ payload }, { call, put }) {
      console.log('model effects fetchTodoList')
      const response = yield call(getAll, payload);
      if (response.code === 0) {
        yield put({
          type: 'setTodoList',
          payload: response.body,
        });
      } else {
        message.error(response.message);
        yield put({
          type: 'setTodoList',
          payload: [],
        });
      }
    },
  },
  reducers: {
    setTodoList(state, action) {
      return {
        ...state,
        todoList: action.payload,
      };
    },
  },
};