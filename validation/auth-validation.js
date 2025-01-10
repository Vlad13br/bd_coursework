const Joi = require("joi");

const registerSchema = Joi.object({
    name: Joi.string().min(3).required().messages({
        "string.empty": "Name is required",
        "string.min": "Name must be at least 2 characters long",
    }),
    surname: Joi.string().min(3).required().messages({
        "string.empty": "Surname is required",
        "string.min": "Surname must be at least 2 characters long",
    }),
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    password: Joi.string().min(8).required().messages({
        "string.empty": "Password is required",
        "string.min": "Password must be at least 6 characters long",
    }),
    address: Joi.string().required().messages({
        "string.empty": "Address is required",
    }),
    phone: Joi.string().pattern(/^\+?\d{10,15}$/).required().messages({
        "string.empty": "Phone number is required",
        "string.pattern.base": "Invalid phone number format",
    }),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required().messages({
        "string.empty": "Email is required",
        "string.email": "Invalid email format",
    }),
    password: Joi.string().required().messages({
        "string.empty": "Password is required",
    }),
});

module.exports= {loginSchema,registerSchema}