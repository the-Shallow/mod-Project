const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaughtException', (err) => {
    console.log('uncaughtException');
    console.log(err.name, err.message);
    process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");
// console.log(process.env);

const DB = process.env.DATABASE.replace('<PASSWORD>',process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(con => {
    console.log("DB Coneection Successfull");
});

const port = process.env.PORT;
const server = app.listen(port, () => {
    console.log("Listening to port:" + port);
});

process.on('unhandledRejection', (err) => {
    console.log('unhandledRejection');
    console.log(err.name, err.message);
    server.close(() => {
        process.exit(1);
    });
});

