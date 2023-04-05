const socket = io();
const user = {};
const showAllPlayers = async () => {
    try {
        const { data } = await axios.post('/game/players', { room: user.room });
        const scores = data.data;
        const allPlayers = scores.map((player) => {
            const { name, score, id: playerId } = player;
            if (playerId === user.id) {
                return `<div style="background:yellow;" class="player" data-id="${playerId}">
                <div class="name">
                    ${name}
                </div>
                <span class="score">
                    ${score}
                </span>
                </div>`
            }
            else {
                return `<div class="player" data-id="${playerId}">
                    <div class="name">
                        ${name}
                    </div>
                    <span class="score">
                        ${score}
                    </span>
                    </div>`
            }
        })
            .join('');
        players.innerHTML = allPlayers;
    } catch (error) {
        console.log(error);
    }
}
async function showQuestion() {
    try {
        const d = await axios.post('/game/question', { room: user.room });
        questionBox.innerText = d.data.data.question;
        result.innerText = '';
        result.style.backgroundImage=`url(${d.data.data.image})`;
        result.style.backgroundSize = "100% 100%";
        form.style.visibility = 'visible';
        time.style.visibility = 'visible';
    } catch (error) {
        console.log(error);
    }
}
const checkToken = async () => {
    const token = localStorage.getItem('token');
    try {
        const { data } = await axios.get('/auth/checkToken', {
            headers: {
                authorization: `Bearer ${token}`
            }
        })
        user.name = data.name;
        user.type = data.type;
        user.room = data.room;
        console.log(data);
        if (user.type === 'host') {
            document.getElementById('code').append(user.room);
        }
        code.innerText = user.room;
        socket.emit("new_user_joined", { name: user.name, room: user.room, type: user.type });
        showStart();
        collections();
    } catch (error) {
        localStorage.removeItem('token');
    }
}
const collections=async()=>{
    try {
        const { data } = await axios.get('/game/collections');
        for (var i = 0; i < data.data.length; i++) {
            const input = document.createElement('input');
            const div = document.createElement('div');
            const label = document.createElement('label');
            label.innerText = `${data.data[i]}`;
            div.className = 'option';
            input.setAttribute("type", "checkbox")
            input.setAttribute('name', 'option')
            input.setAttribute('value', `${data.data[i]}`);
            div.append(input);
            div.append(label);
            document.querySelector('.choice').append(div);
        }
    } catch (error) {
        result.innerText = 'NO QUESTIONS ARE PRESENT AT THIS MOMENT';
    }
}
const showStart = async () => {
    if (user.type === 'host') {
        time.style.visibility = 'visible';
        setting.style.display = 'flex';
        code.style.display = 'none';

        
    }
}
let players = document.querySelector('.players');
let questionBox = document.querySelector('.question');
const answer = document.querySelector('.input');
const time = document.querySelector('.time');
const result = document.querySelector('.result');
const form = document.querySelector('.answer');
const start = document.querySelector('.start');
const ok = document.querySelector('.OK');
const setting = document.querySelector('.setting');
const showrules = document.querySelector('.showrules');
const container = document.querySelector('.container')
const timeRange = document.querySelector("#timeRange");
const scoreRange = document.querySelector('#scoreRange');
const body = document.querySelector('body');
const checkbox = document.getElementsByName('option');
const code = document.querySelector('.code');
ok.addEventListener('click', () => {
    setting.style.display = 'none';
    showrules.style.display = 'inline-block';
})
showrules.addEventListener('click', () => {
    setting.style.display = 'flex';
    showrules.style.display = 'none';
    start.style.display = 'none';
})
const design = async () => {
    for (let i = 0; i < 500; i++) {
        const c = document.createElement('div');
        c.className = 'circle';
        c.style.top = `${Math.random() * 99}%`
        c.style.left = `${Math.random() * 99}%`
        c.style.boxShadow = `2px 2px 20px 5px rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`
        body.append(c);
    }
}
function show(e, id) {
    document.getElementById(id).innerText = e.target.value;
}
ok.addEventListener('click', async () => {
    socket.emit('update_setting', { timer: timeRange.value, score: scoreRange.value, room: user.room })
    var checkboxes = [];
    for (var i = 0; i < checkbox.length; i++) {
        if (checkbox[i].checked) {
            checkboxes.push(checkbox[i].value);
        }
    }
    try {
        await axios.post('/game/questions', { input: checkboxes, room: user.room });
        start.style.display = 'inline-block'
    } catch (error) {
        result.innerText = 'SELECT ANY ONE CATEGORY';
    }
})

design();
checkToken();
showStart();
start.addEventListener('click', () => {
    form.style.visibility = 'visible';
    socket.emit('start_timer', { room: user.room });
    start.style.display = 'none';
    showrules.style.display = 'none';
    setting.style.display = 'none';
    code.style.display = 'flex';
    checkbox.forEach((checkboxes) => {
        checkboxes.checked = false;
    });
})
socket.on('show_players', () => showAllPlayers())
socket.on('update_player', (data) => {
    const { name, id, room, type } = data;
    user.name = name;
    user.id = id;
    user.room = room;
    user.type = type;
})
socket.on('show_question', () => showQuestion())
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const ans = answer.value;
    try {
        await axios.post('/game/checkAnswer', { ans: ans, room: user.room });
        console.log("correct");
        socket.emit('update_result', { room: user.room });
        form.style.visibility = 'hidden';
    } catch (error) {
        console.log("wrong answer");
    }
    answer.value = '';
})
socket.on('timer', (t) => {
    time.innerText = `${t}s`;
})
socket.on('show_answer', async () => {
    result.style.background = 'white';
    try {
        const d = await axios.post('/game/showAnswer', { room: user.room });
        result.innerText = d.data.data;
    } catch (error) {
        console.log(error);
    }
})
socket.on('hide_input', () => {
    form.style.visibility = 'hidden';
    time.style.visibility = 'hidden';
})
socket.on('show_result', function (d) {
    const { name } = d;
    result.style.background = 'white';
    result.innerText = `${name} is Winner`;
    questionBox.innerText = '';
})
socket.on('show_start', () => showStart());
socket.on('show_setting', (d) => {
    document.querySelector('.total').innerText = `Score(${d.score})`;
    time.innerText = `${d.timer}s`;
})