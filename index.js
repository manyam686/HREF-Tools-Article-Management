// Require dependencies
var express = require('express'),
    path = require('path'),
    bodyParser = require('body-parser'),
    cons = require('consolidate'),
    dust = require('dustjs-helpers'),
    app = express();
require('dotenv').config();

//  Connect to database
const { Client } = require('pg');
const client = new Client({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});
client.connect();

// Assign Dust Engine to .dust Files
app.engine('dust',cons.dust);

// Set Default Ext .dust
app.set('view engine','dust');
app.set('views',__dirname+'/views');

//Set public folder
app.use(express.static(path.join(__dirname,'public')));

// Body parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Function to get tags associated with articles
async function getTags(articleInfo){
    let query = {
        text: 'SELECT tg_phrase FROM tag JOIN tag_relation ON tagno=tr_tagno JOIN article ON tr_articleno=articleno WHERE articleno=$1',
        values: [articleInfo.articleno],
        rowMode: 'array',
    };
    try {
        const res = await client.query(query)
        articleInfo.tags=res.rows
        return articleInfo
    } catch(err){
        console.log(err.stack)
    }
}

// Routes
app.get('/', async (req,res)=>{
    let query1 = {
        text: 'SELECT * FROM Article ORDER BY ar_status, articleno',
    };
    let query2 = {
        text: 'SELECT tg_phrase FROM Tag ORDER BY tg_phrase',
    };
    try {
        const result = await client.query(query1);
        const articleList = await Promise.all(result.rows.map(getTags));
        try {
            const result2 = await client.query(query2);
            const tags = result2.rows;
            res.render('index',{articles: articleList, tags: tags});
        }
        catch(err){
            console.log(err.stack)
        }      
    }
    catch(err) {
        console.log(err.stack)
    }

    // client.query('SELECT * FROM Article ORDER BY AR_Status, articleno LIMIT 5', async (err,result)=>{
    //     if (err){
    //         console.log(err.stack)
    //     } else{
    //         const articleList= await Promise.all(result.rows.map(getTags));
    //         console.log(articleList)
    //         res.render('index',{articles: articleList});
    //     }
    // })
    
})

// Approve article
app.get('/approve/:articleno',(req,res)=>{
    client.query('UPDATE Article SET AR_Status=$1 WHERE ArticleNo=$2',['approved',req.params.articleno],(err,result)=>{
        if (err){
            console.log(err.stack)
        } else{
            res.sendStatus(200);
        }
    });   
})

// Edit article
app.post('/edit',(req,res)=>{
    client.query('UPDATE Article SET ar_contenthtml=$1 WHERE articleno=$2',[req.body.ar_contenthtml,req.body.articleno],(err,result)=>{
        if (err){
            console.log(err.stack)
        } else{
            res.redirect('/');
        }
    })
})

// Edit article tags
app.post('/editTags', async (req,res)=>{
    if (req.body.tagSelection == ""){
        res.redirect('/')
    }
    else if (req.body.tags.includes(req.body.tagSelection)){
        res.redirect('/')
    }
    else{
        const query1 = {
            text: 'SELECT tagno FROM Tag WHERE tg_phrase=$1',
            values: [req.body.tagSelection]
        }
        try{
            const result = await client.query(query1)
            const tagno = result.rows[0]['tagno']
            try{
                const query2 = {
                    text: 'INSERT INTO tag_relation (tr_tagno, tr_articleno) VALUES($1,$2)',
                    values: [tagno,req.body.articleno]
                }
                const result2 = await client.query(query2)
                res.redirect('/');
            }
            catch(err){
                console.log(err.stack)
            }      
        }
        catch(err){
            console.log(err.stack)
        }
    }   
})

// Start server
app.listen(3000,()=>{
    console.log('Server started on port 3000');
})

