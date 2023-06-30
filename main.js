const bigInt = require('big-integer')

const number_of_gs = parseInt(process.argv[2])

// (a)
const bits100 = bigInt(2).shiftLeft(100)
let p10 = null

do {
    p10 = bigInt.randBetween(bits100, bits100.shiftLeft(1).prev())
} while (!p10.isPrime())

// (b)
const pk = [2, 3, 5, 7, 11, 13, 17, 19, 23, p10].map(v => bigInt(v))
const size_p = pk.length
let [a, p, Qs] = [null, null, null]

const randExponent = _ => Math.floor(Math.random() * 10) + 15

do {
    a = Array.from({ length: size_p }, (_, i) => (i === size_p - 1 ? 1 : randExponent()))
    Qs = pk.map((pk, k) => bigInt(pk).pow(a[k])) // [pk^ak]
    p = Qs.reduce((acc, val) => acc.times(val), bigInt[1]).next() // sum(pk^ak) + 1
} while (!p.isPrime())

console.log('~ p10: ', p10.toString())
console.log('~  pk: [', pk.toString(), ']')
console.log('~   a: [', a.toString(), ']')
console.log('~   p: ', p.toString())

// (c)
let gs = Array.from({ length: number_of_gs }, _ => bigInt.randBetween(2, p.prev().prev()))

// (d)
const Qj = Array.from({ length: size_p }, (_, j) => Qs.reduce((acc, val, ind) => (ind == j ? acc : acc.times(val)), bigInt[1])) // [sum(pk^ak)/(pj^aj)]
const ord_gs = gs.map(g => {
    const gjs = Qj.map(qj => g.modPow(qj, p))
    const bjs = Array.from({ length: size_p })
    for (let j = 0; j < size_p; j++) {
        let [gj, bj] = [gjs[j], 0]
        const pj = pk[j]
        while (gj != 1) {
            gj = gj.modPow(pj, p)
            bj++
        }
        bjs[j] = bj
    }
    let ord_g = pk.map((p, k) => bigInt(p).pow(bjs[k])).reduce((acc, val) => acc.times(val), bigInt[1])

    console.log('\n> g:', g.toString())
    console.log('~ alpha: [', a.toString(), ']')
    s = ''
    for (let j = 0; j < bjs.length; j++) {
        if (bjs[j] != a[j]) s += '\x1B[31m'
        s += bjs[j]
        if (bjs[j] != a[j]) s += '\x1B[0m'
        if (j < bjs.length - 1) s += ','
    }
    console.log('~ beta:  [ ' + s + ' ]')
    console.log('< ord(g) =', ord_g.toString())

    return ord_g
})

// (e)
const is_ord = gs.map((g, i) => g.modPow(ord_gs[i], p) == 1)
console.assert(is_ord.every(v => v), 'ERROR: WRONG ORDERS') // prettier-ignore
