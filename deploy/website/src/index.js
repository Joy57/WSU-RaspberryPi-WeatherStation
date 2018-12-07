import React from 'react';
import ReactDOM from 'react-dom';
import './styles/index.css';
// import 'babel-polyfill';
import App from './containers/App';
// import registerServiceWorker from './registerServiceWorker';
import 'bootstrap/dist/css/bootstrap.css';
import dotenv from 'dotenv'
dotenv.config()

ReactDOM.render(<App />, document.getElementById('root'));
// registerServiceWorker();
