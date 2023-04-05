require('dotenv').config();

const express=require('express');

const gameRouter=require('./routes/game');
const authRouter=require('./routes/auth');

const notFound=require('./middleware/not-found');
const connectDB=require('./db/connect')
let app=express();
var http=require('http').Server(app);
var io=require('socket.io')(http);
const {root}=require('./sockets/sockets');
root(io);
app.use(express.json());
const port=process.env.PORT || 1200;
app.use('/game',gameRouter);
app.use('/auth',authRouter);
app.use(express.static('./public'));
app.use(notFound);
const start=async ()=>{
    try {
        await connectDB(process.env.CONNECTION);
        app.listen(port,console.log(`server listening at http://localhost:${port}`));
    } catch (error) {
        console.log(error);
    }
}
start();