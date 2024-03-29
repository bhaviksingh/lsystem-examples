import React from 'react';
import ReactDOM from 'react-dom';
import  Examples  from './pages/ExamplesPage';
import "./global.css"
import { BrowserRouter as Router, Route } from "react-router-dom";
import InteractiveEditor from './pages/EditorPage';
import Lilac from './pages/Examples/Lilac';
import textGarden from './pages/Examples/TextGarden';

import FavoritePage from './pages/FavoritePage';
import Home from './pages/HomePage';

ReactDOM.render(
  <Router>
    <Route path="/edit" component={InteractiveEditor} />
    <Route exact path="/" component={Home} />
    <Route exact path="/examples/Lilac" component={Lilac} />
    <Route exact path="/examples/Text" component={textGarden} />
    <Route exact path="/favorites" component={FavoritePage} />
  </Router>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();

//Useful tings
//<P5Draw commandString="FFF+F" length={10} />