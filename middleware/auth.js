const jwt = require('jsonwebtoken');
//const {UnauthenticatedError} = require('../errors');


const authenticationMiddleware = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(404).send("Session expired");
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const {name,type,room} = decoded;
        req.user = {name,type,room};
        next();
    } catch (error) {
        return res.status(404).send("Session expired");
    }
}

module.exports = authenticationMiddleware;
