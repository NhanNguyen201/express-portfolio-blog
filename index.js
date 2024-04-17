require('dotenv').config()
const express = require("express");
const cors = require('cors');
const { indexRoute, slugRoute} = require('./utils/routeHandler')
const app = express();

const PORT = process.env.PORT || 3000
app.use(cors({
    origin: true
}));
app.use(express.static('public'))
app.set('view engine', 'ejs');
app.get("/", indexRoute);
app.get("/*", slugRoute)
app.listen( PORT, () => console.log(`App is running at port ${PORT}`));