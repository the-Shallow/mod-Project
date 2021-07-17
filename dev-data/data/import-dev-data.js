const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Tour = require('./../../models/tourModel');
const User = require('./../../models/userModel');
const Review = require('./../../models/reviewModel');
dotenv.config({ path: "./config.env" });


const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD );

mongoose.connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log("DB Coneection Successfull");
});

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf8',));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf8'));
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf8'));

// import data into DB
const importData = async () => {
    try {
        await Tour.create(tours);
        await User.create(users, { validateBeforeSave: false });
        await Review.create(reviews);
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

// delete all data from DB

const deleteData = async () => {
    try {
        await Tour.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();
        console.log("Data succesfully deleted");
    } catch (err) {
        console.log(err);
    }
    process.exit();
}

if (process.argv[2] == "--import") {
    importData();
} else if (process.argv[2] == "--delete") {
    deleteData();
}