var mysql = require('mysql');
var express = require('express');
var session = require('express-session');
var bodyParser = require('body-parser');
var path = require('path');
var router=express.Router();
var fs = require('fs');
var multer =require('multer');

var connection = mysql.createConnection({
	host     : 'localhost',
	user     : 'root',
	password : '',
	database : 'sc'
});

var app = express();
app.set('html');
app.use(session({ 
	secret: 'secret',
	resave: true,
	saveUninitialized: true
}));
//app.use(express.static('assets'))
app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.get('/', function(request, response) {
	response.sendFile(path.join(__dirname + '/home.html'));
});

app.get('/loginf', function(request, response) {
	response.sendFile(path.join(__dirname + '/views/loginf.html'));
});

//route:authorise
app.post('/auth', function(request, response) {
	var femail = request.body.femail;
	var fpass = request.body.fpass;
	if (femail && fpass) {
		if(femail=='admin@gec.ac.in'&&'gec123'){
			console.log('yay');
			request.session.loggedin = true;
			request.session.femail = 'Administrator';
				response.redirect('/aindex');
			}
			else{
		let sql='SELECT * FROM faculty WHERE femail = ? AND fpass = ?';
		connection.query(sql, [femail, fpass], function(error, results, fields) {
			if (results.length > 0) {
				request.session.loggedin = true;
				request.session.femail = femail;
				response.redirect('/index');
			} else {
				response.send('Incorrect Username and/or Password!');
			}			
			response.end();
		});
	} 
}
else {
		response.send('Please enter Username and Password!');
		response.end();
	}
});

//route:home
app.get('/home', function(request, response) {
	if (request.session.loggedin) {
		response.send('Welcome back, ' + request.session.femail + '!');
	} else {
		response.send('Please login to view this page!');
	}
	response.end();
});

//Display Resources
app.get('/display', function(req, res) { 
let query= connection.query('SELECT * FROM resource', function(error, results,fields) {
	if(error) console.log('error');

	res.render('display.html',{resource:results});
	});
});

//Display Faculty
app.get('/viewa', function(req, res) { 
let query= connection.query('SELECT fid, fname, fphone, femail, did FROM faculty', function(error, results,fields) {
	if(error) console.log('error');

	res.render('viewa.html',{faculty:results});
	});
});

//Update Data
app.get('/modify', function(req, res) {
	rid=req.query['category'];
	res.render('modify.html');
});

app.get('/update', function(req, res){
		connection.query('SELECT rid, rname, author, rtype, sid FROM resource where rid=?',req.query['category'], function(error, results, fields){
			console.log(results)
			res.render('update.html', {resource:results,rid:req.query['category']});

});
});

app.post('/modify', function(req, res) {
	rid=req.body.rid;
	connection.query('SELECT rid, rname, author, rtype, sid FROM resource where rid=?',[rid], function(error, results, fields){
		console.log(results)
		res.render('update.html', {resource:results,rid:req.query['category']});
	});
});

app.post('/update1',function(request,response){
	rid=request.body.rid;
	rname=request.body.rname;
	author=request.body.author;
	rtype=request.body.rtype;
	sid=request.body.sid;
		if(rname && rid)
		connection.query('UPDATE resource set rname=? where rid=?',[rname,rid]);
	    if(author && rid) 
		connection.query('UPDATE resource set author=? where rid=?',[author,rid]);
	    if(rtype && rid) 
		connection.query('UPDATE resource set rtype=? where rid=?',[rtype,rid]);
		if(sid && rid) 
		connection.query('UPDATE resource set sid=? where rid=?',[sid,rid]);
     	connection.query('SELECT rid, rname, author, rtype, sid FROM resource WHERE rid=?',rid, function(error, results, fields) {
		console.log(results);
		let query= connection.query('SELECT * FROM resource', function(error, results) {
			if(error) console.log('error');
			response.render('display.html',{resource:results});
		response.end();
		});
	});
});	

//Update Faculty Details

app.get('/updatea', function(req, res){
		
		connection.query('SELECT * FROM faculty where fid=?',req.query['category'],function(error, results, fields){
		res.render('updatea.html',{faculty:results,fid:req.query['category']});
		
	});
});


app.post('/updatea',function(request,response){
	fid=request.body.fid;
	fname=request.body.fname;
	fphone=request.body.fphone;
	femail=request.body.femail;
	fpass=request.body.fpass;
	did=request.body.did;
	console.log(fname);
		if(fname && fid)
		connection.query('UPDATE faculty set fname=? where fid=?',[fname,fid]);
	    if(fphone && fid) 
		connection.query('UPDATE faculty set fphone=? where fid=?',[fphone,fid]);
	    if(femail && fid) 
		connection.query('UPDATE faculty set femail=? where fid=?',[femail,fid]);
	    if(fpass && fid) 
		connection.query('UPDATE faculty set fpass=? where fid=?',[fpass,fid]);
		if(did && fid) 
		connection.query('UPDATE faculty set did=? where fid=?',[did,fid]);

     	connection.query('SELECT * FROM faculty WHERE fid=?',fid, function(error, results, fields) {
		console.log(results);
		let query= connection.query('SELECT * FROM faculty', function(error, results) {
			if(error) console.log('error');
			response.redirect('/aindex');
		response.end();
		});
	});
});	

//Search
app.get('/searchf', function(req, res) {
		res.render('search1f.html');
});


app.post('/searchf', function(req, res) {
	let sql = 'select * from resource where rname like "%'+req.body.search+'%"';
	connection.query(sql, function(error, results, fields) {
		if(error) throw error;
		res.render('searchf.html',{resource:results});
			});	
});

app.get('/search', function(req, res) {
		res.render('search1fh.html');
});


app.post('/search', function(req, res) {
	let sql = 'select * from resource where rname like "%'+req.body.search+'%"';
	connection.query(sql, function(error, results, fields) {
		if(error) throw error;
		res.render('searchfh.html',{resource:results});
			});	
});

//Add Resource
app.get('/add', function(req, res) {
	pid=req.query['category'];
	res.render('add.html');
  });

app.post('/add',function(request,response){
	rid=request.body.rid;
rname=request.body.rname;
link=request.body.link;
author=request.body.author;
rtype=request.body.rtype;
sid=request.body.sid;
fid=request.body.fid;
	if (rname && rid) {   
	let sql =   'insert into resource values(?,?,?,?,?,?,?)';
	 connection.query(sql, [rid,rname,link, author, rtype, sid, fid] , function(error, results, fields) {
		 console.log(results);	 
		if(error)console.log("error");
			});
	response.render('add1.html');
}
 	else
 		console.log("not happy");
});


/*app.post('/upload', function(req,res){
	res.redirect('/display');
});*/

/*let storage = multer.diskStorage({
    destination: function (req, file, callback) {
      callback(null, DIR);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }

});


let upload = multer({storage: storage});
*/

app.post('/api/v1/upload', function (req, res) {
    if (!req.file) {
        console.log("No file received");
        res.redirect('/display');
      } else {
        console.log('file received');
        console.log(req);
        res.redirect('/display');
      }
});


//Add Faculty
app.get('/adda', function(req, res) {
	fid=req.query['category'];
	res.render('adda.html');
  });

app.post('/adda',function(request,response){
	fid=request.body.fid;
	fname=request.body.fname;
	fphone=request.body.fphone;
	femail=request.body.femail;
	fpass=request.body.fpass;
	did=request.body.did;
	if (fname && fid) {   
	let sql =   'insert into faculty values(?,?,?,?,?,?)';
	 connection.query(sql, [fid,fname,fphone,femail, fpass, did] , function(error, results, fields) {
		 console.log(results);	 
		if(error)console.log("error");
			});
	/*connection.query('SELECT * FROM resource WHERE rid =?',rid, function(error, results, fields) {
		console.log(results);	});*/
	response.redirect('/aindex');
}
 	else
 		console.log("not happy");
});


//Delete Resource
app.get('/delete', function(req,res)
{
	rid=req.query['category'];
	res.render('delete.html');
});

app.post('/delete', function(req, res) 
{
	rid = req.body.rid;
	let sql = 'delete FROM resource where rid=?';
	connection.query(sql, [rid] , function(error, results, fields)
		{
			console.log(results);  
			res.redirect('/display');
		});
});

//Discard Faculty
app.get('/discard', function(req,res)
{
	fid=req.query['category'];
	console.log('yay');
	femail='NULL';
	let sql = 'UPDATE faculty set femail=? where fid=?';
	connection.query(sql, [femail,fid] , function(error, results, fields)
		{
			console.log(results);  
			res.redirect('/aindex');
		});
});



//route
app.get('/roufac', function(req, res) {
	id=req.query['category'];
res.render('index.html',{id:id});
});

app.get('/logout', function(req, res) {
	req.session.destroy(function(err){
		res.redirect('/');
	})
});

app.get('/index', function(request,response){
	response.render('index.html');
});

app.get('/aindex', function(request,response){
	let query= connection.query('SELECT * FROM faculty where femail <> ?', 'NULL', function(error, results,fields) {
	if(error) console.log('error');

	response.render('aindex.html',{faculty:results});
	});
	
});

app.get('/viewpdf', function(request,response) 
{
	pdf=request.query['category'];
	var tempFile=`upload/${pdf}`;

	fs.readFile(tempFile, function(err, data){
		response.contentType("application/pdf");
		response.send(data);
	});
} );

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', router);

app.listen(9000);