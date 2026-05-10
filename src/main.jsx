import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { store } from '@store/index';
import App from './App';
import './styles/globals.css';

const savedTheme = localStorage.getItem('theme');
const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches;
const toastTheme = (savedTheme === 'dark' || (!savedTheme && prefersDark)) ? 'dark' : 'light';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <ToastContainer
          position="top-right"
          autoClose={4000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          pauseOnFocusLoss={false}
          draggable={false}
          pauseOnHover
          theme={toastTheme}
        />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>,
);
