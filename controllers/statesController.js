const statesData = require('../models/statesData.json');
const State = require('../models/State');

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

exports.getRandomFunFact = async (req, res) => {
    const funfact = await State.findOne({ stateCode: req.code });
    if (!funfact || !funfact.funfacts || funfact.funfacts.length === 0) {
        return res.json({ message: `No Fun Facts found for ${req.code}` });
    }
    const random = funfact.funfacts[Math.floor(Math.random() * funfact.funfacts.length)];
    res.json({ funfact: random });
};

exports.getStateField = (field) => (req, res) => {
    const state = statesData.find(s => s.code === req.code);
    if (!state) return res.status(404).json({ message: 'State not found' });
    let value;
    switch (field) {
        case 'capital': value = state.capital_city; break;
        case 'nickname': value = state.nickname; break;
        case 'population': value = state.population; break;
        case 'admission': value = state.admission_date; break;
    }
    res.json({ state: state.state, [field]: value });
};

exports.addFunFacts = async (req, res) => {
    const { funfacts } = req.body;
    if (!funfacts || !Array.isArray(funfacts)) {
        return res.status(400).json({ message: 'State fun facts value required' });
    }
    let state = await State.findOne({ stateCode: req.code });
    if (state) {
        state.funfacts.push(...funfacts);
        await state.save();
    } else {
        state = await State.create({ stateCode: req.code, funfacts });
    }
    res.json(state);
};

exports.updateFunFact = async (req, res) => {
    const { index, funfact } = req.body;
    if (!index) return res.status(400).json({ message: 'State fun fact index value required' });
    if (!funfact) return res.status(400).json({ message: 'State fun fact value required' });
    const state = await State.findOne({ stateCode: req.code });
    if (!state || !state.funfacts || state.funfacts.length < index) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${req.code}` });
    }
    state.funfacts[index - 1] = funfact;
    await state.save();
    res.json(state);
};

exports.deleteFunFact = async (req, res) => {
    const { index } = req.body;
    if (!index) return res.status(400).json({ message: 'State fun fact index value required' });
    const state = await State.findOne({ stateCode: req.code });
    if (!state || !state.funfacts || state.funfacts.length < index) {
        return res.status(400).json({ message: `No Fun Fact found at that index for ${req.code}` });
    }
    state.funfacts.splice(index - 1, 1);
    await state.save();
    res.json(state);
};