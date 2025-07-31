import React, { useEffect, useState } from "react";

const Ansidebar = ({ onIncrease, onDecrease, onReset, movelist, pgn,counting}) => {
 const myarray = movelist.slice(0, counting);
 const [opening,setopening] = useState("");


 useEffect( () =>
{

  
 const getopening = () =>
 {
const match = pgn.match(/\[ECOUrl\s*"\s*https:\/\/www\.chess\.com\/openings\/(.+?)"\s*\]/i);
if (match && match[1]) {
  setopening(match[1]);
} else {
  setopening("");
}
 }
 getopening();
},[pgn]);
  /*const addmove = () =>
  {
  setmyarray(prev => [...prev,movelist[counting]]);
  }
  useEffect ( ()=>
  {
    if(movelist[counting])
    {
     addmove();
    }
  },[counting])*/
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === "ArrowRight") {
                onIncrease();
                e.preventDefault();
            } else if (e.key === "ArrowLeft") {
              e.preventDefault();
                onDecrease();
            }
            else if (e.key=== "Escape")
            {
              onReset();
              e.preventDefault();
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [onIncrease, onDecrease]);


  return (
    <div style={styles.sidebar}>
      
      <div style={styles.moveBox}>
        <h3 style={styles.moveTitle}>Move Log </h3>
        <h4>{opening}</h4>
        <div style={{display:"flex", gap :"10px",flexWrap :"wrap"}}>
        {myarray.map((m ,index) =><button key = {index}style={styles.btn}>{m}</button>)}
        </div>
        <div style={styles.moveContent}>
          
        </div>
      </div>

      <div style={styles.controls} >
        <button style={styles.buttonn} onClick={onIncrease}  >▶</button>
        <button style={styles.buttonn} onClick={onDecrease} > ◀</button>
        <button style={styles.buttonn} onClick={onReset}>Reset</button>
        <button style={styles.buttonn}>🔁</button>
      </div>
    </div>
  );
};

const styles = {
  sidebar: {
    width: "350px",
    padding: "20px",
    backgroundColor: "#1a0909ff",
    borderLeft: "2px solid #ccc",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "sans-serif",
    height: "100vh",
    boxSizing: "border-box",
  },
  moveBox: {
    width: "100%",
    aspectRatio: "1 / 1",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "10px",
    marginBottom: "20px",
    backgroundColor: "#fff",
    overflowY: "auto",
  },
  moveTitle: {
    margin: 0,
    fontSize: "18px",
    marginBottom: "10px",
    textAlign: "center",
  },
  moveContent: {
    fontSize: "14px",
    lineHeight: "1.4",
  },
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    width: "100%",
  },
  btn :{
    color :"black",
    padding : "0",
    gap :"0px"
  },
  buttonn: {
    padding: "10px",
    fontSize: "2rem",
    borderRadius: "6px",
    border: "1px solid #aaa",
    backgroundColor: "#eee",
    cursor: "pointer",
    transition: "all 0.2s",
    color :"black"
  },
};

export default Ansidebar;
