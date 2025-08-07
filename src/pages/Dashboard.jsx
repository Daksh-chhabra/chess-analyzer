import React from "react";
import Dboardcard from "../components/Dashboardcard";

const Dashboard = ({name}) =>
{
    return (
        <div style={{ background: "#1C1F24",height : "100vh" ,width:"100vw"}}>
        <div style={{color:"white"}}> <h1> Welcome Back {name}</h1></div>
        <Dboardcard heading ="Opening Stats"/>
        </div>
    )
}
export default Dashboard;