let count = 0;
let map = new Map();
let i;
while(true) {
    i=0
    if(map.has(i)) {
        break;
    }
    i = parseInt(Math.random() * 10000000000);
    map.set(i, 0);
    count++;
}
console.log(count)
console.log(i);

console.dir(map.keys())