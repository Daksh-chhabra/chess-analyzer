  import React ,{useRef} from "react";

  const Evalbar = ({cp , turn }) =>
  {
      const maxcp =1000;
      const safeEval = Math.max(-maxcp, Math.min(maxcp, cp));
      let whitebarpercent = 50;

    let adjustedcp =cp;
    if(turn === 'w')
    {
      adjustedcp = -cp;
    }



      if(cp !== null && cp !== undefined )
      {
          whitebarpercent = ((safeEval  + maxcp)/(2*maxcp)) *100 ;
          
          
      }

      const blackbarpercent = 100 -whitebarpercent ;

    return (
      <div
        style={{
          height: "640px",
          width: "40px",
          backgroundColor: "#000",
          border: "1px solid #ccc",
          borderRadius: "4px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          
        }}
      >
        <div style={{ height: `${whitebarpercent}%`, backgroundColor: "#fff" ,transition : "height 0.14s ease" }} />
        <div style={{ height: `${blackbarpercent}%`, backgroundColor: "#000", transition : "height 0.14s ease" }} />
      </div>
    );


      
  };
  export default Evalbar;