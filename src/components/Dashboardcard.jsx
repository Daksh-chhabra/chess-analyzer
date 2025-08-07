import { hover } from "@testing-library/user-event/dist/hover";
import React from "react";
import "./css/dboard.css"
const Dboardcard = ({heading ,pelement ,img}) =>
{
    return (
        <button className="dashboardbuttons">
        <div style={{height :"300px" ,width :"400px" ,color:"#d8dde5ff" , border :"10px solid black" ,borderRadius : "5%" ,background : "#2A2D32"}}>
        <div>
            <h1>{heading}</h1>
            <p>{pelement}</p>
        </div>
        <div></div>
        </div>
        </button>
    )
}

export default Dboardcard ;
