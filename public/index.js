const back = document.querySelector('.back');
const form = document.querySelector('.entry');
const name = document.querySelector('.name');
const main = document.querySelector('.main');
const host = document.getElementById('host');
const join = document.getElementById('join');
const codebox = document.querySelector('.codebox');
const center = document.querySelector('.center');
const code = document.querySelector('.code');
const circle=document.getElementsByClassName('circle');
const body=document.querySelector('body');
let user;
async function art(e) {
    const type=e;
    const name=user;
    const d={type,name};
    if(type==='join'){
        d.input=code.value;
    }
    try {
        const {data}=await axios.post('/auth/getToken',d);
        localStorage.setItem('token',data.token);
        window.location.href = `game.html`;
    } catch (error) {
        localStorage.removeItem('token');
        console.log("no room present");
        code.value='';
    }
}
form.addEventListener('submit', (e) => {
    e.preventDefault();
    user = name.value;
    form.style.display = 'none';
    main.style.display = 'flex';
    main.style.flexWrap = 'wrap';
    main.style.justifyContent='center';
    name.value='';
})
main.addEventListener('click', (e) => {
    const e1 = e.target;
    if (e1.className == 'btn1') {
        if (e1.id == 'join') {
            host.style.display = 'none';
            codebox.className = 'center';
            main.style.justifyContent = 'space-around';
            back.style.display = 'inline-block';
        }
        else {
            join.style.display = 'none';
        }
    }
})
back.addEventListener('click', () => {
    host.style.display = 'inline-block';
    main.style.justifyContent = 'space-between';
    back.style.display = 'none';
    codebox.className = 'codebox';
})
codebox.addEventListener('submit', (e) => {
    e.preventDefault();
    art('join');
})
join.addEventListener('click', (e) => {
    if (code.value.length == 4) {
        art('join');
    }
})
for(let i=0;i<500;i++){
    const c=document.createElement('div');
    c.className='circle';
    c.style.top=`${Math.random()*99}%`
    c.style.left=`${Math.random()*99}%`
    c.style.boxShadow=`2px 2px 20px 5px rgb(${Math.random()*255},${Math.random()*255},${Math.random()*255})`
    body.append(c);
}
setInterval(()=>{
    for(let i=0;i<500;i++){
        circle[i].style.top=`${Math.random()*99}%`
        circle[i].style.left=`${Math.random()*99}%`
    }
},5000);