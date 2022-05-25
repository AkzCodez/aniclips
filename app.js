const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const path = require('path');
var bodyParser = require('body-parser')
var jsonParser = bodyParser.json()
var session = require('express-session')

app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true
  })); 
app.use( bodyParser.json()); 
 

//Loads the handlebars module
const { engine } = require('express-handlebars');

//Sets our app to use the handlebars engine
app.set('view engine', 'handlebars');
//a silly change

//Sets handlebars configurations (we will go through them later on)
app.engine('handlebars', engine({
layoutsDir: __dirname + '/views/layouts',
}));

app.use(session({
    name: 'sid',
    resave: false,
    secret: 'test',
    saveUninitialized: false,
    cookie: {
        maxAge: 1000*60*60*2,
        sameSite: "lax",
        secure: false
    }
}))

const checkIfLoginIn = (req,res,next) => {
    if(!req.session.loggedin) {
        return res.render('login', {
            layout: 'index',
            loggedin: req.session.loggedin
        }); 
    }
    else {
        next();
    }
}

app.use(express.static('public'))


// app.set("views", "./views");


// app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('main', {layout : 'index',loggedin: req.session.loggedin
});
});

app.get('/about', (req, res) => {
    res.render('about', {layout: 'index',loggedin: req.session.loggedin
});
});

app.get('/characters', checkIfLoginIn, (req, res) => {
    res.render('characters', {layout: 'index',loggedin: req.session.loggedin
});
});

app.get('/login', (req, res) => {
    res.render('login', {layout: 'index',loggedin: req.session.loggedin
});
});

app.get('/signup', (req, res) => {
    if(req.session.loggedin)
    {
        return res.render('main', {
            layout: 'index',
            loggedin: req.session.loggedin
        });    
    }
    
    res.render('signup', {layout: 'index',loggedin: req.session.loggedin
});
});

app.get("/test", (req, res) => {
    res.send("Running at /test");
});

app.listen(port, ()=> {
    console.log(`Our server is up and running on port: ${port}`);
});

app.get('/logout', checkIfLoginIn, (req, res) => {
    req.session.loggedin = false;
    res.render('logout', {layout: 'index',loggedin: req.session.loggedin
});
});








const users = [{
    username: "oz",
    name: "Ozgur",
    password: "$2b$10$XaVTDxTizcIzIghOMeejMOe6GF5u.kryxe8kF8cz5zIaEdA87ka6a"
}]

const bcrypt = require('bcrypt');
const async = require('hbs/lib/async');

app.get('/users', (req, res) => {
    res.json(users)
})

app.post('/users', jsonParser, async (req, res) => {
    try {  
        const hashedPassword = await bcrypt.hash(req.body.password, 10)
        const user = { name: req.body.name, password: hashedPassword }
        users.push(user)
        res.status(201).send()
    } catch {
        res.status(500).send()
    }
})

function checkUsername(userFromForm, userFromArray) {
    return userFromForm == userFromArray;
  }


app.post('/signup', jsonParser, async (req, res) => {
    try {

        if(req.session.loggedin)
        {
            return res.render('main', {
                layout: 'index',
                loggedin: req.session.loggedin
            });    
        }

        const {
            username,
            email,
            password
        } = req.body;


        if(username==null || email == null || password == null )
        {
            return res.render('signup', {
                layout: 'index',
                message: 'enter all required fields',
                loggedin: req.session.loggedin
            });    

        }
        
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = { username: username, email: email, name: username, password: hashedPassword }

        users.push(user)
        req.session.loggedin = true;

        return res.render('main', {
                layout: 'index',
                loggedin: req.session.loggedin
            });  

    } catch {
        return res.render('signup', {
            layout: 'index',
            message: 'Error 500!',
            loggedin: req.session.loggedin
        });    
    }
})

app.post('/login', jsonParser, async (req, res) => {
    try {

        console.log(req.body )

        const {
            username,
            password
        } = req.body;

        console.log(users)

        const index = users.findIndex((u) => u.name==username);
        
        console.log(index);

        if(index==-1)
        {
            return res.render('login', {
                layout: 'index',
                message: 'Could not find the user!'});
        }

        user = users[index];
        
        if (username == null) {
            return res.render('login', {
                layout: 'index',
                message: 'Cannot find user!',
                loggedin: req.session.loggedin
            });
        }

        if(username != user.name)
        {
            return res.render('login', {
                layout: 'index',
                message: 'Invalid username!',
                loggedin: req.session.loggedin
            });
        }

        if(await bcrypt.compare(password, user.password)) {
            req.session.loggedin = true;

            return res.render('characters', {
                layout: 'index',
                loggedin: req.session.loggedin
            });        
            } 
        else {
            return res.render('login', {
                layout: 'index',
                message: 'Incorrect credentials!',
                loggedin: req.session.loggedin
            });        }
    } catch {
        return res.render('login', {
            layout: 'index',
            message: 'Error 500!',
            loggedin: req.session.loggedin
        });    }
})