const fs = require('fs');
const moment = require('moment');
const os = require("os");

(async () => {
  // ID of this process.
  const pid = process.argv[2]||process.getuid();

  // Wait for the specified number of seconds.
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  // Returns a random integer.
  const rand = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

  // Output log.
  const log = (message) => {
    message = `${moment().format('YYYY-MM-DD HH:mm:ss')} -> #${pid} ${message}`;
    console.log(message);
    fs.appendFileSync('debug.log', `${message}${os.EOL}`, 'utf-8');
  };

  // Outputs 1 to 3 counters to a file every 1000 seconds.
  for (let i=0; i<5; i++) {
    // Read counter from file.
    let counter = 0;
    if (fs.existsSync('counter.txt'))
      counter = parseInt(fs.readFileSync('counter.txt', 'utf-8'), 10);

    // Increment the counter.
    ++counter;

    // Wait 100-500 milliseconds.
    log(`loop=${i}, counter=${counter}`);

    // Wait.
    await sleep(rand(100, 500));

    // Increment the counter and output to a file.
    fs.writeFileSync('counter.txt', (counter).toString(), 'utf-8');
  }
})();