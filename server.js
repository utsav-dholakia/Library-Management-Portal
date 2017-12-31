 // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var mysql = require("mysql");                      //using Mysql database
    var url = require("url");
    var queryString = require("queryString"); 
    // configuration =================

  //  mongoose.connect('mongodb://node:nodeuser@mongo.onmodulus.net:27017/uwO3mypu');     // connect to mongoDB database on modulus.io

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());


    // define model =================
    var con = mysql.createConnection({
    host: "localhost",
    user: "utsav",
    password: "55uvd1992",
    database: "Library"
    });

con.connect(function(err){
  if(err){
    console.log('Error connecting to Db');
    console.log(err);
    return;
  }
  console.log('Connection established');
});



//--------------------------------------------------------
   
    // api ---------------------------------------------------------------------
   
    app.post('/lib/search/', function(req, res) {

          console.log("req.url : "+ req.url);
                   
            var searchParam =  req.body;
            console.log("req.body:" +req.body);
            console.log("req.body contents:" + searchParam.Title + " "+searchParam.Author + " "+searchParam.ISBN+" " + searchParam.condition );
            var book="";
            var author="";
            var isbn="";
            if(searchParam.condition==="contains"){
                console.log("searchParam.condition : contains");
                if(searchParam.Title!==undefined ){
                  if(searchParam.Title.trim() != ""){
                      book="%"+searchParam.Title+"%";        
                  }
                }
                if(searchParam.author!==undefined){
                  if(searchParam.Author.trim()!=""){
                      author="%"+searchParam.Author+"%";
                  }
                }
                if(searchParam.ISBN!==undefined){
                  if(searchParam.ISBN.trim()!=""){
                      isbn="%"+searchParam.ISBN+"%"; 
                  }   
                }
            }
            else if(searchParam.condition==="start"){
              console.log("searchParam.condition : start");
                if(searchParam.Title!==undefined){
                  if(searchParam.Title.trim() != ""){
                      book=searchParam.Title+"%";        
                  }
                }
                if(searchParam.Author!==undefined){
                  if(searchParam.Author.trim()!=""){
                      author=searchParam.Author+"%";    
                  }
                }
                if(searchParam.ISBN!==undefined){
                  if(searchParam.ISBN.trim()!=""){
                      isbn=searchParam.ISBN+"%";    
                  }
                }
            
             }else if(searchParam.condition==="exact"){
                console.log("searchParam.condition : exact");
                if(searchParam.Title!==undefined){
                  if(searchParam.Title.trim() != ""){
                      book=searchParam.Title;    
                  } 
                }
                if(searchParam.Author!==undefined){
                  if(searchParam.Author.trim()!=""){
                      author=searchParam.Author;    
                  }
                }
                if(searchParam.ISBN!==undefined){
                  if(searchParam.ISBN.trim()!=""){
                      isbn=searchParam.ISBN;    
                  }
                }
            }

            console.log("searchParam.Title: " + book + " searchParam.Author: "+author + " searchParam.ISBN: "+
              isbn+" searchParam.condition: " + searchParam.condition );
           
           /*var qry="SELECT b.isbn, b.title, b.publisher,b.cover,b.pages,a.full_name, br.branch_id,l.branch_name, "+ 
"br.no_of_copy, br.remaining_copy FROM book b join book_author ba join author a join branch_copy br join library_branch l "+
"on b.isbn=ba.isbn and ba.author_id=a.author_id and b.isbn=br.book_id and br.branch_id=l.branch_id "+
"and (b.isbn like  ? or b.title like  ? or  a.full_name like ?)";*/
            var qry = "SELECT B.ISBN10,B.Title,A.Author_name,LB.Branch_id,LB.Branch_name,BC.no_of_copies,BC.remaining_copy\
                        FROM BOOKS AS B JOIN BOOK_AUTHORS AS BA ON B.ISBN10=BA.ISBN\
                        JOIN AUTHORS AS A ON BA.Author_id=A.Author_id\
                        JOIN BOOK_COPIES AS BC ON BC.Book_id=B.ISBN10\
                        JOIN LIBRARY_BRANCH AS LB ON LB.Branch_id=BC.Branch_id\
                        WHERE B.ISBN10 LIKE ? OR B.Title LIKE ? OR A.Author_name LIKE ?";

            if(searchParam.condition!==undefined){
              //if(err) throw err;
              console.log("inside query thrower after throw err");
                var query = con.query(qry,[isbn,book,author],function(err,rows){
                if(err) throw err;

                console.log('Data received from Db:post:\n');
                console.log("query : " + query.sql);
                console.log(rows.length);
                //console.log(rows);
                res.send(rows); 
               // res.json(rows); // return all todos in JSON format
            });
            }
            else
            {
              console.log("other than query fire block");
            }
    });


  app.post('/lib/register', function(req, res) {
    
    var index;

    fetchIndexNumber(indexFetched);
    
    function fetchIndexNumber(callback)
    {
      var fetchCardNoQuery = con.query("select max(card_no) as max from borrowers",function(err,resp){
      console.log("fetchCardNoQuery : " + fetchCardNoQuery.sql);
      console.log("resp : " + resp[0].max);
      index = resp[0].max.substring(4);
      index = parseInt(index)+1;
      console.log("index : " + index);
      indexFetched(index);
    });  
    }
    
    function indexFetched(index)
    {
    console.log("SSN in request : " + req.body.ssn);
    var response={};
    var card_no="ID00"+index;
    req.body.card_no=card_no;
    console.log("req.body.card_no : " + req.body.card_no);
    console.log("req.body contents : " + req.body);
    var checkQuery = con.query('SELECT SSN FROM borrowers where ssn=?',req.body.ssn,function(err,rows){
      if(err) throw err;
      console.log("checkQuery : " + checkQuery.sql);
      console.log('Data received from Db:post:\n');
      if(rows.length===1){
          response.exists=1;   
          console.log("response : " + response);
          res.send(response);   
      }
      else if(rows.length<1){
          response.exists=0;
          var addQuery = con.query('INSERT INTO borrowers SET ?', req.body, function(err,resp){
          if(err) throw err;
          console.log("addQuery : " + addQuery.sql);
          response.card_no = req.body.card_no;
          console.log("index : " + index);
          console.log("response.card_no : " + response.card_no);
          res.send(response);  
          });
      }
    });
    }
    
  });

  app.post('/lib/checkOut', function(req, res) {

    var response={};
    var query_answer={};

    //Find out if given card_no exists or not in customer list
    console.log(req.body.card_no.trim());
    var q=con.query('SELECT COUNT(*) AS COUNT FROM BOOK_LOANS WHERE Card_no LIKE ?',req.body.card_no.trim(),function(err,rows){
      console.log("card_no check query :" + q.sql);
      if(err) throw err;
      console.log('Data received from Db:post:\n');
      query_answer=rows;
      console.log(query_answer[0].COUNT);
      if(query_answer[0].COUNT>=3){
      //query_answer[0].limit_reached=1;
      //query_answer[0].message="Borrower Cannot Check Out More than 3 Books";
      response.limit_reached = 1;
      response.card_no = req.body.card_no.trim();
      response.message="Borrower Cannot Check Out More than 3 Books";
      console.log(response);
      res.send(response); 
      }
      
      //Only if borrower doesn't have more than 2 books on his name 
      else{
      //Find out remaining copies of the book at selected branch
      var q1=con.query('SELECT remaining_copy FROM BOOK_COPIES WHERE Book_id LIKE ? AND Branch_id=?',
      [req.body.isbn.trim(),req.body.branch_id.trim()],function(err,rows){
      console.log("Check book availablility query : " + q1.sql);
      if(err) throw err;
      console.log('Data received from Db:post:\n');
      query_answer=rows;
      console.log(query_answer[0].remaining_copy);
      if(query_answer[0].remaining_copy<1){
      //query_answer[0].book_not_available=0;
      //query_answer[0].message="Book not available at given Branch";
      response.book_not_available=1;
      response.message="Book not available at given Branch";
      console.log(response);
      res.send(response); 
      } 
      
      //Only if there are book copies available in the branch
      else{ 
      //Insert new book_loan entry for check out 
      var q2=con.query('INSERT INTO BOOK_LOANS(ISBN,Branch_id,Card_no,Date_out,Due_date) VALUES ( ?,?,?,CURDATE(),DATE_ADD(CURDATE(),INTERVAL 14 DAY))',
      [req.body.isbn.trim(),req.body.branch_id.trim(),req.body.card_no.trim()],function(err,rows){
      console.log("Insert BOOK_LOAN entry query :" + q2.sql); 
      if(err) throw err;
      console.log('Data received from Db:post:\n');
      console.log('Last insert ID:', rows.insertId);
      var q3=con.query('UPDATE BOOK_COPIES SET remaining_copy = ?-1 WHERE Book_id LIKE ? AND Branch_id LIKE ?;',
        [query_answer[0].remaining_copy,req.body.isbn.trim(),req.body.branch_id.trim()],function(err,rows1){
      console.log("Update BOOK_LOAN entry query :" + q3.sql);
      if(err) throw err;
      console.log('Data received from Db:post:\n');
      console.log('Changed ' + rows1.changedRows + ' rows');
      //console.log(response.remaining_copy);
      response.success=1;
      response.message="Book Check-out Successful.";
      console.log(response);
      res.send(response); 
      }); 
      });
      } 
      });
      }
    });
      console.log("response : " + response); 
  });

  app.post('/lib/checkIn/search', function(req, res) {
      console.log("req.url : "+ req.url);
                   
            var searchParam =  req.body;
            console.log("req.body:" +req.body);
            console.log("req.body contents:" + searchParam.Borrower + " "+searchParam.CardNo + " "+searchParam.ISBN+" " + searchParam.condition );
            var borrower="";
            var cardno="";
            var isbn="";
            if(searchParam.condition==="contains"){
                console.log("searchParam.condition : contains");
                if(searchParam.Borrower!==undefined ){
                  if(searchParam.Borrower.trim() != ""){
                      borrower="%"+searchParam.Borrower+"%";        
                  }
                }
                if(searchParam.CardNo!==undefined){
                  if(searchParam.CardNo.trim()!=""){
                      cardno="%"+searchParam.CardNo+"%";
                  }
                }
                if(searchParam.ISBN!==undefined){
                  if(searchParam.ISBN.trim()!=""){
                      isbn="%"+searchParam.ISBN+"%"; 
                  }   
                }
            }
            else if(searchParam.condition==="start"){
              console.log("searchParam.condition : start");
                if(searchParam.Borrower!==undefined){
                  if(searchParam.Borrower.trim() != ""){
                      borrower=searchParam.Borrower+"%";        
                  }
                }
                if(searchParam.CardNo!==undefined){
                  if(searchParam.CardNo.trim()!=""){
                      cardno=searchParam.CardNo+"%";    
                  }
                }
                if(searchParam.ISBN!==undefined){
                  if(searchParam.ISBN.trim()!=""){
                      isbn=searchParam.ISBN+"%";    
                  }
                }
            
             }else if(searchParam.condition==="exact"){
                console.log("searchParam.condition : exact");
                if(searchParam.Borrower!==undefined){
                  if(searchParam.Borrower.trim() != ""){
                      borrower=searchParam.Borrower;    
                  } 
                }
                if(searchParam.CardNo!==undefined){
                  if(searchParam.CardNo.trim()!=""){
                      cardno=searchParam.CardNo;    
                  }
                }
                if(searchParam.ISBN!==undefined){
                  if(searchParam.ISBN.trim()!=""){
                      isbn=searchParam.ISBN;    
                  }
                }
            }

            console.log("searchParam.Borrower: " + borrower + " searchParam.CardNo: "+cardno + " searchParam.ISBN: "+
              isbn+" searchParam.condition: " + searchParam.condition );
           
           
            var qry = "SELECT BL.Loan_id,BL.Isbn,BL.Branch_id,BL.Card_no,BL.Due_date,B.first_name,B.last_name\
                        FROM BOOK_LOANS AS BL NATURAL JOIN BORROWERS AS B\
                        WHERE (BL.Isbn LIKE ? OR BL.Card_no LIKE ? OR B.first_name LIKE ? OR B.last_name LIKE ?) AND\
                        (DATEDIFF(CURDATE(),Date_in)<0 OR Date_in IS NULL)";

            if(searchParam.condition!==undefined){
              //if(err) throw err;
              console.log("inside query thrower after throw err");
                var query = con.query(qry,[isbn,cardno,borrower,borrower],function(err,rows){
                if(err) throw err;

                console.log('Data received from Db:post:\n');
                console.log("query : " + query.sql);
                console.log(rows.length);
                //console.log(rows);
                res.send(rows); 
               // res.json(rows); // return all todos in JSON format
            });
            }
            else
            {
              console.log("other than query fire block");
            }
  });

  app.post('/lib/checkIn/checkIn', function(req, res) {
      console.log("req.url : "+ req.url);
      console.log("req.body :" + req.body);
      var response = {};
      
      for (var key in req.body) 
      {
        if (req.body.hasOwnProperty(key)) {
            item = req.body[key];
            console.log(item);
            var q=con.query('UPDATE BOOK_LOANS SET Date_in = CURDATE() WHERE Loan_id = ?',[item],function(err,rows){
            console.log("Update BOOK_LOANs entry query :" + q.sql);
            if(err) throw err;
            console.log('Data received from Db:post:\n');
            console.log('Changed ' + rows.changedRows + ' rows');
            //console.log(response.remaining_copy);
            response.success=1;
            response.message="Book Check-in Successful.";
            console.log(response);
            res.send(response);   
            });
            var q1=con.query('UPDATE BOOK_COPIES AS BC JOIN BOOK_LOANS AS BL ON BC.Book_id = BL.Isbn AND BC.Branch_id = BL.Branch_id\
                              SET BC.remaining_copy = BC.remaining_copy + 1\
                              WHERE Loan_id = ?',[item],function(err,rows){
              console.log("Update BOOK_COPIES query :" + q1.sql);
              if(err) throw err;
              console.log('Data received from Db:post:\n');
              console.log('Changed ' + rows.changedRows + ' rows');
              //console.log(response.remaining_copy);
              //response.success=1;
              //response.message="Book Check-in Successful.";
              console.log("Book copies updated");
              //res.send(response);   
            });
        }
      }
      
  });

  app.get('/lib/fines/refresh', function(req, res) {
     
   var qInsert="INSERT INTO FINES (SELECT b.Loan_id,\
                IF(Date_in IS NULL, DATEDIFF(CURDATE(),Due_date)*0.25,DATEDIFF(Date_in,Due_date)*0.25),0\
                FROM BOOK_LOANS b WHERE( DATEDIFF(Date_in,Due_date)>0 || (DATEDIFF(CURDATE(),Due_date)>0 && Date_in IS NULL)))\
                ON DUPLICATE KEY UPDATE Fine_amt = IF(Paid = 0,\
                IF(Date_in IS NULL, DATEDIFF(CURDATE(),Due_date)*0.25,DATEDIFF(Date_in,Due_date)*0.25),Fine_amt)";
 
   var qSelect='SELECT l.Card_no,b.first_name , b.last_name,f.Paid, SUM(f.Fine_amt) AS Amount '+
            'FROM BOOK_LOANS l JOIN FINES f JOIN BORROWERS b ON l.Loan_id=f.Loan_id and b.Card_no=l.Card_no '+
            'GROUP BY l.Card_no,b.first_name , b.last_name, f.Paid '+
            'HAVING (((SUM(f.Fine_amt))>0) OR f.Paid=0) ORDER BY f.Paid';
    var q1=  con.query(qInsert, function(err,resp){
      if(err) throw err;
            var q2=  con.query(qSelect, function(err,resp){
             if(err) throw err;
            res.send(resp); 
     });
        console.log(q2.sql); 
    });
        console.log(q1.sql); 
     
  });

  app.get('/lib/fines/displayList', function(req, res) {
    console.log(req.url);

    var q='SELECT l.Card_no,b.first_name , b.last_name,f.Paid, sum(f.Fine_amt) AS Amount\
            FROM BOOK_LOANS l JOIN FINES f JOIN BORROWERS b ON l.Loan_id=f.Loan_id AND b.Card_no=l.Card_no\
            GROUP BY l.Card_no,b.first_name , b.last_name, f.Paid\
            HAVING (((SUM(f.Fine_amt))>0) OR f.Paid=0)  ORDER BY f.Paid';
    var q1=  con.query(q, function(err,resp){
      console.log("Fine display query : " + q1.sql); 
      if(err) throw err;
      res.send(resp); 
      });
  });

  app.post('/lib/fines/pay', function(req,res) {

        var response={};
        console.log(req.body.Card_no);
        var q='SELECT * FROM BOOK_LOANS WHERE Card_no=? AND Date_in IS NOT NULL';
        var q1=  con.query(q,req.body.Card_no, function(err,resp){
          if(err) throw err;
          if(resp.length<1){
            response.message="All books are not returned!!";
            response.book_returned="0";
            console.log(response);
            res.send(response);  
          }
          else{
            var q2= 'UPDATE FINES as f\
                    SET f.PAID = 1 WHERE f.Loan_id IN\
                    ( SELECT bl.Loan_id FROM BOOK_LOANS AS bl\
                      WHERE Card_no = ?\
                    )';
            var q3=  con.query(q2,req.body.Card_no, function(err,resp){
            if(err) throw err;
            console.log("Update succesful");
            response.message="Fine Paid Successfully!!!";
            response.fine_paid="1";
            console.log(response);
            res.send(response); 
          });
          console.log(q3.sql);
          }
        });
        console.log(q1.sql); 
  });

  app.get('*', function(req, res) {
    console.log(req.url);
    res.sendfile('./public/index.html'); 
  });
  app.post('*',function(req,res){
    console.log(req.url);
    res.sendfile('./public/index.html'); 
  });
    // listen (start app with node server.js) ======================================
    app.listen(5678);
    console.log("App listening on port 5678");
