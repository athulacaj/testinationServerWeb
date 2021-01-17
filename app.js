const express = require('express');
const ejs = require('ejs');
const admin=require('firebase-admin');
const  bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const csrf = require("csurf");
// for saving session
var session = require('express-session');
const genuuid = require("uuid"); // create unique id
//
const app = express();
const csrfMiddleware = csrf({ cookie: true });

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser());
app.use(csrfMiddleware);
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json())

var serviceAccount = require("./secret/admin.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://daily-needs-a9c69.firebaseio.com",
});

let db = admin.firestore();
const PORT = process.env.PORT || 3000;


// app.set('trust proxy', 1) // trust first proxy
app.use(session({
  secret: 'minnal murali',
  resave: false,
  saveUninitialized: true,
  genid: function(req) {
    return genuuid.v1();  // use UUIDs for session IDs
  },
  secret: 'keyboard cat'
}))



app.all("*", (req, res, next) => {
  res.cookie("XSRF-TOKEN", req.csrfToken());
  next();
});

app.get("/login", function (req, res) {
  res.clearCookie("session");
  res.render("auth");
});

app.get("/signup", function (req, res) {
  res.render("signup.html");
});


app.get("/", function (req, res) {

  const sessionCookie = req.cookies.session || "";
  console.log('calling /  :'+sessionCookie);
if(sessionCookie==""){
  res.redirect("/login");
}else{
  admin
    .auth()
    .verifySessionCookie(sessionCookie, true /** checkRevoked */)
    .then((decodedClaims) => {
      const uid = decodedClaims.uid;
      req.session.result = {
        uid:uid
              };
           res .redirect('/home');
           // res .redirect('/home')

    })
    .catch((error) => {
      res.redirect("/login");
    });
}
});

app.post("/sessionLogin", (req, res) => {
  res.clearCookie("session");
  const idToken = req.body.idToken.toString();

  const expiresIn = 60 * 60 * 24 * 3 * 1000;
  admin
    .auth()
    .createSessionCookie(idToken, { expiresIn })
    .then(
      (sessionCookie) => {
        const options = { maxAge: expiresIn, httpOnly: true };
        res.cookie("session", sessionCookie, options);
        res.end(JSON.stringify({ status: "success" }));
        console.log('got session cookie');
      },
      (error) => {
        console.log('e'+e);
        res.status(401).send("UNAUTHORIZED REQUEST!");
      }
    );

});

app.get("/sessionLogout", (req, res) => {
  res.clearCookie("session");
  res.redirect("/login");
});

//




function checkAuth(req, res, next) {
  if (!req.session.result) {
    res.redirect('/');
  } else {
    // var result = req.session.result;
    // var uid=result.uid;
    next();
  }
}

app.get('/home',checkAuth,(req,res,next)=>{
var result = req.session.result;
var uid=result.uid;
console.log(uid);
db.collection('admin/admins/users').doc(uid).get().then(function(doc){
  if(doc.exists){
    req.session.result = {
      uid:uid,
      role:doc.data()['role'],
      name:doc.data()['name'],
            };
    console.log('found as admin name is '+doc.data['name']);
    res.render('index',{data:doc.data()});
  }else{
    console.log('not added as admin ');
    res.redirect('/requestAsAdmin');
  }
})
.catch((e)=>{
  res.send('error happened check network connection');
  console.log(e);
})
});

function checkSupperAdmin(req, res, next) {
  if (!req.session.result) {
    res.redirect('/');
  } else {
    var role=req.session.result.role;
    console.log(role);
    if(role!='superAdmin'){
      res.send('You are not an Supper Admin');
    }else{
      next();

    }
  }
}

function checkAdmin(req, res, next) {
  if (!req.session.result) {
    res.redirect('/');
  } else {
    var role=req.session.result.role;
    console.log(role);
    if(role=='admin' || role=='superAdmin'){
      next();
    }else{
      res.send('You are not an Admin');
    }
  }
}


app.get('/requestAsAdmin',checkAuth,function(req,res){
res.render('requestAsAdmin/requestAsAdmin');
});
app.post('/requestAsAdmin',checkAuth,function(req,res){
  var result = req.session.result;
  var uid=result.uid;

    db.collection('admin/adminRequests/admins').doc(uid).set(
      {'name':req.body.name,'uid':uid,'mob':req.body.mob}
    ).then(function(doc){

    });
res.send('successfully requested');
});

// manage admin requests
app.get('/manageAdminRequest',checkSupperAdmin,function(req,res){
  var adminRequests=[];
  db.collection('admin/adminRequests/admins').get().then(function(querySnapshot){
    // if (doc.exists) {}
    querySnapshot.forEach(function(doc) {
      var toAdd={'name':doc.data()['name'],'mob':doc.data()['mob'],'id':doc.id};
      adminRequests.push(toAdd);
        });
res.render('manageAdminRequest/manageAdminRequest',{data:adminRequests});
});
});

app.post('/manageAdminRequest',checkSupperAdmin,(req,res)=>{

  console.log('managing admins');
  if(req.body.isSave==false){
    console.log('delete user');
     db.collection('admin/adminRequests/admins').doc(req.body.uid).delete().then(()=>{
       res.end(JSON.stringify({ status: "success" }));
    });
  }else{
    db.collection('admin/admins/users').doc(req.body.uid).set(
      {'name':req.body.name,'uid':req.body.uid,'mob':req.body.mob,'role':req.body.role}
    ).then(function(doc){
      db.collection('admin/adminRequests/admins').doc(req.body.uid).delete().then(()=>{
        res.end(JSON.stringify({ status: "success" }));
     });
    });
  }
});

// add questions

 app.get('/addQuestions',checkAdmin,function(req,res){
  //passed data from midddleware
  res.render('addQuestions/addQuestions')
});

app.get('/addQuestions/addExcel',checkAdmin,(req,res)=>{
  db.collection('openRoom').doc('home').get().then(function(doc){
    if (doc.exists) {
        res.render('addQuestions/byExcel/byExcel',{data:doc.data()})
    } else {
        // doc.data() will be undefined in this case
        res.send('error');
    }
  });

});

app.post('/addQuestions/addExcel',checkAdmin,async(req,res)=>{
  var batch = db.batch();
  const arrayUnion = admin.firestore.FieldValue.arrayUnion;
  var result = req.session.result;
  var uid=result.uid;
  var author=result.name;
  console.log(req.body);
  var category=req.body['category'];
  req.body['author']=result.name;
  var id=req.body['name']+category+uid;
  console.log(id);
// db.collection('admin/questionAddedDetails/admins').doc(uid).update(
//   {'questionDetails': arrayUnion({'category':'ias','id':id,'name':'athul 2 nd test'})
// })
var firstRef = db.collection("admin/questionAddedDetails/admins").doc(uid);
var secondRef = db.collection('openRoom/'+category.toLowerCase()+'/all').doc(id);
var document=await firstRef.get();
if(document.exists){
  var doc2=await secondRef.get();
  if(doc2.exists){
    res.status(401).send("already exists!");
console.log('allready exists');
}else{
  batch.update(firstRef,{'author':author,'questionDetails':arrayUnion(
    {'category':category.toLowerCase(),'id':id,'author':author,'name':req.body['name'],},)
  });

  batch.set(secondRef,{'allDetails':req.body,});

}

}else{
  batch.set(firstRef,{'author':author,'questionDetails':[
    {'category':category.toLowerCase(),'id':id,'author':author,'name':req.body['name'],}],
  });
  batch.set(secondRef,{'allDetails':req.body,});

}
try{
  await batch.commit();
}catch(e){
  res.status(500).send("network problem");
}
res.end(JSON.stringify({ status: "success" }));


});


//edit // QUESTION:
app.get('/editQuestions',checkAdmin,function(req,res){

  db.collection('openRoom').doc('home').get().then(function(doc){
    if (doc.exists) {
        res.render('editQuestions/categories',{data:doc.data()})
    } else {
        // doc.data() will be undefined in this case
        res.send('error');
    }

  })
 console.log('uid = '+req.session.result.uid);
 //passed data from midddleware
});


app.get('/editQuestions/:category',checkAdmin,async(req,res)=>{
  var uid =req.session.result.uid;
  var category=req.params.category;
  // remove data from list
  // const const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
  // const doc = firestore.doc('carts/abc');
  //
  // doc.update({
  //     items: arrayRemove('chex')
  // });

  db.collection('admin/questionAddedDetails/admins').doc(uid).get().then(function(doc){
    if (doc.exists) {
      var data=doc.data();
      data['categoySelected']=category.toLowerCase();
        console.log("Document data:", data);
        res.render('editQuestions/editIndex',{data:data});
    } else {
        res.send('no record found');
    }
});

});

app.get('/editQuestions/:category/:docId/byExcel/:index',checkAdmin,async(req,res)=>{
  var category=req.params.category;
  var docId=req.params.docId;
console.log(category+docId);
db.collection('openRoom').doc('home').get().then(function(doc){
    db.collection('openRoom/'+category+'/all').doc(docId).get().then(function(snapshot){
      if (snapshot.exists) {
        var data=snapshot.data();
        data['availableCatgeories']=doc.data()['openRoom']['categories'];
        console.log(data);
        res.render('editQuestions/byExcel/byExcel',{data:data})

}else{
  res.send('error,  data not available in database');
}
}).catch(e=>{
  res.send('inner error'+e);
})
}).catch(e=>{
  res.send('categery error');
});
});

app.post('/editQuestions/:category/:docId/byExcel/:index',checkAdmin,async(req,res)=>{
  var c=req.params.category;
  var category=req.body['category'];
  var docId=req.params.docId;
  var result = req.session.result;
  var uid=result.uid;
  var author=result.name;
  var i=parseInt(req.params.index);
  console.log(c+'/'+docId+'/'+i);
  req.body['author']=result.name;
  var batch = db.batch();
  // const arrayUnion = admin.firestore.FieldValue.arrayUnion;
  var firstRef = db.collection("admin/questionAddedDetails/admins").doc(uid);
  var secondRef = db.collection('openRoom/'+category.toLowerCase()+'/all').doc(docId);
  var document=await firstRef.get();
  var listData=document.data()['questionDetails'];
  console.log(listData);
  if(document.exists){
    var changedData={'category':category.toLowerCase(),
                    'id':docId,'author':author,
                    'name':req.body['name'],}
    listData[i]=changedData;
    batch.set(firstRef,{'author':author,'questionDetails':listData,});
    batch.set(secondRef,{'allDetails':req.body,});

    try{
      await batch.commit();
    }catch(e){
      res.status(500).send("network problem");

    }
}


res.end(JSON.stringify({ status: "success" }));

});

app.get('/addNotes',checkAdmin,function(req,res){
  res.render('addData/addNotes')
});

app.listen(PORT, () => {
  console.log(`Listening on http://localhost:${PORT}`);
});
