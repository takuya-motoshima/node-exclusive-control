const cron = require('node-cron');
const {exec, fork} = require('child_process');
const moment = require('moment');
const fs = require('fs');

// Delete counter file.
if (fs.existsSync('counter.txt'))
  fs.unlinkSync('counter.txt');

// Start multiple child processes at the same time.
fork('child.js', ['child1']);
fork('child.js', ['child2']);

// // Time one second after the present.
// const time = moment().add(2, 'seconds');
// const second = time.format('ss');
// const minute = time.format('mm');
// const hour = time.format('HH');

// // Execute multiple child.js at the same time after 1 second.
// cron.schedule(`${second} ${minute} ${hour} * * *`, () => exec('node -r esm child.js child1'));
// cron.schedule(`${second} ${minute} ${hour} * * *`, () => exec('node -r esm child.js child2'));