import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactTimeAgo from 'react-time-ago';
import Button from './UI/Button';
import ImageComponent from './UI/Image';
import Image from './UI/Image';

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
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    if (chatRoomsInLocal) {
      async function getChatRoom() {
        setLoading(true);
        const chatRoom = await chatRoomsInLocal.find(
          (chatRoom) => chatRoom.id === chatRoomId
        );

        if (!chatRoom) {
          navigate('/');
        }

        setCurrentChatRoom(chatRoom);
        setLoading(false);
      }
      getChatRoom();
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
      {loading ? (
        <div className='chat-nav'>
          <div className='chat-nav__loading'>
            <div className='lds-ellipsis'>
              <div></div>
            </div>
          </div>
        </div>
      ) : (
        <div className='dashboard-top'>
          <div className='top-chat__profile'>
            <div className='top-chat__profile-info'>
              {currentChatRoom.image ? (
                <ImageComponent
                  src={currentChatRoom.image.url}
                  className='top-chat__profile__img'
                  chatRoomTitle={currentChatRoom.title}
                />
              ) : (
                <Image
                  src=''
                  className='top-chat__profile__img'
                  chatRoomTitle={currentChatRoom.title}
                />
              )}

              <div>
                <p className='top-chat__profile__name'>
                  {currentChatRoom.title}
                </p>
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
                  <div className='top-chat__profile__online-user' key={user.id}>
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
            </div>

            <div className='top-chat__profile__btns'>
              {!isPrivate &&
                (!isUserMember() ? (
                  <Button
                    children={'Join'}
                    onClick={handleJoin}
                    className={'top-chat__profile__btn'}
                  />
                ) : (
                  <Button
                    children={'Leave'}
                    onClick={handleLeave}
                    className={'top-chat__profile__btn'}
                  />
                ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatNav;
