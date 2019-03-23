const BaseJoi = require('joi');
const Extension = require('joi-date-extensions');

const Joi = BaseJoi.extend(Extension);
const validator = require('../request-handler/validator');

const COOR_REGEX = /^([-+]?)([\d]{1,2})(((\.)(\d+)(,)))(\s*)(([-+]?)([\d]{1,3})((\.)(\d+))?)$/;

const schemas = {
    nearby: Joi.object({
        query: Joi.object({
            radius: Joi.number().integer().positive().required(),
            coordinates: Joi.string().regex(COOR_REGEX).required()
        }).required()
    }),
    address: Joi.object({
        query: Joi.object({
            coordinates: Joi.string().regex(COOR_REGEX).required()
        }).required()
    })
};

module.exports = method => validator(schemas[method]);