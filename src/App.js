import React, { Suspense } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { checkAuthState } from './redux/actions/auth';

import './App.scss';
import MyChat from './components/MyChat';
import NavLinks from './components/nav/NavLinks';
import Default from './components/UI/Default';
import Settings from './components/settings/Settings';

const Login = React.lazy(() => import('./components/auth/Login'));
const SignUp = React.lazy(() => import('./components/auth/SignUp'));

const PrivateRoute = React.lazy(() =>
  import('./components/utils/PrivateRoute')
);

const Loading = React.lazy(() => import('./components/UI/Loading'));

function App() {
  const isLoading = useSelector((state) => state.auth.isLoading);

  const dispatch = useDispatch();
  dispatch(checkAuthState());
  return (
    <BrowserRouter>
      <div className='app'>
        {isLoading ? (
          <Default />
        ) : (
          <Suspense fallback={<Default />}>
            <Routes>
              <Route element={<PrivateRoute />}>
                <Route
                  path='/'
                  element={
                    <>
                      <NavLinks />
                    </>
                  }
                />
                <Route
                  path='/chat_rooms/:id'
                  element={
                    <>
                      <NavLinks />
                      <MyChat />
                    </>
                  }
                />

                <Route path='/settings' element={<Settings />} />

                <Route path='*' element={<Default />} />
              </Route>
              <Route path='/login' element={<Login />} />
              <Route path='/signup' element={<SignUp />} />
            </Routes>
          </Suspense>
        )}
      </div>
    </BrowserRouter>
  );
}

export default App;
