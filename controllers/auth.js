const jwt = require('jsonwebtoken');
const { hosts } = require('../sockets/sockets');
const generateCode = () => {
    var code="";
    for (var i = 0; i < 4; i++) {
        const no = Math.floor(Math.random() * 26);
        code += String.fromCharCode(65 + no);
    }
    const record=hosts.host.find((d)=>d.roomcode===code)
    if(record){
        return generateCode();
    }
    return code;
}
const getToken = (req, res) => {
    const { name, input, type } = req.body;
    let a;
    if (input) {
        a = hosts.host.find((h) => h.roomcode === input.toUpperCase());
        if (!a) {
            return res.status(403).json({ msg: "no room found" });
        }
    }
    else {
        const code = generateCode();
        a = { room: `${code}`, roomcode: `${code}` };
        hosts.activeRooms++;
        hosts.host.push(a);
    }
    const token = jwt.sign({ name, type, 'room': a.room }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token });
}
const checkToken = (req, res) => {
    res.status(200).json(req.user);
}
module.exports = { getToken, checkToken };