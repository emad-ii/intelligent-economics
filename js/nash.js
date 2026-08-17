function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
function tilt2(EU, mu, tau) {
  var i, logs = [], maxl = -Infinity, Z = 0, rho = [];
  for (i = 0; i < 2; i++) {
    logs[i] = Math.log(mu[i]) + EU[i] / tau;
    if (logs[i] > maxl) maxl = logs[i];
  }
  for (i = 0; i < 2; i++) { rho[i] = Math.exp(logs[i] - maxl); Z += rho[i]; }
  for (i = 0; i < 2; i++) rho[i] /= Z;
  return rho;
}
function coupled(tau, muL) {
  var mu = [muL, 1 - muL], p = [0.5, 0.5], k, row, col;
  for (k = 0; k < 80; k++) {
    row = tilt2([2 * p[0], 1 * p[1]], mu, tau);
    col = tilt2([2 * row[0], 1 * row[1]], mu, tau);
    p = col;
  }
  return { rho: row, EU: [2 * p[0], 1 * p[1]] };
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function initNash() {
  var tauEl = document.getElementById("tau");
  var muEl = document.getElementById("mu");
  var plot = document.getElementById("plot");
  if (!tauEl || !plot) return;
  function draw() {
    var tau = parseFloat(tauEl.value);
    var muL = parseFloat(muEl.value);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("mu-val").textContent = muL.toFixed(2);
    var cur = coupled(tau, muL);
    document.getElementById("rho-stat").textContent = fmt(cur.rho[0]);
    document.getElementById("eul-stat").textContent = fmt(cur.EU[0]);
    document.getElementById("eur-stat").textContent = fmt(cur.EU[1]);
    var near = cur.rho[0] > 0.5 ? "(L,L)" : (cur.rho[0] < 0.25 ? "(R,R)" : "mixed");
    document.getElementById("nash-stat").textContent = near;
    var tMin = 0.06, tMax = 2.40, n = 70, i, t, pts = [];
    for (i = 0; i <= n; i++) {
      t = tMin + (i / n) * (tMax - tMin);
      pts.push([t, coupled(t, muL).rho[0]]);
    }
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    function X(u) { return L + ((u - tMin) / (tMax - tMin)) * iw; }
    function Y(v) { return top + (1 - v) * ih; }
    var ticks = "", k, tv, tu;
    for (k = 0; k <= 5; k++) {
      tv = k / 5;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (k = 0; k <= 4; k++) {
      tu = tMin + (k / 4) * (tMax - tMin);
      ticks += "<text x=\"" + X(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(2) + "</text>";
    }
    var line = pts.map(function (pt) { return [X(pt[0]), Y(pt[1])]; });
    var marks = "<line x1=\"" + X(tau) + "\" y1=\"" + top + "\" x2=\"" + X(tau) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    marks += "<circle cx=\"" + X(tau) + "\" cy=\"" + Y(cur.rho[0]) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + X(tMin) + "\" cy=\"" + Y(1) + "\" r=\"7\" fill=\"none\" stroke=\"#0d5c3d\" />";
    marks += "<circle cx=\"" + X(tMin) + "\" cy=\"" + Y(0) + "\" r=\"7\" fill=\"none\" stroke=\"#8f2d1c\" />";
    plot.innerHTML = ticks + polyline(line, "#1b1814") + marks;
    document.getElementById("qre-eq").innerHTML =
      "rho(L) = " + fmt(cur.rho[0]) + ", rho(R) = " + fmt(cur.rho[1]) + "<br>" +
      "EU(L) = 2 q(L) = " + fmt(cur.EU[0]) + "<br>" +
      "EU(R) = 1 q(R) = " + fmt(cur.EU[1]);
    document.getElementById("limit-eq").innerHTML =
      "as tau -> 0 the softmax sharpens to best response<br>this path is approaching " + near;
    document.getElementById("sel-eq").innerHTML =
      "mu(L) = " + fmt(muL) + " selects among Nash profiles of the mu-supported game<br>" +
      (muL > 0.55 ? "reference leans L, cooling favors (L,L)" : (muL < 0.45 ? "reference leans R, cooling can favor (R,R)" : "flat mu: payoff-dominant (L,L) on the cooling path"));
    document.getElementById("sel-box").className = "eqbox " + (Math.abs(muL - 0.5) < 0.02 ? "" : "ok");
  }
  ["tau", "mu"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}
document.addEventListener("DOMContentLoaded", initNash);
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
