const BigPrimeGenerator = require("./bigPrimeGenerator");
const BigIntegerGenerator = require("./bigIntegerGenerator");
const jsbn = require("./jsbn");

const crypto = require("crypto");
const two = new jsbn.BigInteger([2]);

class Ffs {
  constructor(seedBytesArray, pqBytes, siBytes, k) {
    if (seedBytesArray.length < 2) throw "Must have at least 2 seed bytes";
    this.k = k;
    let arrayMiddle = Math.floor(seedBytesArray.length / 2);
    let pqSeed = seedBytesArray.slice(0, arrayMiddle);
    let siSeed = seedBytesArray.slice(arrayMiddle);
    this.siGenerator = new BigIntegerGenerator(siSeed, siBytes);
    this.primes = new BigPrimeGenerator(
      new BigIntegerGenerator(pqSeed, pqBytes)
    );
  }

  setup() {
    let n = this.chooseN();
    let S = this.chooseS(n);
    let V = this.computeV(S, n);
    return [n, S, V];
  }

  // Proof
  initProof(n) {
    let sign = this.siGenerator.randomSign();
    let r = this.siGenerator.next();
    let x = r.modPowInt(two, n).multiply(sign).mod(n);

    return [sign, r, x];
  }

  chooseA() {
    return crypto.randomBytes(this.k).map((a) => a % 2);
  }

  computeY(r, S, A, n) {
    let y = r;
    A.forEach((a, i) => {
      if (a != 0) {
        y = y.multiply(S[i]).mod(n);
      }
    });

    return y;
  }

  checkY(y, n, x, A, V) {
    if (x.equals(jsbn.BigInteger.ZERO)) return false;

    let leftSide = y.modPowInt(two, n);
    let product = jsbn.BigInteger.ONE;
    A.forEach((a, i) => {
      if (a != 0) {
        product = product.multiply(V[i]).mod(n);
      }
    });
    let rightSide1 = x.negate().multiply(product).mod(n);
    let rightSide2 = x.multiply(product).mod(n);
    return leftSide.equals(rightSide1) || leftSide.equals(rightSide2);
  }

  // private
  chooseN() {
    let p, q, n;
    [p, q, n] = this.primes.nextBlum();
    return n.abs();
  }

  chooseS(n) {
    let S = [];
    while (S.length < this.k) {
      S.push(this.siGenerator.nextCoprime(n));
    }
    return S;
  }

  computeV(S, n) {
    return S.map((si) => si.modPowInt(two, n));
  }
}

module.exports = Ffs;
