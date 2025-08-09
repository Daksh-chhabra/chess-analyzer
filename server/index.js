import express from 'express';
import cors from "cors";
import axios from "axios";
import fs, { writeFile } from 'fs'
import path from 'path';
import { fileURLToPath } from 'url';
import { data } from 'react-router-dom';
import { Chess } from 'chess.js';
import { handlemovelist } from './engine/logic.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
var name =""
let npg;
let mArray =[];
let png;
let pgnfromuserArray = [];



const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("backend is running ");
});

app.post("/username", async (req, res) => {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const uname = req.body.username;
    const filePath = path.join(__dirname, 'users-data', `${uname}.txt`);
    console.log(`${uname}`);
    name =(`${uname}`);
    
    try {
        const rep = await axios.get(`https://api.chess.com/pub/player/${uname}/games/${currentYear}/${currentMonth.toString().padStart(2, '0')}`);
        fs.writeFileSync(filePath,JSON.stringify(rep.data,null,2),'utf8');
        console.log("file created succesfully");
        res.send(`${uname}received succesfully`);
        return ;
    }
    catch (error) {
        res.status(404).send("invalid username or user not found");
         console.log("error Fetching Data",error.message);
        return ;
       
    }
    
});

app.get("/userdata/:username" , (req,res) =>
{
    const { username } = req.params;
    const filePath = path.join(__dirname,'users-data',`${username}.txt`);
    fs.readFile(filePath,"utf-8",(err,data) =>
    {
        if(err)
        {
            console.log("error reading Data",err);
            return res.status(500).send("error Reading User Data");
        }
        res.json(JSON.parse(data));
    });
});
app.post("/pgn",async (req,res) =>
{
    const pgn = req.body.pgn;
    if(typeof pgn !== "string" || !pgn.trim()) {
        return res.status(403).send("Missing or invalid PGN");
    }
    npg = {pgn};
    if(pgn)
    {
        //res.status(200).send("PGN received succesfully");
        if (!npg || !npg.pgn) {
        return res.status(400).json({ error: "No PGN data provided yet." });
    }
    movesarray();
    try{
        const bestmoved = await handlemovelist(mArray);
        res.status(200).json({
            moves: mArray,
            bestmoves :bestmoved.bestMoves,
            whiteacpl: bestmoved.whiteACPL,
            blackacpl: bestmoved.blackACPL,
            blackrating :bestmoved.blackrating,
            whiterating : bestmoved.whiterating,
            grades : bestmoved.actualgrading,
            cpforevalbar :bestmoved.userevals,
            cpbar :bestmoved.diffed,
            grademovenumber : bestmoved.grademovenumbers,
            userwinpercents : bestmoved.userwinpercents,
            blackgradeno : bestmoved.blackgradeno,
            pvfen : bestmoved.pvfen
            
        });
    }
    catch(err)
    {
        console.log("couldnt get best moves",err);
    }
    


        //console.log("PGN received",JSON.stringify(pgn, null, 2));
        //movesarray();
    }
    else
    {
        res.status(400).send("ERROR receiving PGN");
    }
});

app.post("/pgnfromuser" ,async (req ,res) =>
{
    const pgnfromuser = req.body.pgnfromuser;
    console.log("Received PGN from frontend:", pgnfromuser);
    if(typeof pgnfromuser !== "string" || !pgnfromuser.trim()) {
    return res.status(403).send("Missing or invalid PGN");
    }
    png = {pgnfromuser}
    pgnfromarraymoves();
    console.log(pgnfromuserArray);
    try{
        const bestmovedfromuser = await handlemovelist(pgnfromuserArray);
        res.status(200).json({
            moves: pgnfromuserArray,
            pgn :pgnfromuser,
            bestmoves : bestmovedfromuser.bestMoves,
            whiteacpl: bestmovedfromuser.whiteACPL,
            blackacpl: bestmovedfromuser.blackACPL,
            blackrating :bestmovedfromuser.blackrating,
            whiterating : bestmovedfromuser.whiterating,
            grades : bestmovedfromuser.actualgrading,
            cpforevalbar :bestmovedfromuser.userevals,
            cpbar :bestmovedfromuser.diffed,
            grademovenumber : bestmovedfromuser.grademovenumbers,
            userwinpercents : bestmovedfromuser.userwinpercents,
            blackgradeno : bestmovedfromuser.blackgradeno,
            pvfen : bestmovedfromuser.pvfen,
            booknames :bestmovedfromuser.booknames
            
        }); 
    }
    catch(error)
    {
        console.error("error" ,error);
    }


})




app.get("/grades" , async (req,res) =>

{

    try 
    {
        const diy = await handlemovelist(mArray);
        if(diy)
        {
            res.status(200).json({
                grades : diy.grades,
                whiterating : diy.whiterating,
                blackrating :diy.blackrating
            });
        }
        else{
            res.status(400).json({error:"some error not defined tho"});
        }
    }
    catch(error)
    {
        console.log("981y");
        res.status(500).json({error:"no dataa"});
    }
});










function movesarray()
{
    
    const fixedPgn = npg.pgn;
    //console.log(fixedPgn);

    const chess = new Chess();
    //console.log('PGN being loaded:', JSON.stringify(npg));

    try{
        const ok = chess.loadPgn(fixedPgn);
        console.log("parsed",ok);
         mArray = chess.history().map(m => m.replace(/[+#?!]+/g, ''));

        console.log(mArray)
    }
    catch(err)
    {
        console.error("failed parsing",err)
    }
    

}
function pgnfromarraymoves()
{
    const fixedPgn = png.pgnfromuser;
    //console.log(fixedPgn);

    const chess = new Chess();
    //console.log('PGN being loaded:', JSON.stringify(npg));

    try{
        const ok = chess.loadPgn(fixedPgn);
        console.log("parsed",ok);
         pgnfromuserArray = chess.history().map(m => m.replace(/[+#?!]+/g, ''));

        //console.log(pgnfromuserArray)
    }
    catch(err)
    {
        console.error("failed parsing",err)
    }
}

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});