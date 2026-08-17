function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
var VPEAK = 6.5;
var XS = [];
(function () {
  var i, n = 81;
  for (i = 0; i < n; i++) XS.push(10 * i / (n - 1));
})();
function V(x) { return -0.5 * (x - VPEAK) * (x - VPEAK); }
function dV(x) { return -(x - VPEAK); }
function logMu(x, m, s) { return -0.5 * ((x - m) / s) * ((x - m) / s); }
function dLogMu(x, m, s) { return -(x - m) / (s * s); }
function normalize(w) {
  var i, Z = 0, out = [];
  for (i = 0; i < w.length; i++) Z += w[i];
  for (i = 0; i < w.length; i++) out[i] = w[i] / Z;
  return out;
}
function rhoStar(tau, m, s) {
  var i, logs = [], maxl = -Infinity, w = [];
  for (i = 0; i < XS.length; i++) {
    logs[i] = logMu(XS[i], m, s) + V(XS[i]) / tau;
    if (logs[i] > maxl) maxl = logs[i];
  }
  for (i = 0; i < XS.length; i++) w[i] = Math.exp(logs[i] - maxl);
  return normalize(w);
}
function muDens(m, s) {
  var i, w = [];
  for (i = 0; i < XS.length; i++) w[i] = Math.exp(logMu(XS[i], m, s));
  return normalize(w);
}
function argmax(p) {
  var i, best = 0;
  for (i = 1; i < p.length; i++) if (p[i] > p[best]) best = i;
  return best;
}
function analyticMode(tau, m, s) {
  var a = tau / (s * s);
  return (VPEAK + a * m) / (1 + a);
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function initEuler() {
  var tauEl = document.getElementById("tau");
  var mEl = document.getElementById("mupeak");
  var sEl = document.getElementById("width");
  var plot = document.getElementById("plot");
  if (!tauEl || !plot) return;
  function draw() {
    var tau = parseFloat(tauEl.value);
    var m = parseFloat(mEl.value);
    var s = parseFloat(sEl.value);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("m-val").textContent = m.toFixed(1);
    document.getElementById("s-val").textContent = s.toFixed(2);
    var rho = rhoStar(tau, m, s);
    var mu = muDens(m, s);
    var xstar = analyticMode(tau, m, s);
    var x0 = VPEAK;
    var corrAtMode = -tau * dLogMu(xstar, m, s);
    var gradV = dV(xstar);
    var resid = gradV - corrAtMode;
    var corrAtClass = -tau * dLogMu(x0, m, s);
    document.getElementById("mode-stat").textContent = fmt(xstar, 2);
    document.getElementById("class-stat").textContent = fmt(x0, 2);
    document.getElementById("corr-stat").textContent = fmt(corrAtMode);
    document.getElementById("res-stat").textContent = fmt(resid, 4);
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    var ymax = 0, i;
    for (i = 0; i < XS.length; i++) {
      if (rho[i] > ymax) ymax = rho[i];
      if (mu[i] > ymax) ymax = mu[i];
    }
    function X(x) { return L + (x / 10) * iw; }
    function Y(v) { return top + (1 - v / ymax) * ih; }
    var ticks = "", k, tv, tu;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * ymax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (k = 0; k <= 5; k++) {
      tu = (k / 5) * 10;
      ticks += "<text x=\"" + X(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(0) + "</text>";
    }
    var rhoPts = [], muPts = [];
    for (i = 0; i < XS.length; i++) {
      rhoPts.push([X(XS[i]), Y(rho[i])]);
      muPts.push([X(XS[i]), Y(mu[i])]);
    }
    var marks = "";
    marks += "<line x1=\"" + X(xstar) + "\" y1=\"" + top + "\" x2=\"" + X(xstar) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    marks += "<circle cx=\"" + X(xstar) + "\" cy=\"" + Y(rho[argmax(rho)]) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + X(x0) + "\" cy=\"" + Y(0) + "\" r=\"7\" fill=\"none\" stroke=\"#0d5c3d\" />";
    plot.innerHTML = ticks + polyline(muPts, "#8f2d1c", "6 5") + polyline(rhoPts, "#1b1814") + marks;
    document.getElementById("foc-eq").innerHTML =
      "grad V(x*) = " + fmt(gradV) + "<br>-tau grad log mu(x*) = " + fmt(corrAtMode) +
      "<br>|grad V + tau grad log mu| = " + fmt(Math.abs(resid), 4);
    document.getElementById("lim-eq").innerHTML =
      "tau -> 0 forces grad V = 0 at the value peak x = " + fmt(x0, 2) +
      "<br>this mode sits " + fmt(Math.abs(xstar - x0), 2) + " from that peak";
    document.getElementById("lim-box").className = "eqbox " + (tau < 0.12 ? "ok" : "");
    var sign = corrAtClass > 1e-6 ? "positive" : (corrAtClass < -1e-6 ? "negative" : "zero");
    var pull = m < x0 ? "mu pulls the mode left, toward the doxic peak" : (m > x0 ? "mu pulls the mode right, toward the doxic peak" : "mu is centred on the value peak; correction vanishes");
    document.getElementById("sign-eq").innerHTML =
      "at the tau->0 mode, -tau grad log mu = " + fmt(corrAtClass) + " (" + sign + ")<br>" + pull;
    document.getElementById("sign-box").className = "eqbox " + (Math.abs(corrAtClass) > 0.05 ? "ok" : "");
  }
  ["tau", "mupeak", "width"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initEuler);
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
