import {
  SET_LOADING_STATUS,
  GET_CHATROOMS_REQUEST,
  GET_CHATROOMS_SUCCESS,
  GET_CHATROOMS_FAILURE,
  UPDATE_CHATROOMS,
} from '../actions/types';

const initialState = {
  chatRooms: [],
  isLoading: true,
  error: null,
};

export default function chatRoomReducer(state = initialState, action) {
  switch (action.type) {
    case GET_CHATROOMS_REQUEST:
      return {
        ...state,
        isLoading: true,
      };
    case GET_CHATROOMS_SUCCESS:
      return {
        ...state,
        chatRooms: action.payload,
        isLoading: false,
      };
    case GET_CHATROOMS_FAILURE:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case UPDATE_CHATROOMS:
      return {
        ...state,
        chatRooms: [...state.chatRooms, action.payload],
      };
    case SET_LOADING_STATUS:
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}
