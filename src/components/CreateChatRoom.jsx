import { useState, useEffect, useContext, useRef } from 'react';
import Select from 'react-select';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { ActionCableContext } from '..';
import chatRoomsApi from '../api/chatRooms';

import usersApi from '../api/users';
import photoSVG from '../assets/photo.svg';
import { Breathing } from './UI/Loading';
import { createChatRoom } from '../redux/actions/chat';

function CreateChatRoom() {
  const dispatch = useDispatch();

  const { id } = useParams();
  const navigate = useNavigate();
  const inputImage = useRef(null);
  const title = useRef([]);
  const usersToInvite = useRef([]);

  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchAllUsers();
  }, [id]);

  const [loading, setLoading] = useState(false);

  const fetchAllUsers = async (id, page, perPage) => {
    setLoading(true);
    const response = await usersApi.getUsers();
    setUsers(response.data);

    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      title: title.current.value,
      participant: usersToInvite.current.map((user) => user.value),
      image: inputImage.current.files[0],
    };

    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('image', data.image);
    formData.append('participant[]', data.participant);

    dispatch(createChatRoom(formData));

    navigate('/');

    setLoading(false);
  };

  const previewImage = () => {
    const image = inputImage.current.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const preview = document.querySelector('.preview');
      const imageInput = document.querySelector('.input-image--hidden');
      preview.src = e.target.result;
      imageInput.style.display = 'none';
    };

    reader.readAsDataURL(image);
  };

  return (
    <section className='dashboard'>
      {loading ? (
        <div className='dashboard-bottom'>
          <Breathing className='chat-messages' />
        </div>
      ) : (
        <div className='create-chat-room'>
          <form onSubmit={handleSubmit}>
            <div className='chat-room-form'>
              <div className='chat-room-inputs'>
                <div className='preview-container'>
                  <img
                    src={photoSVG}
                    alt=''
                    className='preview'
                    onClick={() => inputImage.current.click()}
                  />
                </div>

                <input
                  type='file'
                  name='image'
                  ref={inputImage}
                  className='input-image input-image--hidden'
                  onChange={previewImage}
                />
                <input
                  type='text'
                  name='name'
                  placeholder='Group name'
                  ref={title}
                />
              </div>

              <button className='create-btn'>Create</button>
            </div>

            <Select
              options={users.map((user) => {
                return {
                  value: user.id,
                  label: user.username,
                  color: 'neutral50',
                };
              })}
              className='react-select-container'
              isMulti
              onChange={(e) => {
                usersToInvite.current = e;
              }}
              placeholder='Invite Users'
              menuIsOpen={true}
              menuPlacement='bottom'
              // always show the dropdown
              theme={(theme) => ({
                ...theme,
                borderRadius: '0.8rem',
                colors: {
                  ...theme.colors,
                  neutral70: 'black',
                  primary: 'black',
                },
              })}
              styles={{
                control: (provided) => ({
                  ...provided,
                  border: '1px solid #e2e8f0',
                  boxShadow: 'none',
                  '&:hover': {
                    border: '1px solid #e2e8f0',
                  },
                  backgroundColor: '#294042',
                  borderRadius: '0.8rem',
                }),
                option: (provided, state) => ({
                  ...provided,
                  backgroundColor: state.isSelected
                    ? '#476c70'
                    : state.isFocused
                    ? '#476c70'
                    : '#294042',
                  color: 'white',
                  '&:active': {
                    backgroundColor: '#294042',
                  },
                }),

                menu: (provided) => ({
                  ...provided,
                  backgroundColor: '#294042',
                  color: 'white',
                  height: '100%',
                }),
              }}
            />
          </form>
        </div>
      )}
    </section>
  );
}

export default CreateChatRoom;
