const express = require("express")
const mongoose = require("mongoose")
const ShortUrl = require("./models/shortUrl")
const cookieParser = require("cookie-parser")
const uuid = require('uuid');
const http = require('http');

const MONGO_URL = "mongodb+srv://ksltin:LfZ08PMiSs7tVdoc@ksltin.puquh.azure.mongodb.net/ksltin?retryWrites=true&w=majority"


const app = express()

mongoose.connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})


app.set('view engine', 'ejs')
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
// all environments
app.set('port', process.env.PORT || 3000);
//app.set('port',443);
//app.set('views', path.join(__dirname, 'views'));
//app.use(express.favicon());
//app.use(express.logger('dev'));
//app.use(express.json());
//app.use(express.methodOverride());
//app.use(app.router);
//app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
    // app.use(express.errorHandler());
}



app.get('/', async (req, res) => {

    //console.log(req.cookies["ksltin-userguid"])
    let userguid = req.cookies["ksltin-userguid"];
    if (!req.cookies["ksltin-userguid"]) {
        userguid = uuid.v1()
        res.cookie('ksltin-userguid', userguid, {
            expires: new Date(Date.now() + 3 * 10500000000)
        });
    }

    const shortUrls = await ShortUrl.find({ userguid: userguid })
    console.log(shortUrls)
    res.render('index', { shortUrls: shortUrls })
})
app.get('/allurls', async (req, res) => {
    const shortUrls = await ShortUrl.find({})
    res.render('allurls', { shortUrls: shortUrls })
})
app.post('/shortUrls', async (req, res) => {

    let userguid = req.cookies["ksltin-userguid"];
    await ShortUrl.create({ userguid: userguid, full: req.body.fullUrl })

    res.redirect('/')
})

app.get('/:shortUrl', async (req, res) => {

    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl })
    if (shortUrl == null) return res.sendStatus(400)
    shortUrl.clicks++
    shortUrl.save()
    res.redirect(shortUrl.full)
})
app.get('/remove/:_id', async (req, res) => {

    console.log(req.params)
    const shortUrl = await ShortUrl.findOne({ _id : req.params._id })
    if (shortUrl == null) return res.sendStatus(400)
    shortUrl.remove()
    shortUrl.save()
    res.redirect('/')
})
//app.listen(process.env.PORT || 5000)
http.createServer(app).listen(app.get('port'), function () {
    console.log('Express server listening on port ' + app.get('port'));
});
