const statesData = require('../models/statesData.json');
const State = require('../models/State');

exports.getRandomFunFact = async (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    if (!state) {
        return res.status(404).json({ message: "Invalid state abbreviation parameter" });
    }
    const funfactDoc = await State.findOne({ stateCode: req.code });
    if (!funfactDoc || !funfactDoc.funfacts || funfactDoc.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${state.state}` });
    }
    const random = funfactDoc.funfacts[Math.floor(Math.random() * funfactDoc.funfacts.length)];
    res.json({ funfact: random });
};

async function mergeFunfacts(states) {
    const funfacts = await State.find({ stateCode: { $in: states.map(s => s.code) } });
    return states.map(state => {
        const found = funfacts.find(f => f.stateCode === state.code);
        return found ? { ...state, funfacts: found.funfacts } : state;
    });
}

exports.getAllStates = async (req, res) => {
    let filtered = statesData;
    if (req.query.contig === 'true') {
        filtered = statesData.filter(s => s.code !== 'AK' && s.code !== 'HI');
    } else if (req.query.contig === 'false') {
        filtered = statesData.filter(s => s.code === 'AK' || s.code === 'HI');
    }
    const result = await mergeFunfacts(filtered);
    res.json(result);
};

exports.getState = async (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    if (!state) return res.status(404).json({ message: 'State not found' });
    const funfact = await State.findOne({ stateCode: req.code });
    if (funfact) state.funfacts = funfact.funfacts;
    res.json(state);
};

exports.getStateField = (field) => (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    if (!state) return res.status(404).json({ message: 'State not found' });

    switch (field) {
        case 'population':
            const popStr = state.population.toLocaleString('en-US');
            return res.json({ state: state.state, population: popStr });
        case 'capital':
            return res.json({ state: state.state, capital: state.capital_city });
        case 'nickname':
            return res.json({ state: state.state, nickname: state.nickname });
        case 'admission':
            return res.json({ state: state.state, admitted: state.admission_date });
        default:
            return res.status(400).json({ message: 'Invalid field' });
    }
};

exports.addFunFacts = async (req, res) => {
    const { funfacts } = req.body;
    if (!funfacts) {
        return res.status(400).json({ message: 'State fun facts value required' });
    }
    if (!Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value must be an array' });
    }

    let stateDoc = await State.findOne({ stateCode: req.code });
    if (stateDoc) {
        stateDoc.funfacts.push(...funfacts);
        await stateDoc.save();
    } else {
        stateDoc = await State.create({ stateCode: req.code, funfacts });
    }

    const stateData = statesData.find(s => s.code === req.code);
    const response = {
        state: stateData.state,
        code: stateData.code,
        nickname: stateData.nickname,
        funfacts: stateDoc.funfacts
    };
    res.json(response);
};

exports.updateFunFact = async (req, res) => {
    const { index, funfact } = req.body;
    const stateData = statesData.find(s => s.code === req.code);

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }
    if (!funfact || typeof funfact !== 'string') {
        return res.status(400).json({ message: 'State fun fact value required' });
    }

    let stateDoc = await State.findOne({ stateCode: req.code });
    if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    const arrIndex = index - 1;
    if (arrIndex < 0 || arrIndex >= stateDoc.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }

    stateDoc.funfacts[arrIndex] = funfact;
    await stateDoc.save();

    const response = {
        state: stateData.state,
        code: stateData.code,
        nickname: stateData.nickname,
        funfacts: stateDoc.funfacts
    };
    res.json(response);
};

exports.deleteFunFact = async (req, res) => {
    const { index } = req.body;
    const stateData = statesData.find(s => s.code === req.code);

    if (index === undefined) {
        return res.status(400).json({ message: 'State fun fact index value required' });
    }

    let stateDoc = await State.findOne({ stateCode: req.code });
    if (!stateDoc || !stateDoc.funfacts || stateDoc.funfacts.length === 0) {
        return res.status(404).json({ message: `No Fun Facts found for ${stateData.state}` });
    }

    const arrIndex = index - 1;
    if (arrIndex < 0 || arrIndex >= stateDoc.funfacts.length) {
        return res.status(404).json({ message: `No Fun Fact found at that index for ${stateData.state}` });
    }

    stateDoc.funfacts.splice(arrIndex, 1);
    await stateDoc.save();

    const response = {
        state: stateData.state,
        code: stateData.code,
        nickname: stateData.nickname,
        funfacts: stateDoc.funfacts
    };
    res.json(response);
};