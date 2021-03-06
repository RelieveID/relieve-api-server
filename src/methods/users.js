'use strict';

const { HttpError } = require('relieve-common');
const bcrypt = require('bcryptjs');

const Repository = require('../repositories');
const { profile, completeRegister } = require('../utils/transformers/user_transformer');
const AddressAdapter = require('../utils/adapters/address');

exports.profile = async (data, context) => {
    try {
        const Repo = new Repository();
        const user = await Repo.get('user').findOne({ _id: context.id });

        return {
            message: 'successy retrieved profile data',
            data: profile(user)
        };
    } catch (err) {
        if (err.status) throw err;
        throw HttpError.InternalServerError(err.message);
    }
};

exports.completeProfile = async (data, context) => {
    try {
        const Repo = new Repository();

        const user = await Repo.get('user').findOne({ _id: context.id, is_complete: false });
        if (!user) throw HttpError.Forbidden('profile already completed');

        const check = await Repo.get('user').findOne({ username: data.body.username });
        if (check) throw HttpError.UnprocessableEntity('username alerady exsist');

        const payload = completeRegister(data.body);
        await user.update(payload);

        /** generate address */
        await AddressAdapter.createNewAddress(data.body.address, user.id);

        return {
            message: 'complete register success'
        };
    } catch (err) {
        if (err.status) throw err;
        throw HttpError.InternalServerError(err.message);
    }
};

exports.updateProfile = async (data, context) => {
    try {
        const { body } = data;
        const Repo = new Repository();

        const payload = { ...body };
        if (payload.username) {
            const find = await Repo.get('user').findOne({ username: payload.username });
            if (find) throw HttpError.BadRequest('username already exsist');
        }

        await Repo.get('user').updateOne({ _id: context.id }, payload);

        return {
            message: 'update profile success'
        };
    } catch (err) {
        if (err.status) throw err;
        throw HttpError.InternalServerError(err.message);
    }
};

exports.updatePassword = async (data, context) => {
    try {
        const { body: { old_password: password, new_password: newPass, confirm_password: confirmPass } } = data;
        const Repo = new Repository();

        /** get complete user data */
        const user = await Repo.get('user').findOne({ _id: context.id });
        if (!bcrypt.compareSync(password, user.password)) throw HttpError.NotAuthorized('credentials not match');

        /** check wheter new and confirm password is same */
        if (newPass !== confirmPass) throw HttpError.BadRequest('password confirmation not same');

        /** update password */
        await Repo.get('user').updateOne({ _id: context.id }, { password: bcrypt.hashSync(newPass, 10) });

        return {
            message: 'password update success'
        };
    } catch (err) {
        if (err.status) throw err;
        throw HttpError.InternalServerError(err.message);
    }
};

exports.updateFcmToken = async (data, context) => {
    try {
        const Repo = new Repository();
        await Repo.get('user').updateOne({ _id: context.id }, { fcm_token: data.body.fcm_token });

        return {
            message: 'fcm update success'
        };
    } catch (err) {
        if (err.status) throw err;
        throw HttpError.InternalServerError(err.message);
    }
};

module.exports = exports;
