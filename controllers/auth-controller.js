import fs from "fs/promises";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import "dotenv/config";
import gravatar from "gravatar";
import jimp from "jimp";

import User from "../models/User.js";

import { HttpError } from "../helpers/index.js";

import { ctrlWrapper } from "../decorators/index.js";

const {JWT_SECRET} = process.env;

const avatarsPath = path.resolve("public", "avatars");

const signup = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({email});
    if (user) {
        throw HttpError(409, "Email in use");
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const url = gravatar.url(email, {protocol: 'http', s: '250'});
    const newUser = await User.create({...req.body, avatarURL: url, password: hashPassword});

    res.json({
        "user": {
            "email": newUser.email,
            "subscription": newUser.subscription,
            "avatarURL": newUser.avatarURL
        }
    })
}

const signin = async(req, res)=> {
    const {email, password} = req.body;
    const user = await User.findOne({ email });
    if (! user) {
        throw HttpError(401, "Email or password is wrong");
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    
    if (! passwordCompare) {
        throw HttpError(401, "Email or password is wrong");
    }

    const {_id: id} = user;
    const payload = {
        id
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "23h" });
    await User.findByIdAndUpdate(id, {token});

    res.json({
        token,
        user: {
            "email": user.email,
            "subscription": user.subscription
        }
    })
}

const getCurrent = async(req, res)=> {
    const {subscription, email} = req.user;

    res.json({
        email,
        subscription
    })
}

const signout = async(req, res)=> {
    const { _id } = req.user;
    await User.findByIdAndUpdate(_id, {token: ""});

    res.status(204).send();
}

const subscribe = async (req, res) => {
    const { _id, email } = req.user;
    const { subscription } = req.body;
    const result = await User.findOneAndUpdate(_id, { subscription: subscription });
    if (!result) {
        throw HttpError(404, `Could not update user with id=${_id}`);
    }

    res.json({
        user: {
            "subscription": result.subscription
        }
    })

}

const avatar = async (req, res) => {
    const { _id } = req.user;
    const { path: oldPath, filename } = req.file;
    const newPath = path.join(avatarsPath, filename);

    const image = await jimp.read(oldPath);

    await image.resize(250, 250);

    await image.writeAsync(oldPath);

    await fs.rename(oldPath, newPath);

    const avatar = path.join("avatars", filename);
    const result = await User.findOneAndUpdate(_id, { avatarURL: avatar });
    if (!result) {
        throw HttpError(404, `Could not update user with id=${_id}`);
    }

    res.json({
        "avatarURL": result.avatarURL
    })
}

export default {
    signup: ctrlWrapper(signup),
    signin: ctrlWrapper(signin),
    getCurrent: ctrlWrapper(getCurrent),
    signout: ctrlWrapper(signout),
    subscribe: ctrlWrapper(subscribe),
    avatar: ctrlWrapper(avatar)
}