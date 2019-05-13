import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Provider } from "react-redux";
import { store } from "./store.js";
import { BrowserRouter as Router}  from 'react-router-dom';
import Routes from './routes';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes/>
      </Router>
    </Provider>
  );
}

export default App;
