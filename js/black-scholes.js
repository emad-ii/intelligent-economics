function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
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
function kl(p, q) {
  var i, s = 0;
  for (i = 0; i < p.length; i++) {
    if (p[i] <= 1e-15) continue;
    var den = q[i] > 1e-15 ? q[i] : 1e-15;
    s += p[i] * Math.log(p[i] / den);
  }
  return s;
}
function meanR(p, R) {
  var i, m = 0;
  for (i = 0; i < p.length; i++) m += p[i] * R[i];
  return m;
}
function tilt(mu, R, lam) {
  var i, logs = [], maxl = -Infinity, w = [];
  for (i = 0; i < mu.length; i++) {
    logs[i] = (mu[i] > 0 ? Math.log(mu[i]) : -1e9) + lam * R[i];
    if (logs[i] > maxl) maxl = logs[i];
  }
  for (i = 0; i < mu.length; i++) w[i] = Math.exp(logs[i] - maxl);
  return normalize(w);
}
function moment(mu, R, lam) {
  return meanR(tilt(mu, R, lam), R);
}
function solveLam(mu, R, target) {
  var lo = -20, hi = 20, mid, k;
  for (k = 0; k < 60; k++) {
    mid = 0.5 * (lo + hi);
    if (moment(mu, R, mid) - target > 0) hi = mid;
    else lo = mid;
  }
  return 0.5 * (lo + hi);
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
var R2 = [0.80, 1.20];
var R3 = [0.80, 1.05, 1.25];
var LAB2 = ["down", "up"];
var LAB3 = ["down", "mid", "up"];
var TARGET = 1;
function initBS() {
  var cEl = document.getElementById("complete");
  var pEl = document.getElementById("pup");
  var dEl = document.getElementById("pdown");
  var tEl = document.getElementById("tau");
  var plot = document.getElementById("plot");
  if (!cEl || !plot) return;
  function draw() {
    var complete = cEl.checked;
    var pup = parseFloat(pEl.value);
    var pdown = parseFloat(dEl.value);
    var tau = parseFloat(tEl.value);
    document.getElementById("p-val").textContent = pup.toFixed(2);
    document.getElementById("pd-val").textContent = pdown.toFixed(2);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    dEl.disabled = complete;
    var R = complete ? R2 : R3;
    var lab = complete ? LAB2 : LAB3;
    var mu;
    if (complete) mu = normalize([1 - pup, pup]);
    else {
      var pmid = Math.max(0.04, 1 - pup - pdown);
      mu = normalize([pdown, pmid, pup]);
    }
    var lam = solveLam(mu, R, TARGET);
    var rho = tilt(mu, R, lam);
    var em = meanR(mu, R);
    var er = meanR(rho, R);
    var dkl = kl(rho, mu);
    var C = tau * dkl;
    document.getElementById("em-stat").textContent = fmt(em);
    document.getElementById("er-stat").textContent = fmt(er);
    document.getElementById("kl-stat").textContent = fmt(dkl) + " nats";
    document.getElementById("c-stat").textContent = fmt(C);
    var W = 640, H = 280, L = 48, Rpad = 18, top = 16, bot = 36;
    var iw = W - L - Rpad, ih = H - top - bot;
    var ymax = 0, i;
    for (i = 0; i < mu.length; i++) {
      if (mu[i] > ymax) ymax = mu[i];
      if (rho[i] > ymax) ymax = rho[i];
    }
    ymax = Math.max(ymax, 0.35);
    function X(i) { return L + ((i + 0.5) / mu.length) * iw; }
    function Y(v) { return top + (1 - v / ymax) * ih; }
    var ticks = "", k, tv;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * ymax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - Rpad) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (i = 0; i < mu.length; i++) {
      ticks += "<text x=\"" + X(i) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + lab[i] + " " + R[i].toFixed(2) + "</text>";
    }
    var bars = "", bw = iw / mu.length * 0.38;
    for (i = 0; i < mu.length; i++) {
      var x = X(i) - bw / 2;
      var y = Y(mu[i]);
      bars += "<rect x=\"" + x.toFixed(2) + "\" y=\"" + y.toFixed(2) + "\" width=\"" + bw.toFixed(2) + "\" height=\"" + Math.max(0, H - bot - y).toFixed(2) + "\" fill=\"#8f2d1c\" fill-opacity=\"0.28\" />";
    }
    var rhoPts = [];
    for (i = 0; i < rho.length; i++) rhoPts.push([X(i), Y(rho[i])]);
    var marks = "";
    for (i = 0; i < rho.length; i++) {
      marks += "<circle cx=\"" + X(i) + "\" cy=\"" + Y(rho[i]) + "\" r=\"4\" fill=\"#1b1814\" />";
    }
    plot.innerHTML = ticks + bars + polyline(rhoPts, "#1b1814") + marks;
    document.getElementById("tilt-eq").innerHTML =
      "rho* ~ mu * exp(lambda * R), lambda = " + fmt(lam) +
      "<br>E_rho[R] = " + fmt(er) + " (no-arbitrage target 1)" +
      "<br>C = tau * KL = " + fmt(tau, 2) + " * " + fmt(dkl) + " = " + fmt(C);
    document.getElementById("comp-eq").innerHTML = complete
      ? "two states, one risky return: unique equivalent measure<br>drag mu: rho* stays put, only the KL cost moves"
      : "three states, one constraint: a family of measures<br>the exponential tilt of mu picks one — incompleteness prices the reference";
    document.getElementById("comp-box").className = "eqbox " + (complete ? "ok" : "");
    document.getElementById("ref-eq").innerHTML = complete
      ? "Table 3: recovered as the complete market's minimal-entropy measure.<br>rho*(up) = " + fmt(rho[rho.length - 1]) + ", independent of this mu."
      : "Table 3 returns: incompleteness prices the reference.<br>this mu selects rho*(up) = " + fmt(rho[rho.length - 1]) + " among those measures.";
    document.getElementById("ref-box").className = "eqbox " + (complete ? "" : "ok");
  }
  ["complete", "pup", "pdown", "tau"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
    document.getElementById(id).addEventListener("change", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initBS);
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
