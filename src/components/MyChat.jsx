import { useState, useEffect, useContext, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionCableContext } from '..';
import chatRoomsApi from '../api/chatRooms';
import ChatNav from './ChatNav';
import Form from './Form';

function MyChat() {
  const currentUser = useSelector((state) => state.auth.currentUser);
  const messagesContainer = document.querySelector('.chat');

  const { id } = useParams();
  const navigate = useNavigate();
  const typingUsers = useRef([]);
  const count = useRef(0);

  const cable = useContext(ActionCableContext);
  const [channel, setChannel] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [receivedData, setReceivedData] = useState({});
  const [chatRoomUsers, setChatRoomUsers] = useState([]);
  const [currentlyTyping, setCurrentlyTyping] = useState([]);

  useEffect(() => {
    const channel = cable.subscriptions.create({
      channel: 'MessagesChannel',
      id,
    });

    setChannel(channel);

    fetchMessages(id);

    return () => {
      channel.unsubscribe();
    };
  }, [id]);

  useEffect(() => {
    const resetScroll = () => {
      if (!messagesContainer) return;
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    };

    resetScroll();
  }, [messagesContainer, messages]);

  useEffect(() => {
    if (channel) {
      channel.received = (data) => {
        setReceivedData(data);

        if (data.status === `subscribed_to_${id}`) {
          setIsPrivate(data.is_private);
        }
      };
    }
  }, [channel, id]);

  useEffect(() => {
    if (receivedData.status === 'typing') {
      typingUsers.current = [...typingUsers.current, receivedData.username];

      const filteredUsers = filterTypingUsers(typingUsers.current);

      setCurrentlyTyping(filteredUsers);
    } else if (receivedData.status === 'stopped_typing') {
      typingUsers.current = typingUsers.current.filter(
        (user) => user !== receivedData.username
      );

      const filteredUsers = filterTypingUsers(typingUsers.current);

      setCurrentlyTyping(filteredUsers);
    }

    // ----------------------------

    if (receivedData.status === `created`) {
      saveToLocalStorage(receivedData);
      setMessages((messages) => [...messages, receivedData]);
    } else if (receivedData.status === `deleted`) {
      setMessages((messages) =>
        messages.filter((message) => message.id !== receivedData.id)
      );
    } else if (receivedData.status === `updated`) {
      setMessages((messages) =>
        messages.map((message) => {
          if (message.id === receivedData.id) {
            return receivedData;
          }
          return message;
        })
      );
    }
  }, [receivedData]);

  useEffect(() => {
    if (receivedData.chat_room_users) {
      if (receivedData.is_private) {
        const users = receivedData.chat_room_users.filter(
          (user) => user.id !== currentUser.id
        );
        setChatRoomUsers(users);
      } else {
        setChatRoomUsers(receivedData.chat_room_users);
      }
    }
  }, [
    receivedData.chat_room_users,
    isJoined,
    receivedData.is_private,
    currentUser.id,
  ]);

  useEffect(() => {
    if (count.current === 0) {
      count.current = 1;
      return;
    }

    if (inputValue.length >= 0) {
      channel.send({
        user_id: currentUser.id,
        chat_room_id: id,
        is_private: isPrivate,
        username: currentUser.username,
        status: 'typing',
      });
    }

    const timeout = setTimeout(() => {
      channel.send({
        user_id: currentUser.id,
        chat_room_id: id,
        is_private: isPrivate,
        username: currentUser.username,
        status: 'stopped_typing',
      });
    }, 1000);

    return () => {
      clearTimeout(timeout);
    };
  }, [inputValue]);

  const filterTypingUsers = (users) => {
    const filteredUsers = users.filter(
      (user, index) => users.indexOf(user) === index
    );

    return filteredUsers;
  };

  const saveToLocalStorage = (messages) => {
    // do not reset old messages just add new ones
    const chatRooms = JSON.parse(localStorage.getItem(`chatRooms`));

    if (chatRooms) {
      const updatedChatRooms = chatRooms.map((chatRoom) => {
        if (chatRoom.id === messages.chat_room_id) {
          return {
            ...chatRoom,
            last_message: messages,
          };
        }
        return chatRoom;
      });

      localStorage.setItem(`chatRooms`, JSON.stringify(updatedChatRooms));
    }
  };

  const fetchMessages = async (id) => {
    const response = await chatRoomsApi.getChatRoomMessages(id);
    setMessages(response.data);
  };

  const handleDelete = (chatRoomId, messageId) => async () => {
    channel.send({
      id: messageId,
      chat_room_id: chatRoomId,
      status: 'deleted',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const body = e.target.message.value;

    e.target.message.value = '';

    channel.send({
      body,
      chat_room_id: id,
      user_id: currentUser.id,
      status: 'created',
      avatar: currentUser.avatar,
    });

    setInputValue('');

    channel.send({
      user_id: currentUser.id,
      chat_room_id: id,
      is_private: isPrivate,
      status: 'stopped_typing',
    });
  };

  const handleJoin = async () => {
    const data = {
      user_id: currentUser.id,
      chat_room_id: id,
      status: 'joined',
    };

    channel.send(data);
    setIsJoined(true);
  };

  const handleLeave = async () => {
    const data = {
      user_id: currentUser.id,
      body: `${currentUser.username} left the chat room`,
      chat_room_id: id,
      status: 'left_chat_room',
    };

    channel.send(data);
    navigate(`/`);
  };

  const isUserMember = () => {
    if (isJoined) return true;

    const user = chatRoomUsers.find((user) => user.id === currentUser.id);

    if (user) {
      return true;
    }
  };

  return (
    <section className='dashboard'>
      <ChatNav
        chatRoomUsers={chatRoomUsers}
        isPrivate={isPrivate}
        isUserMember={isUserMember}
        handleJoin={handleJoin}
        handleLeave={handleLeave}
        id={id}
        currentlyTyping={currentlyTyping}
      />

      <div className='dashboard-bottom'>
        <div></div>
        <div className='chat'>
          {messages.map((message) => (
            <div
              className={`chat__message ${
                message.user_id === currentUser.id ? 'me' : 'their'
              }`}
            >
              <div
                className={`chat__message-info ${
                  message.user_id === currentUser.id ? 'me' : 'their'
                }`}
              >
                <img
                  src={message.avatar}
                  alt=''
                  className='chat__message-img'
                />

                <div className='chat__message-box'>
                  <p className='chat__message-text'>{message.body}</p>
                  <p className='chat__message-time'>
                    {message.created_at.slice(11, 16)}
                  </p>
                </div>

                <div onClick={handleDelete(id, message.id)}>
                  <ion-icon
                    name='trash-outline'
                    className='chat__message-delete'
                  ></ion-icon>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Form
        isPrivate={isPrivate}
        setIsPrivate={setIsPrivate}
        isUserMember={isUserMember}
        setInputValue={setInputValue}
        inputValue={inputValue}
        handleSubmit={handleSubmit}
      />
    </section>
  );
}

export default MyChat;
