const docs = require('../../models/doctorModel');

module.exports = {
    getDocs: async (req, res) => {
        try {
            docs.find().then(docsDatas => {
                res.status(200).json({ docsDatas });
            })
        } catch (error) {
            console.log(error.message);
        }
    },

    blockDoc: async (req, res) => {
        try {
            const { _id } = req.params;
            await docs.updateOne({ _id }, [{ "$set": { "blockStatus": { "$eq": [false, "$blockStatus"] } } }]).then(response => {
                res.sendStatus(200);
            });
        } catch (error) {
            console.log(error.message);
        }
    },

    approve: async (req, res) => {
        try {
            const { _id } = req.params;
            await docs.updateOne({ _id }, { "$set": { approved: true } }).then(response => {
                res.sendStatus(200);
            })
        } catch (error) {
            console.log(error.message);
        }
    },
    
    deleteDoc: async (req, res) => {
        try {
            const { _id } = req.params;
            await docs.deleteOne({ _id }).then(response => {
                res.sendStatus(204); //resource deleted successully
            })
        } catch (error) {
            console.log(error.message);
        }
    }
}