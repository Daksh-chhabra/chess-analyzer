import React, { useState } from "react";
import Sidebars from "../components/sidebar";
import Matchtable from "../components/matchtable";
import './pages-css/match.css'
import { API_URL } from "../pathconfig";
import { readFile, saveFile } from '../utils/fileStorage';

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
    if (!username) {
        alert("No current user found");
        return;
    }

    const existingData = await readFile(`${username}.json`);
    if (!existingData) {
        alert("No existing data to refresh");
        return;
    }

    const now = new Date();
    let fetchMonth = now.getMonth() + 1;
    let fetchYear = now.getFullYear();
    if (now.getDate() === 1) {
        fetchMonth -= 1;
        if (fetchMonth === 0) {
            fetchMonth = 12;
            fetchYear -= 1;
        }
    }

    const res = await fetch(`https://api.chess.com/pub/player/${username}/games/${fetchYear}/${fetchMonth.toString().padStart(2,'0')}`);
    if (!res.ok) throw new Error("Failed to fetch data from Chess.com");

    const newData = await res.json();

    const refreshCount = (existingData.refreshCount || 0) + 1;

    await saveFile(`${username}.json`, { ...newData, refreshCount });

    setrefreshcount(c => c + 1); // update state for table refresh
    console.log(`Data refreshed. Refresh count: ${refreshCount}`);
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