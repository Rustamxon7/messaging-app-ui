import { useState, useEffect } from 'react';
import ReactTimeAgo from 'react-time-ago';

function ChatNav(props) {
  const id = props.id;
  const chatRoomUsers = props.chatRoomUsers;
  const isPrivate = props.isPrivate;
  const isUserMember = props.isUserMember;
  const handleJoin = props.handleJoin;
  const handleLeave = props.handleLeave;
  const currentlyTyping = props.currentlyTyping;

  const chatRoomId = parseInt(id);

  const chatRoomsInLocal = JSON.parse(localStorage.getItem('chatRooms'));

  const [currentChatRoom, setCurrentChatRoom] = useState([]);

  useEffect(() => {
    if (chatRoomsInLocal) {
      const currentChatRoom = chatRoomsInLocal.find(
        (chatRoom) => chatRoom.id === chatRoomId
      );

      setCurrentChatRoom(currentChatRoom);
    }
  }, [chatRoomId]);

  const getDateTime = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const day = d.getDate();
    const hour = d.getHours();
    const min = d.getMinutes();
    const sec = d.getSeconds();
    return `${year}-${month}-${day} ${hour}:${min}:${sec}`;
  };

  return (
    <>
      <div className='dashboard-top'>
        <div className='top-chat__profile'>
          <div className='top-chat__profile-info'>
            <img
              src={currentChatRoom.image ? currentChatRoom.image.url : ''}
              alt=''
              className='top-chat__profile__img'
            />
            <div>
              <p className='top-chat__profile__name'>{currentChatRoom.title}</p>
              <br />
              {!currentChatRoom.is_private ? (
                <p className='top-chat__profile__members'>
                  {chatRoomUsers.length} members
                </p>
              ) : (
                <p className='top-chat__profile__members'>private</p>
              )}
            </div>

            <div className='top-chat__profile__online'>
              {chatRoomUsers.map((user) => (
                <div className='top-chat__profile__online-user'>
                  <p>
                    {user.username}
                    {' - '}
                    {user.last_seen !== 'Online' ? (
                      <ReactTimeAgo
                        date={getDateTime(user.last_seen)}
                        locale='en-US'
                      />
                    ) : (
                      <span className='offline'>Online</span>
                    )}
                  </p>
                </div>
              ))}
            </div>

            <div className='top-chat__profile__typing'>
              {currentlyTyping.map((user) => (
                <p>{user} is typing...</p>
              ))}
            </div>

            <div className='top-chat__profile__btns'>
              {!isPrivate &&
                (!isUserMember() ? (
                  <button
                    className='top-chat__profile__btn'
                    onClick={handleJoin}
                  >
                    Join
                  </button>
                ) : (
                  <button
                    className='top-chat__profile__btn'
                    onClick={handleLeave}
                  >
                    Leave
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatNav;
