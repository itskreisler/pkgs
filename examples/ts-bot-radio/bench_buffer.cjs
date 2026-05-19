const { performance } = require('perf_hooks');

function benchConcat(iterations) {
    let buffer = Buffer.alloc(0);
    const chunk = Buffer.alloc(64 * 1024);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const end = performance.now();
    return end - start;
}

function benchArray(iterations) {
    let chunks = [];
    const chunk = Buffer.alloc(64 * 1024);
    const start = performance.now();
    for (let i = 0; i < iterations; i++) {
        chunks.push(chunk);
    }
    const final = Buffer.concat(chunks);
    const end = performance.now();
    return end - start;
}

const iterations = 1000;
console.log(`Running with ${iterations} iterations (${iterations * 64 / 1024} MB total)`);
console.log('Buffer.concat in loop:', benchConcat(iterations).toFixed(4), 'ms');
console.log('Array push + single concat:', benchArray(iterations).toFixed(4), 'ms');
