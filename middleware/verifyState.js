const statesData = require('../models/statesData.json');
const stateCodes = statesData.map(state => state.code);

module.exports = (req, res, next) => {
    const code = req.params.state?.toUpperCase();
    if (!code || !stateCodes.includes(code)) {
        return res.status(404).json({ message: "Invalid state abbreviation parameter" });
    }
    req.code = code;
    next();
};