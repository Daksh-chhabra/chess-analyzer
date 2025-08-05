import React from 'react';
import './App.css';
import Sidebars from './components/sidebar';
import { useState } from 'react';
import Homepage from './pages/home';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Matchpage from './pages/matches';
import Analytics from './pages/analyse';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <Router>
    <div className="App">
      
    
    <Routes>
      <Route path='/' element ={<Homepage />} />
      <Route path='/matches' element = {<Matchpage />} />
      <Route path='/home' element ={<Homepage />} />
      <Route path='/analysis' element ={<Analytics />} />
      <Route path ='/Dashboard' element ={<Dashboard />} />
    </Routes>
    </div>
    </Router>
  );
}

export default App;
