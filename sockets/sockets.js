const data=[];
let activePlayers=[];
let hosts={activeRooms:0,host:[]};
const root = (io) => {
    io.on("connection", (socket) => {
        const findData=(d)=>{
            return data.find((datas)=>d.room===datas.room);
        }
        const change_question=(d)=>{
            const record=findData(d);
            console.log(record.questions.length);
            console.log(record.questions[0].length);
            record.questions[record.index[0]].splice(record.index[1],1);
            record.index[0]=Math.floor(Math.random()*record.questions.length);
            if(record.questions[record.index[0]].length==0){
                record.questions.splice(record.index[0],1);
                record.index[0]=Math.floor(Math.random()*record.questions.length);
            }
            record.index[1]=Math.floor(Math.random()*record.questions[record.index[0]].length);
            io.to(d.room).emit('show_question');
        }
        const interval=(d)=>{
            const record=findData(d);
            record.clock=setInterval(()=>{
                io.to(d.room).emit('timer',record.timer);
                record.timer--;
                if(record.timer==-1){
                    record.answers=0;
                    io.to(d.room).emit('show_answer');
                    io.to(d.room).emit('hide_input');
                    setTimeout(()=>{
                        record.timer=record.totalTime;
                        change_question(d);
                    },5000);
                }
            },1000);
        }
        socket.on('start_timer',(d)=>{
            io.to(d.room).emit('show_question');
            interval(d);
        })
        socket.on('update_setting',(d)=>{
            const record=findData({room:d.room});
            record.totalTime=d.timer;
            record.timer=record.totalTime;
            record.totalScore=d.score;
            io.to(d.room).emit('show_setting',{timer:record.totalTime,score:record.totalScore});
        })
        socket.on("new_user_joined", (d) => {
            const user = {};
            user.name = d.name;
            user.score = 0;
            user.id = socket.id;
            user.type=d.type;
            user.room=d.room;
            if(d.type==='host'){
                const dummy={};
                dummy.room=d.room;
                const player=[];
                player.push(user);
                dummy.players=player;
                dummy.totalTime=15;
                dummy.timer=dummy.totalTime;
                dummy.answers=0;
                dummy.index=[0,0];
                dummy.totalScore=100;
                dummy.questions=[];
                socket.emit('show_setting',{timer:dummy.totalTime,score:dummy.totalScore});
                data.push(dummy);
            }
            else{
                const record=findData({room:d.room});
                record.players.push(user);
                socket.emit('show_setting',{timer:record.totalTime,score:record.totalScore});
            }
            socket.join(d.room);
            activePlayers.push(user);
            socket.emit("update_player",user);
            io.to(d.room).emit('show_players');
        })
        socket.on('update_result',(d)=>{
            const record=findData(d);
            const a=record.players.find((player)=>socket.id===player.id);
            if(record.timer>=10){
                a.score+=10;
            }
            else{
                a.score+=record.timer;
            }
            record.answers++;
            if(record.answers==record.players.length){
                record.timer=0;
            }
            if(a.score>=record.totalScore){
                io.to(d.room).emit('show_result',{name:a.name});
                io.to(d.room).emit('hide_input');
                clearInterval(record.clock);
                record.timer=record.totalTime-1;
                io.to(d.room).emit('timer',record.totalTime);
                record.answers=0;
                record.index[0]=0;
                record.index[1]=0;
                record.questions=[];
                record.players.forEach(element => {
                    element.score=0;
                });
                setTimeout(()=>{
                    io.to(record.room).emit('show_start');
                },5000);
            }
            io.to(d.room).emit('show_players');
        })
        socket.on('disconnect',()=>{
            const record=activePlayers.find((datas)=>socket.id===datas.id);//to get room
            const roommate=data.find((datas)=>record.room===datas.room);// to get record
            if(!roommate){
                return;
            }
            const size=roommate.players.length;
            for(let i=0;i<size;i++){
                if(socket.id===roommate.players[i].id){
                    if(i==0 && size!=1){
                        roommate.players[1].type='host';
                        io.to(roommate.players[1].id).emit('update_player',roommate.players[1])
                        if(!roommate.clock){
                            io.to(record.room).emit('show_start');
                        }
                    }
                    roommate.players.splice(i,1);
                    break;
                }
            }
            if(size==1){
                var index=data.indexOf(roommate);
                clearInterval(roommate.clock);
                data.splice(index,1);
                index=hosts.host.indexOf(record);
                hosts.host.splice(index,1);
            }
            io.to(record.room).emit('show_players');
        })
    })
}
module.exports={root,data,hosts};