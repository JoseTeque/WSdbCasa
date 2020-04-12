const express = require('express');
const app = express();

const morgan = require('morgan');
const body_parser = require('body-parser'); 
const routes = require('./routes/index')

//settings
app.set('port', process.env.PORT || 3000);

//middlewares
app.use(morgan('dev'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({extended:true}));

app.use('/', routes);

//static files

app.listen(app.get('port'), ()=>{
    console.log('server on port 3000');
});