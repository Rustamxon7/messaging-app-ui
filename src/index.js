import React, { createContext } from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { createHashHistory } from 'history';
import TimeAgo from 'javascript-time-ago';

import actionCable from 'actioncable';

import en from 'javascript-time-ago/locale/en.json';
import ru from 'javascript-time-ago/locale/ru.json';

import store from './redux';

import App from './App';
import './Index.scss';

export const history = createHashHistory();

TimeAgo.addDefaultLocale(en);
TimeAgo.addLocale(ru);

const CableApp = {};
// CableApp.cable = actionCable.createConsumer('ws://localhost:3000/cable');
CableApp.cable = actionCable.createConsumer(
  'wss://messaging-app.fly.dev/cable'
);
export const ActionCableContext = createContext();

const ws = new WebSocket('wss://messaging-app.fly.dev/cable');
ws.onopen = () => {
  console.log('connected');
};
ws.onclose = () => {
  console.log('disconnected');
};
ws.onerror = (err) => {
  console.log('error', err);
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <ActionCableContext.Provider value={CableApp.cable}>
      <App />
    </ActionCableContext.Provider>
  </Provider>
);
