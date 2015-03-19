var connection;
var tasks = [];
var taskNr = 0;
var dots = 0;
var LineByLineReader = require('line-by-line');
var rd;

var events = require('events');
var event = new events.EventEmitter();

event.on('taskComplete', function () { taskQueue(); });

/*
*Reads the data from the FPLAN file and writes the data used in the database.
*/
var processDepartures = function () {
    console.log('Processing departures...\n');
    rd = new LineByLineReader('./data/FPLAN');    
    
    //This regexp matches the lines used
    var patt = /^(\d{7}\s.{29}\d{5})/;
    
    //Cleanup table
    runQuery('DELETE FROM departures;');
    
    var trainstation, time;
    rd.on('line', function(line) {
        if (patt.test(line)) {
            loadingDots();
            trainstation = line.substring(0,7);
            time = line.substring(37,43); 
            runQuery('INSERT INTO departures (trainstation, departure) VALUES (' + trainstation + ',' + time + ');');
            setTimeout(function(){ }, 1);
            rd.pause();
        }	
    });

    rd.on('error', function(err) {
        res.end(err);
    });    
    
    rd.on('end', function () {        
        console.log('Finished proccessing departures!');
        event.emit('taskComplete');
    });
};

/*
*Reads the data from the BFKOORD file and writes the data used in the database.
*/
var processTrainstations = function () {
    console.log('Proccessing Trainstations...\n');
    rd = new LineByLineReader('./data/BFKOORD');    
    
    //Cleanup table
    runQuery('DELETE FROM trainstations;');
    
    var id, xKoord, yKoord;
    var i = 0;
    
    rd.on('line', function(line) {
        loadingDots();
        id = line.substring(0,7);
        xKoord = line.substring(9,19);
        yKoord = line.substring(20,30);
        runQuery('INSERT INTO trainstations (trainstations_ID, x_koordinate, y_koordinate) VALUES (' + id + ',' + xKoord + ','+ yKoord + ');');
        rd.pause();
    });

    rd.on('error', function(err) {
        res.end(err);
    }); 
    
    rd.on('end', function() {        
        console.log('Finished proccessing Trainstations!');
        event.emit('taskComplete');
    });
};

/*
*Setup the database schema
*/
var setupDB = function() {
    console.log('Setting up database...\n');
    rd = new LineByLineReader('schema.sql'); 
    
    rd.on('line', function(line) {
        loadingDots();
        runQuery(line);
        rd.pause();
    });

    rd.on('error', function(err) {
        res.end(err);
    }); 
    
    rd.on('end', function(){        
        console.log('Finished setting up database!');
        event.emit('taskComplete');
    });
};

/*
* Opens a pool of connections
*/
var openConnection = function() {
    var mysql      = require('mysql');
    connection = mysql.createConnection({
          host     : 'localhost',
          user     : 'root',
          password : ''
    });

    connection.connect(function(err) {
          if (err) {
            console.error('error connecting: ' + err.stack);
            return;
          }

          console.log('connected as id ' + connection.threadId);
    });
    event.emit('taskComplete');
};

var closeConnection = function() {
    connection.end();   
};

/*
*Runs a query on the database
*/
function runQuery(query){     
    connection.query('USE openDataProject;', function(err, rows, fields) {
        if (err){
            console.log(query);
            throw err; 
        }
    });
    connection.query(query, function(err, rows, fields) {
        if (err){
            console.log(query);
            throw err; 
        }
        if(rd){
            rd.resume();   
        }
    });
}

function loadingDots(){
      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);  // move cursor to beginning of line
      dots = (dots + 1) % 15;
      var i = new Array(dots + 1).join(".");
      process.stdout.write("Processing" + i);  // write text
}

/*
*Gets a file
*@return - returns the readline of the file
*/
function getFile(path){
  var fs = require('fs'),
    readline = require('readline');

    return readline.createInterface({
        input: fs.createReadStream(path),
        output: process.stdout,
        terminal: false
    });    
}

if(process.argv[2]=='setup'){
    tasks.push(setupDB);
    tasks.push(processTrainstations);
    tasks.push(processDepartures); 
}

if(process.argv[2]=='update'){
    tasks.push(processTrainstations);
    tasks.push(processDepartures);
}

if(process.argv[2]=='departures'){
    tasks.push(processDepartures);
}

tasks.push(closeConnection);


openConnection.call();
function taskQueue(){ 
    console.log('Starting task ' + taskNr);
    tasks[taskNr].call();
    taskNr++;
}
    