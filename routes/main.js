module.exports = function(app, shopData) {
    

    // Handle our routes
    app.get('/',function(req,res){
        res.render('index.ejs', shopData)
    });
    app.get('/about',function(req,res){
        res.render('about.ejs', shopData);
    });
    app.get('/search',function(req,res){
        res.render("search.ejs", shopData);
    });
    app.get('/search-result', function (req, res) {
        //searching in the database
        //res.send("You searched for: " + req.query.keyword);

        let sqlquery = "SELECT * FROM books WHERE name LIKE '%" + req.query.keyword + "%'"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });        
    });
    app.get('/register', function (req,res) {
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        const plainPassword = req.body.password;
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPassword) {
            // saving data in database
           let sqlquery = "INSERT INTO users (username, firstname, lastname, email, hashedpassword) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' This user is added to database, username: '+ req.body.username + ' firstname '+ req.body.firstname + ' lastname '+ req.body.lastname
            + ' email '+ req.body.email+ ' hashed password '+ req.body.hashedPassword);
             });
          })
        
        res.render('register.ejs', shopData);                                                                     
    });                                                                                                 
    app.post('/registered', function (req,res) {
        // saving data in database
        result = 'Hello '+ req.body.first + ' '+ req.body.last +' you are now registered!  We will send an email to you at ' + req.body.email;
        result += 'Your password is: '+ req.body.password +' and your hashed password is: '+ hashedPassword;
        res.send(result);
                                                                           
    }); 
    app.get('/list', redirectLogin, function (req, res) {
        let sqlquery = "SELECT * FROM books"; // query database to get all the books
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableBooks:result});
            console.log(newData)
            res.render("list.ejs", newData)
         });
    });

    app.get('/listusers', function(req, res) {
        
        let sqlquery = "SELECT * FROM users"; // query database to get all the users
        // execute sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./'); 
            }
            let newData = Object.assign({}, shopData, {availableusers:result});
            console.log(newData)
            res.render("listusers.ejs", newData)
         });
    });

    app.get('/addbook', function (req, res) {
        res.render('addbook.ejs', shopData);
     });
 
     app.post('/bookadded', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO books (name, price) VALUES (?,?)";
           // execute sql query
           let newrecord = [req.body.name, req.body.price];
           db.query(sqlquery, newrecord, (err, result) => {
             if (err) {
               return console.error(err.message);
             }
             else
             res.send(' This book is added to database, name: '+ req.body.name + ' price '+ req.body.price);
             });
       });    

       app.get('/login', function (req, res) {
        res.render('login.ejs', shopData);
     });
 
     app.post('/loggedin', function (req,res) {
           // saving data in database
           let sqlquery = "INSERT INTO users (username, password) VALUES (?,?)";
           // execute sql query
            // Compare the password supplied with the password in the database
            bcrypt.compare(req.body.password, hashedPassword, function(err, result) {
                if (err) {
                    res.send(' WRONG! check your login details')
                }
                else if (result == true) {
                    res.send(' your now logged in as ' + req.body.username)
                    // Save user session here, when login is successful
                    req.session.userId = req.body.username;

                }
                else {
                    res.send(' WRONG! check your login details')
                }
            });

       });  

    app.get('/weather', function(req,res){
        const request = require('request');
          
        let apiKey = '602fbb6c1ae37236f438c23b15c2bc33';
        let city = 'london';
        let url = `http://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`
                     
        request(url, function (err, response, body) {
          if(err){
            console.log('error:', error);
          } else {
            //res.send(body);
            var weather = JSON.parse(body)
            var wmsg = 'It is '+ weather.main.temp + 
            ' degrees in '+ weather.name +
            '! <br> The humidity now is: ' + 
            weather.main.humidity;
            res.send (wmsg);

          } 
        });

    } )

    app.get('/logout', redirectLogin, (req,res) => {
        req.session.destroy(err => {
        if (err) {
          return res.redirect('./')
        }
        res.send('you are now logged out. <a href='+'./'+'>Home</a>');
        })
    })


       app.get('/bargainbooks', function(req, res) {
        let sqlquery = "SELECT * FROM books WHERE price < 20";
        db.query(sqlquery, (err, result) => {
          if (err) {
             res.redirect('./');
          }
          let newData = Object.assign({}, shopData, {availableBooks:result});
          console.log(newData)
          res.render("bargains.ejs", newData)
        });
    });       

    const redirectLogin = (req, res, next) => {
        if (!req.session.userId ) {
          res.redirect('./login')
        } else { next (); }
    }

    app.get('/api', function (req,res) {

        // Query database to get all the books
        let sqlquery = "SELECT * FROM books"; 

        // Execute the sql query
        db.query(sqlquery, (err, result) => {
            if (err) {
                res.redirect('./');
            }
            // Return results as a JSON object
            res.json(result); 
        });
    });

    

}
