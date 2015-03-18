#How to install
1. Install mysql Server (http://dev.mysql.com/downloads/mysql/)
2. Install node.js (https://nodejs.org/)
3. Install node-mysql(https://github.com/felixge/node-mysql#install)
4. Create a folder named *'data'* in the SetupDatabase folder
5. Download the data from [here](http://www.fahrplanfelder.ch/de/fahrplandaten) and copy the BFKOORD and FPLAN files into the data folder
6. Run ```node setupDatabase.js setup```