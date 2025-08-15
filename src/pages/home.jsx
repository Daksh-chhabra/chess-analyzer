import React from "react";
import Sidebars from "../components/sidebar";
import './pages-css/home.css';
import CreateCards from "../components/username-fetcher";
import chessLogo from './images/chess.com.png'; 
import PGN from './images/pgn-file.png';

const Homepage = () =>{
    return (
        <div className="home">
        
        <Sidebars />




<button onClick={async () => {
    try {
        const res = await fetch("http://localhost:5000/refresh");
        const text = await res.text();
        console.log(text); 
    } catch (err) {
        console.error(err);
        alert("Failed to refresh data");
    }
}}

  style={{
    position: 'absolute',   
    top: '10px',
    left: '250px',
    padding: '5px 10px',
    fontSize: '12px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    zIndex: 1000
  }}


>
    Refresh Games
</button>













        <div className="card-container">
        <div className="card">
        <CreateCards  image ={chessLogo} platform ="chess.com" action ="fetch"/>
        </div>
        <div className="card">
        <CreateCards image  ={PGN} platform ="Import PGN" action ="analyze" />
        </div>
        </div>
        </div>
    );
}
export default Homepage;