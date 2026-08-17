function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
var Q = [];
(function () { var i; for (i = 0; i <= 10; i++) Q.push(i); })();
function Vq(q) { return q; }
function normalize(w) {
  var i, Z = 0, out = [];
  for (i = 0; i < w.length; i++) Z += w[i];
  if (Z <= 1e-15) {
    for (i = 0; i < w.length; i++) out[i] = 0;
    return out;
  }
  for (i = 0; i < w.length; i++) out[i] = w[i] / Z;
  return out;
}
function meanQ(p) {
  var i, m = 0, Z = 0;
  for (i = 0; i < p.length; i++) { m += p[i] * Q[i]; Z += p[i]; }
  return Z <= 1e-15 ? NaN : m / Z;
}
function entropy(p) {
  var i, h = 0;
  for (i = 0; i < p.length; i++) if (p[i] > 1e-15) h -= p[i] * Math.log(p[i]);
  return h;
}
function supportCount(p) {
  var i, n = 0;
  for (i = 0; i < p.length; i++) if (p[i] > 1e-12) n++;
  return n;
}
function tailMass(p) {
  var i, t = 0, m = meanQ(p);
  if (!isFinite(m)) return 0;
  for (i = 0; i < p.length; i++) if (Q[i] > m + 2) t += p[i];
  return t;
}
function tilt(mu, tau) {
  var i, logs = [], maxl = -Infinity, w = [];
  for (i = 0; i < mu.length; i++) {
    logs[i] = (mu[i] > 0 ? Math.log(mu[i]) : -1e9) + Vq(Q[i]) / tau;
    if (logs[i] > maxl) maxl = logs[i];
  }
  for (i = 0; i < mu.length; i++) w[i] = Math.exp(logs[i] - maxl);
  return normalize(w);
}
function select(rho, price) {
  var i, w = [];
  for (i = 0; i < rho.length; i++) w[i] = Q[i] > price + 1e-12 ? 0 : rho[i];
  return normalize(w);
}
function mulberry32(a) {
  return function () {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
function resample(rho, n, seed) {
  var i, j, cdf = [], s = 0, counts = [], rng = mulberry32(seed);
  for (i = 0; i < rho.length; i++) { s += rho[i]; cdf[i] = s; counts[i] = 0; }
  if (s <= 1e-15) return normalize(counts);
  for (j = 0; j < n; j++) {
    var u = rng() * s;
    for (i = 0; i < cdf.length; i++) if (u <= cdf[i]) { counts[i]++; break; }
  }
  return normalize(counts);
}
function step(mu, tau, map, ndraw, seed) {
  var price = meanQ(mu);
  var rho = tilt(mu, tau);
  var next;
  if (map === 0) next = rho;
  else if (map === 1) next = select(rho, price);
  else next = resample(rho, ndraw, seed);
  return { rho: rho, price: price, mu: next };
}
function run(rounds, tau, map, ndraw) {
  var i, mu = [];
  for (i = 0; i < Q.length; i++) mu[i] = 1 / Q.length;
  var rho = tilt(mu, tau), price = meanQ(mu);
  for (i = 0; i < rounds; i++) {
    var st = step(mu, tau, map, ndraw, 1000 + i * 17);
    mu = st.mu;
    rho = st.rho;
    price = st.price;
  }
  return { mu: mu, rho: rho, price: price };
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
var MAPS = ["Lucas: mu <- rho*", "Akerlof: mu <- (selection o tilt)", "collapse: resample rho*"];
function initAkerlof() {
  var mapEl = document.getElementById("map");
  var roundEl = document.getElementById("rounds");
  var tauEl = document.getElementById("tau");
  var nEl = document.getElementById("ndraw");
  var plot = document.getElementById("plot");
  if (!mapEl || !plot) return;
  function draw() {
    var map = parseInt(mapEl.value, 10);
    var rounds = parseInt(roundEl.value, 10);
    var tau = parseFloat(tauEl.value);
    var ndraw = parseInt(nEl.value, 10);
    document.getElementById("map-val").textContent = MAPS[map].split(":")[0];
    document.getElementById("round-val").textContent = String(rounds);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("n-val").textContent = String(ndraw);
    var st = run(rounds, tau, map, ndraw);
    var p = st.price, h = entropy(st.mu), supp = supportCount(st.mu), tail = tailMass(st.mu);
    document.getElementById("p-stat").textContent = fmt(p, 2);
    document.getElementById("h-stat").textContent = fmt(h, 2) + " nats";
    document.getElementById("supp-stat").textContent = supp + " / " + Q.length;
    document.getElementById("tail-stat").textContent = fmt(tail);
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    var ymax = 0, i;
    for (i = 0; i < Q.length; i++) {
      if (st.mu[i] > ymax) ymax = st.mu[i];
      if (st.rho[i] > ymax) ymax = st.rho[i];
    }
    ymax = Math.max(ymax, 0.12);
    function X(q) { return L + (q / 10) * iw; }
    function Y(v) { return top + (1 - v / ymax) * ih; }
    var ticks = "", k, tv;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * ymax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (k = 0; k <= 10; k++) {
      ticks += "<text x=\"" + X(k) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + k + "</text>";
    }
    var bars = "", bw = iw / 10 * 0.55;
    for (i = 0; i < Q.length; i++) {
      var x = X(Q[i]) - bw / 2;
      var y = Y(st.mu[i]);
      var dead = st.mu[i] <= 1e-12;
      bars += "<rect x=\"" + x.toFixed(2) + "\" y=\"" + y.toFixed(2) + "\" width=\"" + bw.toFixed(2) + "\" height=\"" + Math.max(0, H - bot - y).toFixed(2) + "\" fill=\"" + (dead ? "#e4dccb" : "#1b1814") + "\" fill-opacity=\"" + (dead ? "0.45" : "0.85") + "\" />";
    }
    var rhoPts = [];
    for (i = 0; i < Q.length; i++) rhoPts.push([X(Q[i]), Y(st.rho[i])]);
    var marks = "";
    if (isFinite(p)) {
      marks += "<line x1=\"" + X(p) + "\" y1=\"" + top + "\" x2=\"" + X(p) + "\" y2=\"" + (H - bot) + "\" stroke=\"#8f2d1c\" stroke-dasharray=\"3 3\" />";
    }
    plot.innerHTML = ticks + bars + polyline(rhoPts, "#8f2d1c", "6 5") + marks;
    var live = [];
    for (i = 0; i < Q.length; i++) if (st.mu[i] > 1e-12) live.push(Q[i]);
    var collapsed = supp === 0 || (map === 1 && supp <= 2 && rounds >= 6);
    document.getElementById("map-eq").innerHTML =
      MAPS[map] + "<br>rounds = " + rounds + ", tau = " + fmt(tau, 2);
    document.getElementById("map-box").className = "eqbox " + (map === 1 ? "ok" : "");
    document.getElementById("sel-eq").innerHTML =
      (live.length ? "surviving q in {" + live.join(", ") + "}" : "support empty — mu has collapsed") +
      "<br>p = E_mu[q] = " + fmt(p, 2) + (map === 1 ? "; exit if q > p" : "");
    document.getElementById("sel-box").className = "eqbox " + (collapsed ? "bad" : (map === 1 && supp < Q.length ? "ok" : ""));
    document.getElementById("lit-eq").innerHTML =
      "Lucas: absorb the tilt, mu <- rho*. Akerlof: the same loop with a support-restriction step. Collapse: finite sampling zeroes a tail.<br>" +
      (map === 0 ? "this path is annealing toward a point mass on argmax V (rational expectations)." :
        map === 1 ? "this path is adverse selection: the reference sheds types above the price." :
        "this path is model collapse: a zeroed tail cannot be restored.");
  }
  ["map", "rounds", "tau", "ndraw"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initAkerlof);
function renderKatex() {
  if (!window.renderMathInElement) return;
  window.renderMathInElement(document.body, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false }
    ]
  });
}
window.addEventListener("load", renderKatex);
