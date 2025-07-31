import React from 'react';
import './App.css';
import Sidebars from './components/sidebar';
import { useState } from 'react';
import Homepage from './pages/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Matchpage from './pages/matches';
import Analytics from './pages/analyse';
import Test from './pages/test';

function App() {
  return (
    <Router>
    <div className="App">
      
    
    <Routes>
      <Route path='/' element ={<Homepage />} />
      <Route path='/matches' element = {<Matchpage />} />
      <Route path='/home' element ={<Homepage />} />
      <Route path='/analysis' element ={<Analytics />} />
      <Route path='/test' element ={<Test />} />
    </Routes>
    </div>
    </Router>
  );
}

export default App;
