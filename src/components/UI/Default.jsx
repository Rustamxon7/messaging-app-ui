import { NavLink } from 'react-router-dom';
import Loading, { Spinner } from './Loading';

function Default() {
  return (
    <nav className='sidenav'>
      <div className='sidenav-profile'>
        <h2> tester</h2>
        <img
          src='https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1180&q=80'
          alt=''
          className='sidenav-profile__img'
        />
      </div>
      <div className='chat-rooms' id='chatRooms'>
        <NavLink className='chat-room'>
          <Spinner />

          <div className='chat-room__info'>
            <p className='chat-room__name'>test</p>
            <p className='chat-room__last-message'>Hello</p>
            <p>4</p>
          </div>
        </NavLink>
        <div
          className='chat-room'
          style={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          CONTACT
        </div>
      </div>

      <form className='sidenav-search'>
        <input type='text' placeholder='Search' name='message' />
        <button type='submit'>
          <ion-icon name='search-outline'></ion-icon>
        </button>
      </form>
    </nav>
  );
}

export default Default;
