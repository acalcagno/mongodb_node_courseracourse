const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorites = require('../models/favorite');

const favRouter = express.Router();

favRouter.use(bodyParser.json());

favRouter.route('/')
.get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.find({"user":req.user.id })
    .populate('dishes')
    .populate('user')
    .then(function(fav) {
        res.json(fav)
    })
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    updateFavs(req.user.id, req.body, res, next)
})
.delete(cors.corsWithOptions, authenticate.verifyUser,(req, res, next) => {
    Favorites.findOneAndDelete({"user": req.user.id})
    .then((fav) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    })
    .catch((err) => next(err));
})


favRouter.route('/:dishId')
.options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
.post(cors.cors, authenticate.verifyUser, (req,res,next) => {
    updateFavs(req.user.id, req.params.dishId, res, next)
})
.delete(cors.cors, authenticate.verifyUser, (req,res,next) => {
    Favorites.findOneAndUpdate({"user": req.user.id}, {$pull: {"dishes": req.params.dishId}})
    .then((fav) => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(fav);
    })
    .catch((err) => next(err));
})


updateFavs = function (user_id, dishes, res, next) {
    Favorites.findOneAndUpdate({"user": user_id}, {$addToSet: {"dishes": dishes}}, { upsert:true, new:true })
        .then((fav) => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(fav);
        })
    .catch((err) => next(err));
}

module.exports = favRouter;