function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
var GRID = [];
(function () { var i; for (i = 0; i <= 10; i++) GRID.push(i); })();
function V1(x) { return 2.2 * x - 0.10 * x * x; }
function V2(x) { return 1.6 * x - 0.08 * x * x; }
function tilt(V, mu, tau) {
  var i, logs = [], maxl = -Infinity, Z = 0, w = [], rho = [];
  for (i = 0; i < V.length; i++) {
    var lm = mu[i] > 0 ? Math.log(mu[i]) : -1e9;
    logs[i] = lm + V[i] / tau;
    if (logs[i] > maxl) maxl = logs[i];
  }
  for (i = 0; i < V.length; i++) { w[i] = Math.exp(logs[i] - maxl); Z += w[i]; }
  var EV = 0, kl = 0, mean = 0;
  for (i = 0; i < V.length; i++) {
    rho[i] = w[i] / Z;
    EV += rho[i] * V[i];
    mean += rho[i] * GRID[i];
    if (mu[i] > 0 && rho[i] > 0) kl += rho[i] * (Math.log(rho[i]) - Math.log(mu[i]));
  }
  return { rho: rho, EV: EV, kl: kl, F: EV - tau * kl, mean: mean };
}
function makeMu(cut) {
  var i, mu = [], s = 0;
  for (i = 0; i < GRID.length; i++) {
    mu[i] = (cut > 0 && GRID[i] > 10 - cut) ? 0 : 1;
    s += mu[i];
  }
  for (i = 0; i < GRID.length; i++) mu[i] = s > 0 ? mu[i] / s : 0;
  return mu;
}
function agent(p, tau, Vfn, mu) {
  var i, V = [];
  for (i = 0; i < GRID.length; i++) V[i] = Vfn(GRID[i]) - p * GRID[i];
  return tilt(V, mu, tau);
}
function clearMarket(tau, omega, mu1, mu2) {
  var lo = 0.02, hi = 2.40, k, mid, a1, a2, z;
  for (k = 0; k < 40; k++) {
    mid = 0.5 * (lo + hi);
    a1 = agent(mid, tau, V1, mu1);
    a2 = agent(mid, tau, V2, mu2);
    z = a1.mean + a2.mean - omega;
    if (z > 0) lo = mid; else hi = mid;
  }
  return { p: mid, a1: a1, a2: a2, z: a1.mean + a2.mean - omega };
}
function ownF(rho, Vfn, kl, tau) {
  var i, EV = 0;
  for (i = 0; i < GRID.length; i++) EV += rho[i] * Vfn(GRID[i]);
  return { EV: EV, F: EV - tau * kl };
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function initWelfare() {
  var tauEl = document.getElementById("tau");
  var oEl = document.getElementById("omega");
  var tEl = document.getElementById("transfer");
  var cEl = document.getElementById("cut");
  var plot = document.getElementById("plot");
  if (!tauEl || !plot) return;
  function draw() {
    var tau = parseFloat(tauEl.value);
    var omega = parseFloat(oEl.value);
    var T = parseFloat(tEl.value);
    var cut = parseFloat(cEl.value);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("omega-val").textContent = omega.toFixed(1);
    document.getElementById("t-val").textContent = T.toFixed(2);
    document.getElementById("cut-val").textContent = cut === 0 ? "open" : "cut " + cut.toFixed(0);
    var mu1 = makeMu(0);
    var mu2 = makeMu(cut);
    var mkt = clearMarket(tau, omega, mu1, mu2);
    var f1 = ownF(mkt.a1.rho, V1, mkt.a1.kl, tau);
    var f2 = ownF(mkt.a2.rho, V2, mkt.a2.kl, tau);
    var F = f1.F + f2.F;
    var shadow = f1.EV + f2.EV;
    document.getElementById("x1-stat").textContent = fmt(mkt.a1.mean);
    document.getElementById("x2-stat").textContent = fmt(mkt.a2.mean);
    document.getElementById("f-stat").textContent = fmt(F);
    document.getElementById("shadow-stat").textContent = fmt(shadow);
    var excluded = 0, i;
    for (i = 0; i < GRID.length; i++) if (mu2[i] === 0) excluded += mkt.a2.rho[i];
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    var rmax = 0.01;
    for (i = 0; i < GRID.length; i++) {
      if (mkt.a1.rho[i] > rmax) rmax = mkt.a1.rho[i];
      if (mkt.a2.rho[i] > rmax) rmax = mkt.a2.rho[i];
    }
    function X(x) { return L + (x / 10) * iw; }
    function Y(v) { return top + (1 - v / rmax) * ih; }
    var ticks = "", k, tv;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * rmax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (k = 0; k <= 5; k++) {
      ticks += "<text x=\"" + X(2 * k) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + (2 * k) + "</text>";
    }
    var p1 = [], p2 = [];
    for (i = 0; i < GRID.length; i++) {
      p1.push([X(GRID[i]), Y(mkt.a1.rho[i])]);
      p2.push([X(GRID[i]), Y(mkt.a2.rho[i])]);
    }
    var marks = "";
    marks += "<circle cx=\"" + X(mkt.a1.mean) + "\" cy=\"" + Y(0) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + X(mkt.a2.mean) + "\" cy=\"" + Y(0) + "\" r=\"4\" fill=\"#8f2d1c\" />";
    plot.innerHTML = ticks + polyline(p1, "#1b1814") + polyline(p2, "#8f2d1c", "6 5") + marks;
    document.getElementById("first-eq").innerHTML =
      "cleared at p = " + fmt(mkt.p) + ", z = " + fmt(mkt.z) + "<br>" +
      "F = E[V1]-tau KL1 + E[V2]-tau KL2 = " + fmt(F) + "<br>" +
      "KL1 = " + fmt(mkt.a1.kl) + ", KL2 = " + fmt(mkt.a2.kl);
    document.getElementById("second-eq").innerHTML =
      "numeraire transfer T = " + fmt(T) + "<br>" +
      "goods (x1*, x2*) unchanged under T<br>" +
      "agent 1 money " + fmt(-T) + ", agent 2 money " + fmt(T);
    document.getElementById("doxa-eq").innerHTML =
      cut === 0
        ? "mu2 open: Pareto still blind to mu, but support is full"
        : "mu2 zeros high x; mass on excluded states = " + fmt(excluded, 4) + "<br>allocation still maximises F against that doxa";
    document.getElementById("doxa-box").className = "eqbox " + (cut === 0 ? "" : "bad");
  }
  ["tau", "omega", "transfer", "cut"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initWelfare);
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
