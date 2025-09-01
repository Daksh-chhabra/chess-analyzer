import React, { useState } from "react";
import Sidebars from "../components/sidebar";
import Matchtable from "../components/matchtable";
import './pages-css/match.css'
import { API_URL } from "../pathconfig";

const Matchpage =()=>{
    const [refreshcount ,setrefreshcount] = useState(0);
    return (
        <div className="match">
        <Sidebars />
        <Matchtable  rf = {refreshcount}/>


        <button onClick={async () => {
            setrefreshcount( c=> c+1);
            console.log("rfc",refreshcount);
    try {
        const username = localStorage.getItem("currentUser");
        const res = await fetch(`${API_URL}/refresh?username=${encodeURIComponent(username)}`);
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
    left: '1450px',
    padding: '5px 10px',
    fontSize: '12px',
    backgroundColor: 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1000
  }}


>
    ↻
</button>
        </div>

    )

}

export default Matchpage;