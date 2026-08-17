function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
var GRID = [];
(function () { var i; for (i = 0; i <= 10; i++) GRID.push(i); })();
function uCons(x) { return 1.8 * x - 0.09 * x * x; }
function costY(y) { return 0.12 * y * y; }
function ensemble(scores) {
  var i, maxl = -Infinity, w = [], Z = 0, mean = 0, m2 = 0;
  for (i = 0; i < scores.length; i++) if (scores[i] > maxl) maxl = scores[i];
  for (i = 0; i < scores.length; i++) { w[i] = Math.exp(scores[i] - maxl); Z += w[i]; }
  for (i = 0; i < scores.length; i++) {
    var r = w[i] / Z;
    mean += r * GRID[i];
    m2 += r * GRID[i] * GRID[i];
  }
  return { mean: mean, v: Math.max(0, m2 - mean * mean), logZ: maxl + Math.log(Z) - Math.log(scores.length) };
}
function demandAt(p, tau) {
  var i, s = [];
  for (i = 0; i < GRID.length; i++) s[i] = (uCons(GRID[i]) - p * GRID[i]) / tau;
  return ensemble(s);
}
function supplyAt(p, tau) {
  var i, s = [];
  for (i = 0; i < GRID.length; i++) s[i] = (p * GRID[i] - costY(GRID[i])) / tau;
  return ensemble(s);
}
function phiAt(p, tau, omega) {
  var d = demandAt(p, tau);
  var s = supplyAt(p, tau);
  return { d: d, s: s, phi: tau * d.logZ + tau * s.logZ + p * omega, z: d.mean - s.mean - omega, hess: (d.v + s.v) / tau };
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function initClearing() {
  var tauEl = document.getElementById("tau");
  var pEl = document.getElementById("price");
  var oEl = document.getElementById("omega");
  var plot = document.getElementById("plot");
  if (!tauEl || !plot) return;
  function draw() {
    var tau = parseFloat(tauEl.value);
    var p = parseFloat(pEl.value);
    var omega = parseFloat(oEl.value);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("price-val").textContent = p.toFixed(2);
    document.getElementById("omega-val").textContent = omega.toFixed(1);
    var cur = phiAt(p, tau, omega);
    document.getElementById("x-stat").textContent = fmt(cur.d.mean);
    document.getElementById("y-stat").textContent = fmt(cur.s.mean);
    document.getElementById("z-stat").textContent = fmt(cur.z);
    document.getElementById("hess-stat").textContent = fmt(cur.hess);
    var pMin = 0.05, pMax = 1.80, n = 90, i, u, pts = [], best = null, bestPhi = Infinity;
    for (i = 0; i <= n; i++) {
      u = pMin + (i / n) * (pMax - pMin);
      var r = phiAt(u, tau, omega);
      pts.push([u, r.phi]);
      if (r.phi < bestPhi) { bestPhi = r.phi; best = { p: u, r: r }; }
    }
    var phiVals = pts.map(function (pt) { return pt[1]; });
    var ymin = Math.min.apply(null, phiVals);
    var ymax = Math.max.apply(null, phiVals);
    var pad = 0.08 * (ymax - ymin || 1);
    ymin -= pad; ymax += pad;
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    function X(u) { return L + ((u - pMin) / (pMax - pMin)) * iw; }
    function Y(v) { return top + (1 - (v - ymin) / (ymax - ymin)) * ih; }
    var ticks = "", k, tv, tu;
    for (k = 0; k <= 5; k++) {
      tv = ymin + (k / 5) * (ymax - ymin);
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(1) + "</text>";
    }
    for (k = 0; k <= 4; k++) {
      tu = pMin + (k / 4) * (pMax - pMin);
      ticks += "<text x=\"" + X(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(2) + "</text>";
    }
    var line = pts.map(function (pt) { return [X(pt[0]), Y(pt[1])]; });
    var marks = "<line x1=\"" + X(p) + "\" y1=\"" + top + "\" x2=\"" + X(p) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    marks += "<circle cx=\"" + X(p) + "\" cy=\"" + Y(cur.phi) + "\" r=\"4\" fill=\"#1b1814\" />";
    if (best) marks += "<circle cx=\"" + X(best.p) + "\" cy=\"" + Y(best.r.phi) + "\" r=\"7\" fill=\"none\" stroke=\"#0d5c3d\" />";
    plot.innerHTML = ticks + polyline(line, "#1b1814") + marks;
    var dir = cur.z > 1e-3 ? "excess demand, p rises" : (cur.z < -1e-3 ? "excess supply, p falls" : "cleared");
    document.getElementById("phi-eq").innerHTML =
      "Phi(p) = tau log Z_d + tau log Z_s + p omega = " + fmt(cur.phi) + "<br>" +
      "Phi(p*) ~ " + fmt(bestPhi) + " at p* ~ " + fmt(best.p) + "<br>" +
      "z(p) = x* - y* - omega = " + fmt(cur.z) + "  (= -Phi')";
    document.getElementById("flow-eq").innerHTML =
      "p-dot along z(p) = -grad Phi<br>at this p: z = " + fmt(cur.z) + " -> " + dir + "<br>" +
      "Phi''(p) = (Var(x)+Var(y))/tau = " + fmt(cur.hess) + (cur.hess > 1e-6 ? " > 0" : " (flat)");
    document.getElementById("smd-eq").innerHTML =
      "quasi-linear scope, as declared<br>income effects would break grad Phi = -z<br>that break is where SMD lives — not simulated";
    document.getElementById("phi-box").className = "eqbox " + (Math.abs(cur.z) < 0.08 ? "ok" : "");
  }
  ["tau", "price", "omega"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initClearing);
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
