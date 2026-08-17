function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "—";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}

function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}

var YGRID = [];
(function () {
  var i;
  for (i = 0; i <= 10; i++) YGRID.push(i);
})();

function cost(y) {
  return 0.12 * y * y;
}

function meanVar(weights, xs) {
  var i, Z = 0, m = 0, m2 = 0;
  for (i = 0; i < weights.length; i++) Z += weights[i];
  for (i = 0; i < weights.length; i++) {
    var r = weights[i] / Z;
    m += r * xs[i];
    m2 += r * xs[i] * xs[i];
  }
  return { mean: m, v: Math.max(0, m2 - m * m) };
}

function logsumexpWeights(scores) {
  var i, maxl = -Infinity, w = [];
  for (i = 0; i < scores.length; i++) if (scores[i] > maxl) maxl = scores[i];
  for (i = 0; i < scores.length; i++) w[i] = Math.exp(scores[i] - maxl);
  return w;
}

function supplyAt(p, tau) {
  var i, scores = [];
  for (i = 0; i < YGRID.length; i++) {
    scores[i] = (p * YGRID[i] - cost(YGRID[i])) / tau;
  }
  return meanVar(logsumexpWeights(scores), YGRID);
}

function demandAt(p, tau) {
  var i, scores = [];
  for (i = 0; i < YGRID.length; i++) {
    scores[i] = -(p * YGRID[i]) / tau;
  }
  return meanVar(logsumexpWeights(scores), YGRID);
}

function initProducer() {
  var tauEl = document.getElementById("tau");
  var pEl = document.getElementById("price");
  var plot = document.getElementById("plot");
  if (!tauEl || !plot) return;

  function draw() {
    var tau = parseFloat(tauEl.value);
    var p = parseFloat(pEl.value);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("price-val").textContent = p.toFixed(2);

    var sup = supplyAt(p, tau);
    var dem = demandAt(p, tau);
    var slopeS = sup.v / tau;
    var slopeD = -dem.v / tau;
    document.getElementById("y-stat").textContent = fmt(sup.mean);
    document.getElementById("x-stat").textContent = fmt(dem.mean);
    document.getElementById("ss-stat").textContent = fmt(slopeS);
    document.getElementById("sd-stat").textContent = fmt(slopeD);

    document.getElementById("sup-eq").innerHTML =
      "y* = " + fmt(sup.mean) + "<br>∂y*/∂p = +Var(y)/τ = " + fmt(slopeS) + "<br>Var(y) = " + fmt(sup.v);
    document.getElementById("dem-eq").innerHTML =
      "x* = " + fmt(dem.mean) + "<br>∂x*/∂p = −Var(x)/τ = " + fmt(slopeD) + "<br>Var(x) = " + fmt(dem.v);

    var pMin = 0.05, pMax = 1.60, qMax = 10;
    var n = 90, i, u, sPts = [], dPts = [], crossP = null, crossQ = null, best = 1e9;
    for (i = 0; i <= n; i++) {
      u = pMin + (i / n) * (pMax - pMin);
      var s = supplyAt(u, tau);
      var d = demandAt(u, tau);
      sPts.push([u, s.mean]);
      dPts.push([u, d.mean]);
      var gap = Math.abs(s.mean - d.mean);
      if (gap < best) { best = gap; crossP = u; crossQ = 0.5 * (s.mean + d.mean); }
    }

    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    function X(u) { return L + ((u - pMin) / (pMax - pMin)) * iw; }
    function Y(v) { return top + (1 - v / qMax) * ih; }
    var ticks = "", k, tv, tu;
    for (k = 0; k <= 5; k++) {
      tv = (k / 5) * qMax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(0) + "</text>";
    }
    for (k = 0; k <= 4; k++) {
      tu = pMin + (k / 4) * (pMax - pMin);
      ticks += "<text x=\"" + X(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(2) + "</text>";
    }
    var sLine = sPts.map(function (pt) { return [X(pt[0]), Y(pt[1])]; });
    var dLine = dPts.map(function (pt) { return [X(pt[0]), Y(pt[1])]; });
    var marks = "<line x1=\"" + X(p) + "\" y1=\"" + top + "\" x2=\"" + X(p) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    marks += "<circle cx=\"" + X(p) + "\" cy=\"" + Y(sup.mean) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + X(p) + "\" cy=\"" + Y(dem.mean) + "\" r=\"4\" fill=\"#8f2d1c\" />";
    if (crossP != null) {
      marks += "<circle cx=\"" + X(crossP) + "\" cy=\"" + Y(crossQ) + "\" r=\"7\" fill=\"none\" stroke=\"#0d5c3d\" />";
    }
    plot.innerHTML = ticks + polyline(sLine, "#1b1814") + polyline(dLine, "#8f2d1c", "6 5") + marks;
    document.getElementById("cross-eq").innerHTML =
      "crossing (illustrative support) near p = " + fmt(crossP) + ", q = " + fmt(crossQ);
  }

  ["tau", "price"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}

document.addEventListener("DOMContentLoaded", initProducer);

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
