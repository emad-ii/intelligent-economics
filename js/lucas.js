function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
var Q = [];
(function () { var i; for (i = 0; i <= 10; i++) Q.push(i); })();
function Vx(x, peak) { return -0.5 * (x - peak) * (x - peak); }
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
function mix(a, b, alpha) {
  var i, w = [];
  for (i = 0; i < a.length; i++) w[i] = (1 - alpha) * a[i] + alpha * b[i];
  return normalize(w);
}
function entropy(p) {
  var i, h = 0;
  for (i = 0; i < p.length; i++) if (p[i] > 1e-15) h -= p[i] * Math.log(p[i]);
  return h;
}
function meanQ(p) {
  var i, m = 0;
  for (i = 0; i < p.length; i++) m += p[i] * Q[i];
  return m;
}
function startMu(m0) {
  var i, w = [], s = 1.1;
  for (i = 0; i < Q.length; i++) w[i] = Math.exp(-0.5 * ((Q[i] - m0) / s) * ((Q[i] - m0) / s));
  return normalize(w);
}
function tilt(mu, tau, peak) {
  var i, logs = [], maxl = -Infinity, w = [];
  for (i = 0; i < mu.length; i++) {
    logs[i] = (mu[i] > 0 ? Math.log(mu[i]) : -1e9) + Vx(Q[i], peak) / tau;
    if (logs[i] > maxl) maxl = logs[i];
  }
  for (i = 0; i < mu.length; i++) w[i] = Math.exp(logs[i] - maxl);
  return normalize(w);
}
function run(rounds, tau, peak, m0, alpha) {
  var i, mu = startMu(m0), rho = tilt(mu, tau, peak);
  for (i = 0; i < rounds; i++) {
    rho = tilt(mu, tau, peak);
    mu = mix(mu, rho, alpha);
  }
  rho = tilt(mu, tau, peak);
  return { mu: mu, rho: rho };
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function regime(alpha, rounds, h, mean, peak) {
  if (alpha < 0.04 || rounds === 0) return "fixed expectations";
  if (alpha > 0.85 && rounds >= 8 && h < 0.55 && Math.abs(mean - peak) < 0.45) return "rational expectations";
  return "adapting";
}
function initLucas() {
  var aEl = document.getElementById("alpha");
  var rEl = document.getElementById("rounds");
  var vEl = document.getElementById("vpeak");
  var mEl = document.getElementById("mupeak");
  var tEl = document.getElementById("tau");
  var plot = document.getElementById("plot");
  if (!aEl || !plot) return;
  function draw() {
    var alpha = parseFloat(aEl.value);
    var rounds = parseInt(rEl.value, 10);
    var peak = parseFloat(vEl.value);
    var m0 = parseFloat(mEl.value);
    var tau = parseFloat(tEl.value);
    document.getElementById("alpha-val").textContent = alpha.toFixed(2);
    document.getElementById("round-val").textContent = String(rounds);
    document.getElementById("v-val").textContent = peak.toFixed(1);
    document.getElementById("m-val").textContent = m0.toFixed(1);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    var st = run(rounds, tau, peak, m0, alpha);
    var h = entropy(st.mu), mean = meanQ(st.mu);
    var reg = regime(alpha, rounds, h, mean, peak);
    document.getElementById("h-stat").textContent = fmt(h, 2) + " nats";
    document.getElementById("mean-stat").textContent = fmt(mean, 2);
    document.getElementById("peak-stat").textContent = fmt(peak, 1);
    document.getElementById("reg-stat").textContent = reg;
    var W = 640, H = 280, L = 48, Rpad = 18, top = 16, bot = 36;
    var iw = W - L - Rpad, ih = H - top - bot;
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
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - Rpad) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (k = 0; k <= 10; k++) {
      ticks += "<text x=\"" + X(k) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + k + "</text>";
    }
    var bars = "", bw = iw / 10 * 0.55;
    for (i = 0; i < Q.length; i++) {
      var x = X(Q[i]) - bw / 2;
      var y = Y(st.mu[i]);
      bars += "<rect x=\"" + x.toFixed(2) + "\" y=\"" + y.toFixed(2) + "\" width=\"" + bw.toFixed(2) + "\" height=\"" + Math.max(0, H - bot - y).toFixed(2) + "\" fill=\"#1b1814\" fill-opacity=\"0.85\" />";
    }
    var rhoPts = [];
    for (i = 0; i < Q.length; i++) rhoPts.push([X(Q[i]), Y(st.rho[i])]);
    var marks = "<line x1=\"" + X(peak) + "\" y1=\"" + top + "\" x2=\"" + X(peak) + "\" y2=\"" + (H - bot) + "\" stroke=\"#8f2d1c\" stroke-dasharray=\"3 3\" />";
    plot.innerHTML = ticks + bars + polyline(rhoPts, "#8f2d1c", "6 5") + marks;
    document.getElementById("in-eq").innerHTML =
      "rho* ~ mu * exp(V / tau), tau = " + fmt(tau, 2) +
      "<br>this-round rho* mean = " + fmt(meanQ(st.rho), 2) + "; Langevin holds mu fixed";
    document.getElementById("across-eq").innerHTML =
      (alpha >= 0.99 ? "settled absorb: mu <- rho*" : "illustrative incomplete settlement: mu <- (1-a) mu + a rho*") +
      "<br>a = " + fmt(alpha, 2) + ", rounds = " + rounds + ", H(mu) = " + fmt(h, 2);
    document.getElementById("across-box").className = "eqbox " + (alpha >= 0.99 ? "ok" : "");
    document.getElementById("lim-eq").innerHTML =
      "slow (a ~ 0): fixed expectations. fast (a = 1, many rounds): rational expectations as the fixed point of mu <- rho*.<br>this path: " + reg + ". mu is not policy-invariant.";
    document.getElementById("lim-box").className = "eqbox " + (reg === "rational expectations" ? "ok" : (reg === "fixed expectations" ? "" : ""));
  }
  ["alpha", "rounds", "vpeak", "mupeak", "tau"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initLucas);
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
