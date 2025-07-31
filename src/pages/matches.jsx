import React from "react";
import Sidebars from "../components/sidebar";
import Matchtable from "../components/matchtable";
import './pages-css/match.css'

const Matchpage =()=>{
    return (
        <div className="match">
        <Sidebars />
        <Matchtable  />
        </div>

    )

}

export default Matchpage;