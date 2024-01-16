import Contact from "../models/Contact.js";
import { ctrlWrapper } from "../decorators/index.js"
import { HttpError } from "../helpers/index.js";

const getAll = async (req, res) => {
    const { _id: owner } = req.user;
    const {page = 1, limit = 10, favorite} = req.query;
    const skip = (page - 1) * limit;
    let find = {
        owner
    };

    if (favorite) {
        find = {
            owner,
            favorite
        };
    }
    
    const result = await Contact.find(find, "-createdAt -updatedAt", { skip, limit }).populate("owner", "email");

    res.json(result);  
}

const getById = async (req, res) => { 
    const { contactId: _id } = req.params;
    const { _id: owner } = req.user;
    const result = await Contact.findOne({_id, owner});
    if (!result) {
        throw HttpError(404, `Contact with id=${_id} not found`);    
    }

    res.json(result);
}


const add = async (req, res) => {
    const { _id: owner } = req.user;
    const result = await Contact.create({...req.body, owner});

    res.status(201).json(result)   
}

const updateById = async (req, res) => {
    const { contactId: _id } = req.params;
    const {_id: owner} = req.user;
    const result = await Contact.findOneAndUpdate({_id, owner}, req.body);
    if (!result) {
        throw HttpError(404, `Contact with id=${_id} not found`);
    }

    res.json(result);
}


const deleteById = async (req, res) => {
    const { contactId: _id } = req.params;
    const {_id: owner} = req.user;
    const result = await Contact.findOneAndDelete({_id, owner});
    if (!result) {
        throw HttpError(404, `Contact with id=${_id} not found`);
    }

    res.json({
        message: "Delete success"
    })
    
   
}


export default {
    getAll: ctrlWrapper(getAll),
    getById: ctrlWrapper(getById),
    add: ctrlWrapper(add),
    updateById: ctrlWrapper(updateById),
    deleteById: ctrlWrapper(deleteById),
}