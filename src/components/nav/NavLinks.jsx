import { useState, useEffect, useContext, useRef } from 'react';

import { NavLink, useNavigate } from 'react-router-dom';
import usersApi from '../../api/users';
import chatRoomsApi from '../../api/chatRooms';
import { BiTrashAlt } from 'react-icons/bi';

import './NavLinks.scss';
import { ActionCableContext } from '../..';
import { useSelector } from 'react-redux';
import ReactTimeAgo from 'react-time-ago';
import Loading from '../UI/Loading';

const NavLinks = () => {
  const [chatRooms, setChatRooms] = useState([]);
  const [receivedData, setReceivedData] = useState([false]);
  const [allUsers, setAllUsers] = useState([]);
  const [channel, setChannel] = useState(null);
  const [newChatRoom, setNewChatRoom] = useState(false);

  const imgRef = useRef();
  const titleRef = useRef();

  const cable = useContext(ActionCableContext);
  const currentUser = useSelector((state) => state.auth.currentUser);
  const isLoading = useSelector((state) => state.auth.isLoading);

  const chatRoomsContainer = document.getElementById('chatRooms');

  const [recentChatRoomMessage, setRecentChatRoomMessage] = useState({});

  const navigate = useNavigate();

  useEffect(() => {
    const channel = cable.subscriptions.create(
      { channel: 'ChatRoomsChannel' },
      {
        received: (data) => {
          setReceivedData(data);

          if (data.status === 'new_message') {
            setRecentChatRoomMessage(data);
          }
        },
      }
    );

    setChannel(channel);

    return () => {
      channel.unsubscribe();
    };
  }, [cable.subscriptions]);

  useEffect(() => {
    if (recentChatRoomMessage.status === 'new_message') {
      setChatRooms((chatRooms) =>
        chatRooms.map((chatRoom) => {
          if (chatRoom.id === recentChatRoomMessage.chat_room_id) {
            return {
              ...chatRoom,
              last_message: recentChatRoomMessage.body,
              last_message_at: recentChatRoomMessage.created_at,
            };
          } else {
            return chatRoom;
          }
        })
      );
    }
  }, [recentChatRoomMessage]);

  useEffect(() => {
    if (receivedData.status === 'deleted') {
      setChatRooms((chatRooms) =>
        chatRooms.filter((chatRoom) => chatRoom.id !== receivedData.id)
      );
    }
  }, [receivedData.status]);

  useEffect(() => {
    const chatRooms = JSON.parse(localStorage.getItem('chatRooms'));

    if (chatRooms && chatRooms.length > 0) {
      setChatRooms(chatRooms);
    } else {
      fetchChatRooms();
    }
  }, []);

  useEffect(() => {
    fetchChatRooms();
  }, [newChatRoom]);

  useEffect(() => {
    const resetChatRoomsScroll = () => {
      if (!chatRoomsContainer) return;
      chatRoomsContainer.scrollTop = chatRoomsContainer.scrollHeight;
    };

    resetChatRoomsScroll();
  }, [chatRoomsContainer, receivedData]);

  const fetchChatRooms = async () => {
    const response = await chatRoomsApi.getChatRooms();
    const data = await response.data;
    setChatRooms(data);
  };

  useEffect(() => {
    saveToLocalStorage(chatRooms);
  }, [chatRooms]);

  const saveToLocalStorage = (chatRooms) => {
    localStorage.setItem('chatRooms', JSON.stringify(chatRooms));
  };

  const [loading, setLoading] = useState(false);

  const handleChatRoomSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const formData = new FormData();
    formData.append('image', imgRef.current.files[0]);
    formData.append('title', titleRef.current.value);

    const response = await chatRoomsApi.createChatRoom(formData);
    const data = await response.data;
    setChatRooms((chatRooms) => [...chatRooms, data]);

    setLoading(false);
  };

  const handleDelete = (chatRoomId) => () => {
    channel.send({
      id: chatRoomId,
      status: 'deleted',
    });

    setChatRooms(chatRooms.filter((chatRoom) => chatRoom.id !== chatRoomId));
    navigate('/');
  };

  const fetchAllUsers = async () => {
    const response = await usersApi.getUsers();
    const data = await response.data;
    setAllUsers(data.filter((user) => user.id !== currentUser.id));
  };

  const fetchUser = async (userId) => {
    const response = await usersApi.getUser(userId);
    const data = await response.data;
    setNewChatRoom(true);
    return data;
  };

  useEffect(() => {
    fetchAllUsers();
  }, []);

  return (
    <nav className='sidenav'>
      <div className='sidenav-profile'>
        <h2> {currentUser.username}</h2>
        <img src={currentUser.avatar} alt='' className='sidenav-profile__img' />
      </div>
      <div className='chat-rooms' id='chatRooms'>
        {isLoading ? (
          <Loading />
        ) : (
          chatRooms &&
          chatRooms.map((chatRoom) => (
            <NavLink
              to={`/chat_rooms/${chatRoom.id}`}
              className={({ isActive }) =>
                isActive ? 'chat-room active' : 'chat-room'
              }
              key={chatRoom.id}
            >
              <img src={chatRoom.image.url} alt='' className='chat-room__img' />

              <div className='chat-room__info'>
                <p className='chat-room__name'>
                  {chatRoom.title || chatRoom.username}
                </p>
                <p className='chat-room__last-message'>
                  {chatRoom.last_message
                    ? chatRoom.last_message.substring(0, 5) + '...'
                    : 'No messages'}
                </p>
                <p>{chatRoom.messages_count}</p>
              </div>

              <p
                className='chat-room__time'
                onClick={handleDelete(chatRoom.id)}
              >
                <BiTrashAlt size={20} />
              </p>
            </NavLink>
          ))
        )}
        <div
          className='chat-room'
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          CONTACT
        </div>
        {allUsers.map((user) => (
          <div className='chat-room' key={user.id}>
            {user.username}
            <button
              onClick={() => {
                fetchUser(user.id);
              }}
            >
              chat
            </button>

            {user.online ? (
              <p style={{ color: 'green' }}>online</p>
            ) : (
              <p>offline</p>
            )}
          </div>
        ))}
      </div>

      <form className='sidenav-search' onSubmit={handleChatRoomSubmit}>
        <input type='text' placeholder='Search' ref={titleRef} />
        <input type='file' ref={imgRef} />
        <button type='submit'>
          <ion-icon name='search-outline'></ion-icon>
        </button>
      </form>
    </nav>
  );
};

export default NavLinks;
