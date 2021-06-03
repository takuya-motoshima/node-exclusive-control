# node-exclusive-control

This is sample code that performs exclusive control when multiple processes write to the same file at the same time.

## Usage

First, let's check what kind of problem will occur if exclusive control is not performed.  

child.js reads the number from counter.txt, increments the read number by 1, and writes it to counter.txt again.  

**child.js:**
```js
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
```

Assuming that the initial value of the count is 1, 5 will be written to counter.txt as a result of executing child.js.  

```sh
# Output: 2021-06-03 14:54:57 -> #1000 loop=0, counter=1
#         2021-06-03 14:54:57 -> #1000 loop=1, counter=2
#         2021-06-03 14:54:57 -> #1000 loop=2, counter=3
#         2021-06-03 14:54:58 -> #1000 loop=3, counter=4
#         2021-06-03 14:54:58 -> #1000 loop=4, counter=5
node child.js;
```

```sh
# Output: 5
cat counter.txt;
```

So far, it's normal operation.  
Next, let's start two child.js at the same time.  

The following main.js is a program that starts two child.js.

**main.js:**
```js
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
```

Now let's run main.js.  

```sh
# Output: 2021-06-03 15:04:20 -> #child1 loop=0, counter=1
#         2021-06-03 15:04:20 -> #child2 loop=0, counter=1
#         2021-06-03 15:04:21 -> #child1 loop=1, counter=2
#         2021-06-03 15:04:21 -> #child2 loop=1, counter=2
#         2021-06-03 15:04:21 -> #child1 loop=2, counter=3
#         2021-06-03 15:04:21 -> #child2 loop=2, counter=3
#         2021-06-03 15:04:21 -> #child1 loop=3, counter=4
#         2021-06-03 15:04:22 -> #child1 loop=4, counter=5
#         2021-06-03 15:04:22 -> #child2 loop=3, counter=4
#         2021-06-03 15:04:22 -> #child2 loop=4, counter=5
node main.js;
```

Let's take a look at counter.txt.  
I've launched two child.js that increment by 5, so I'm hoping that 10 is being output.

```sh
# Output: 5
cat counter.txt;
```

how is it? The result was 5 instead of 10.  
This is because the second child.js loaded counter.js before the first child.js loaded counter.js and incremented it.  
As a result, the two child.js ended up having exactly the same numbers at one point.

The above is an example of the problem that occurs when exclusive control is not performed.




