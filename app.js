const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

//Loads the handlebars module
const { engine } = require('express-handlebars');

//Sets our app to use the handlebars engine
app.set('view engine', 'handlebars');
//a silly change

//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', engine({
layoutsDir: __dirname + '/views/layouts',
}));


app.use(express.static('public'))


// app.set("views", "./views");


// app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('main', {layout : 'index'});
});

app.get('/about', (req, res) => {
    res.render('about', {layout: 'index'});
});

app.get('/characters', (req, res) => {
    res.render('characters', {layout: 'index'});
});

app.get('/login', (req, res) => {
    res.render('login', {layout: 'index'});
});

app.get('/signup', (req, res) => {
    res.render('signup', {layout: 'index'});
});

app.get("/test", (req, res) => {
    res.send("Running at /test");
});

app.listen(port, ()=> {
    console.log(`Our server is up and running on port: ${port}`);
});

