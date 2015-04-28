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
    rd = new LineByLineReader('data/FPLAN');    
    
    //This regexp matches the lines used
    var patt = /^(\d{7}\s.{29}\d{5})/;
    var patt2 = /^(\*A VE)/;
    
    //Cleanup table
    //runQuery('DELETE FROM departures;');
    
    var trainstation, time, bitfield = 0;
    rd.on('line', function(line) {
        if (patt2.test(line)){
            bitfield = line.substring(22,28); 
            if(bitfield == '      '){
                bitfield = 0;   
            }
        }
        
        if (patt.test(line)) {
            loadingDots();
            trainstation = line.substring(0,7);
            time = line.substring(37,43); 
            runQuery('INSERT INTO departures (trainstation, departure, bitfield) VALUES (' + trainstation + ',' + time + ',' + bitfield +');');
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
    rd = new LineByLineReader('data/BFKOORD');    
    
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
    rd = new LineByLineReader('data/g1g14.csv');    
    
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

var processBitfield = function() {
    console.log('Reading bitfields...\n');
    rd = new LineByLineReader('data/BITFELD'); 
    var day;
    
    //Cleanup table
    runQuery('DELETE FROM bitfield;');
    
    rd.on('line', function(line) {
        loadingDots();
		var id, hex, bin;
        id = line.split(' ')[0];
        hex = line.split(' ')[1];
        bin = hex2Bin(hex);
        day = getWeekdays(id, bin);
        
        runQuery('INSERT INTO bitfield VALUES('+ id +','+ day[0] +',' + day[1] +','+ day[2] +','+ day[3] +','+ day[4] +','+ day[5] +','+ day[6]+')');
        rd.pause();
    });

    rd.on('error', function(err) {
        console.log(err);
    }); 
    
    rd.on('end', function(){        
        console.log('Finished!'); 
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

function generateMunicipalitiesAllFile(){
    console.log('Generating municipalities.json. This may take a while!');
     connection.query("SELECT municipalities_ID as 'id', name, area, population, avg_all, max_all, count_departures_all, avg_week, max_week, count_departures_week, avg_weekend, max_weekend, count_departures_weekend, avg_sun, max_sun, count_departures_sun FROM municipalities LEFT JOIN (SELECT temp.municipality AS id, AVG(temp.max_departure) AS 'avg_week', MAX(temp.max_departure) AS 'max_week', SUM(temp.count) AS 'count_departures_week' FROM (SELECT departures.trainstation, MAX(CASE WHEN departures.departure < 400 THEN departures.departure + 2400 WHEN departures.departure > 2800 THEN departures.departure - 2400 ELSE departures.departure END) AS max_departure, trainstations.municipality, COUNT(departures.departures_ID) AS count FROM departures INNER JOIN trainstations ON departures.trainstation = trainstations.trainstations_ID INNER JOIN bitfield ON departures.bitfield = bitfield.id WHERE sun OR mon OR tue OR wed OR thur GROUP BY departures.trainstation) temp GROUP BY temp.municipality) week ON week.id = municipalities.municipalities_ID LEFT JOIN (SELECT temp.municipality AS id, AVG(temp.max_departure) AS 'avg_weekend', MAX(temp.max_departure) AS 'max_weekend', SUM(temp.count) AS 'count_departures_weekend' FROM (SELECT departures.trainstation, MAX(CASE WHEN departures.departure < 400 THEN departures.departure + 2400 WHEN departures.departure > 2800 THEN departures.departure - 2400 ELSE departures.departure END) AS max_departure, trainstations.municipality, COUNT(departures.departures_ID) AS count FROM departures INNER JOIN trainstations ON departures.trainstation = trainstations.trainstations_ID INNER JOIN bitfield ON departures.bitfield = bitfield.id WHERE fri OR sat GROUP BY departures.trainstation) temp GROUP BY temp.municipality) weekend ON weekend.id = municipalities.municipalities_ID LEFT JOIN (SELECT temp.municipality AS id, AVG(temp.max_departure) AS 'avg_sun', MAX(temp.max_departure) AS 'max_sun', SUM(temp.count) AS 'count_departures_sun' FROM (SELECT departures.trainstation, MAX(CASE WHEN departures.departure < 400 THEN departures.departure + 2400 WHEN departures.departure > 2800 THEN departures.departure - 2400 ELSE departures.departure END) AS max_departure, trainstations.municipality, COUNT(departures.departures_ID) AS count FROM departures INNER JOIN trainstations ON departures.trainstation = trainstations.trainstations_ID INNER JOIN bitfield ON departures.bitfield = bitfield.id WHERE sun GROUP BY departures.trainstation) temp GROUP BY temp.municipality) sun ON sun.id = municipalities.municipalities_ID LEFT JOIN (SELECT temp.municipality AS id, AVG(temp.max_departure) AS 'avg_all', MAX(temp.max_departure) AS 'max_all', SUM(temp.count) AS 'count_departures_all' FROM (SELECT departures.trainstation, MAX(CASE WHEN departures.departure < 400 THEN departures.departure + 2400 WHEN departures.departure > 2800 THEN departures.departure - 2400 ELSE departures.departure END) AS max_departure, trainstations.municipality, COUNT(departures.departures_ID) AS count FROM departures INNER JOIN trainstations ON departures.trainstation = trainstations.trainstations_ID INNER JOIN bitfield ON departures.bitfield = bitfield.id WHERE sun OR mon OR tue OR wed OR thur OR fri OR sat GROUP BY departures.trainstation) temp GROUP BY temp.municipality) all_days ON all_days.id = municipalities.municipalities_ID;",function(err,rows){
            if(!err) {
                var fs = require('fs');
                fs.writeFile("data/municipalities.json", JSON.stringify(rows), function(err) {
                    if(err) {
                        return console.log(err);
                    }
                    console.log("The file was saved!");
                }); 
            }          
            event.emit('taskComplete');
        });
}

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

function getWeekdays(id, str){
    var threshold = 8; //Number of Weeks per Year needed to count
    var countDay=[0,0,0,0,0,0,0];
    var day = [0,0,0,0,0,0,0];
    var temp;
    for(var i=0, l=str.length; i<l; i++){
        temp = str.substr(i,1);		
        if (temp == '1'){
            countDay[i%7]++;
        }
    }
    
    for(var i = 0; i < 7; i++){
        if(countDay[i]>threshold){
            day[i] = 1;   
        }
    }
    
    return day;
} 

function hex2Bin(hex){
    var bin = '';
    for(var i=0; i< hex.length-5; i++){
        bin += h2b(hex.substr(i,1));
    }
    return bin;
}

function h2b(c){
    switch(c){
        case '0': return '0000'; break;
        case '1': return '0001'; break;
        case '2': return '0010'; break;
        case '3': return '0011'; break;
        case '4': return '0100'; break;
        case '5': return '0101'; break;
        case '6': return '0110'; break;
        case '7': return '0111'; break;
        case '8': return '1000'; break;
        case '9': return '1001'; break;
        case 'A': return '1010'; break;
        case 'B': return '1011'; break;
        case 'C': return '1100'; break;
        case 'D': return '1101'; break;
        case 'E': return '1110'; break;
        case 'F': return '1111'; break;
        default: return c;
    }
}

/*
*Build the task queue (with different modes)
*/

for (var i = 2; i < process.argv.length; i++){
    var arg = process.argv[i];
    
    switch(arg){
     case 'setup': 
            tasks.push(setupDB);    
            tasks.push(processMunicipalities);
            tasks.push(processTrainstations);
            tasks.push(processDepartures); 
            break;
    case 'schema':           
            tasks.push(setupDB); 
            break;
    case 'update': 
            tasks.push(processTrainstations);
            tasks.push(processDepartures);
            break;
    case 'departures':            
            tasks.push(processDepartures);
            break;
    case 'trainstations':            
            tasks.push(processTrainstations);
            break;
    case 'municipalities':            
            tasks.push(processMunicipalities);
            break;
    case '-b':
            tasks.push(processBitfield);
            break;
    case '-g':
            tasks.push(generateMunicipalitiesAllFile);
            break;
    }
    
    
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
    