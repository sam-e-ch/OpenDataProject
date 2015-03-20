var connection;
var tasks = [];
var taskNr = 0;
var dots = 0;
var LineByLineReader = require('line-by-line');
var rd;

/*
* Setting up the events for the task queue
*/
var events = require('events');
var event = new events.EventEmitter();

event.on('taskComplete', function () { taskQueue(); });

/*
*Reads the data from the FPLAN file and writes the data used in the database.
*/
var processDepartures = function () {
    console.log('Processing departures... (This may take several hours!)\n');
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
*Reads the data from the g1g14.csv file and writes the data used in the database.
*/
var processMunicipalities = function () {
    console.log('Proccessing Municipalities...\n');
    rd = new LineByLineReader('./data/g1g14.csv');    
    
    //Cleanup table
    runQuery('DELETE FROM municipalities;');  
    var temp;
    
    rd.on('line', function(line) {
        loadingDots();
        temp = line.split(',');
        if(!isNaN(temp[0])){
            runQuery('INSERT INTO municipalities (municipalities_ID, name, canton, min_x, max_x, min_y, max_y) VALUES ('
                     + temp[0] +',' + connection.escape(temp[1]) +','+ temp[3] +','+ temp[6]/1000 +','+ temp[7]/1000 +','+ temp[8]/1000 +','+ temp[9]/1000 + ');');
            rd.pause();
        }
    });

    rd.on('error', function(err) {
        res.end(err);
    }); 
    
    rd.on('end', function() {        
        console.log('Finished proccessing Municipalities!');
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
          password : '', 
          database : 'openDataProject'
    });

    connection.connect(function(err) {
          if (err) {
            console.error('error connecting: ' + err.stack);
            return;
          }
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

/*
*Shows the loading 'animation'
*/
function loadingDots(){
      process.stdout.clearLine();  // clear current text
      process.stdout.cursorTo(0);  // move cursor to beginning of line
      dots = (dots + 1) % 15;
      var i = new Array(dots + 1).join(".");
      process.stdout.write("Processing" + i);  // write text
}

/*
*Build the task queue (with different modes)
*/

if(process.argv[2]=='setup'){
    tasks.push(setupDB);    
    tasks.push(processMunicipalities);
    tasks.push(processTrainstations);
    tasks.push(processDepartures); 
}

if(process.argv[2]=='schema'){
    tasks.push(setupDB); 
}

if(process.argv[2]=='update'){
    tasks.push(processTrainstations);
    tasks.push(processDepartures);
}

if(process.argv[2]=='departures'){
    tasks.push(processDepartures);
}

if(process.argv[2]=='trainstations'){
    tasks.push(processTrainstations);
}

if(process.argv[2]=='municipalities'){
    tasks.push(processMunicipalities);
}

tasks.push(closeConnection);

/*
*Start the program by openig the connection. The taskQueue is processed afterwards.
*/
openConnection.call();
function taskQueue(){ 
    tasks[taskNr].call();
    taskNr++;
}
    