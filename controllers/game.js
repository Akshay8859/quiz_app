const { data } = require('../sockets/sockets');
const mongoose = require('mongoose');
function findData(d) {
    return data.find((datas) => d.room === datas.room);
}
const showAllPlayers = (req, res) => {
    const record = findData(req.body);
    res.status(200).json({ data: record.players });
}
const showQusestion = (req, res) => {
    const record = findData(req.body);
    res.status(200).json({ data: record.questions[record.index[0]][record.index[1]] });
}
const checkAnswer = (req, res) => {
    const { ans, room } = req.body;
    const record = findData({ 'room': room });
    const a = record.questions[record.index[0]][record.index[1]].answer.find((j) => ans.toLowerCase() === j.toLowerCase());
    if (a) {
        return res.status(200).json({ result: true });
    }
    res.status(422).json({ result: false });
}
const showAnswer = (req, res) => {
    const record = findData(req.body);
    res.status(200).json({ data: record.questions[record.index[0]][record.index[1]].detail });
}
const getQuestion = async (req, res) => {
    const { input,room} = req.body;
    const record = findData({ 'room': room });
    if (input.length == 0) {
        return res.status(400).json({ result: 'unsuccess' });
    }
    try {
        for (var i = 0; i < input.length; i++) {
            const collection = mongoose.connection.db.collection(`${input[i]}`);
            const docs = await collection.find({}).toArray();
            record.questions[i] = docs;
        }
        res.status(200).json({ result: 'success' });
    } catch (error) {
        console.log(error)
    }
}
const getCollections = async (req, res) => {
    // Get a reference to the database object
    try {
        const db = mongoose.connection.db;
        // Get a list of all collection names
        const d = await db.listCollections().toArray();
        const newArray = d.map(e => e.name);
        res.status(200).json({ data: newArray })
    } catch (error) {
        console.log(error);
    }
}
module.exports = { showQusestion, checkAnswer, showAllPlayers, showAnswer, getQuestion, getCollections };