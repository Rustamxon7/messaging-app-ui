import chatRoomsApi from '../../api/chatRooms';
import {
  SET_CHAT_ROOM,
  SET_LOADING_STATUS,
  GET_CHATROOMS_REQUEST,
  GET_CHATROOMS_SUCCESS,
  GET_CHATROOMS_FAILURE,
  UPDATE_CHATROOMS,
} from '../actions/types';

export function setChatRoomState(chatRoom) {
  return {
    type: SET_CHAT_ROOM,
    payload: chatRoom,
  };
}

export function setLoadingStatus(status) {
  return {
    type: SET_LOADING_STATUS,
    payload: status,
  };
}

export function getChatRoomsRequest() {
  return {
    type: GET_CHATROOMS_REQUEST,
  };
}

export function getChatRoomsSuccess(chatRooms) {
  return {
    type: GET_CHATROOMS_SUCCESS,
    payload: chatRooms,
  };
}

export function getChatRoomsFailure(error) {
  return {
    type: GET_CHATROOMS_FAILURE,
    payload: error,
  };
}

export function updateChatRooms(chatRoom) {
  return {
    type: UPDATE_CHATROOMS,
    payload: chatRoom,
  };
}

export const getChatRooms = () => async (dispatch) => {
  dispatch(getChatRoomsRequest());
  try {
    const res = await chatRoomsApi.getChatRooms();
    dispatch(getChatRoomsSuccess(res.data));
  } catch (error) {
    dispatch(getChatRoomsFailure(error));
  }
};

export function createChatRoom(createdChatRoom) {
  return async (dispatch) => {
    try {
      await chatRoomsApi.createChatRoom(createdChatRoom);
    } catch (error) {}
  };
}

export function updateChatRoom(updatedChatRoom) {
  return (dispatch) => {
    dispatch(updateChatRooms(updatedChatRoom));
  };
}
