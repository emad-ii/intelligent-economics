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

var BUNDLES = [];
(function () {
  var n = 4, i, j;
  for (i = 0; i <= n; i++) {
    for (j = 0; j <= n; j++) BUNDLES.push([i, j]);
  }
})();

var PBAR1 = 0.80;

function demandAt(p1, p2, tau, alpha) {
  var k, x, V, lmu, l, maxl = -Infinity, logs = [];
  for (k = 0; k < BUNDLES.length; k++) {
    x = BUNDLES[k];
    V = -(p1 * x[0] + p2 * x[1]);
    lmu = -alpha * x[1] * (p1 - PBAR1);
    l = lmu + V / tau;
    logs.push({ l: l, x: x, dlog: [-alpha * x[1], 0] });
    if (l > maxl) maxl = l;
  }
  var Z = 0, w, rho, mean = [0, 0], meanD = [0, 0];
  var weights = [];
  for (k = 0; k < logs.length; k++) {
    w = Math.exp(logs[k].l - maxl);
    weights.push(w);
    Z += w;
  }
  var exx = [[0, 0], [0, 0]], covXd = [[0, 0], [0, 0]];
  rho = [];
  for (k = 0; k < logs.length; k++) {
    rho[k] = weights[k] / Z;
    x = logs[k].x;
    mean[0] += rho[k] * x[0];
    mean[1] += rho[k] * x[1];
    meanD[0] += rho[k] * logs[k].dlog[0];
    meanD[1] += rho[k] * logs[k].dlog[1];
  }
  for (k = 0; k < logs.length; k++) {
    x = logs[k].x;
    exx[0][0] += rho[k] * x[0] * x[0];
    exx[0][1] += rho[k] * x[0] * x[1];
    exx[1][0] += rho[k] * x[1] * x[0];
    exx[1][1] += rho[k] * x[1] * x[1];
    covXd[0][0] += rho[k] * (x[0] - mean[0]) * (logs[k].dlog[0] - meanD[0]);
    covXd[0][1] += rho[k] * (x[0] - mean[0]) * (logs[k].dlog[1] - meanD[1]);
    covXd[1][0] += rho[k] * (x[1] - mean[1]) * (logs[k].dlog[0] - meanD[0]);
    covXd[1][1] += rho[k] * (x[1] - mean[1]) * (logs[k].dlog[1] - meanD[1]);
  }
  var cov = [
    [exx[0][0] - mean[0] * mean[0], exx[0][1] - mean[0] * mean[1]],
    [exx[1][0] - mean[1] * mean[0], exx[1][1] - mean[1] * mean[1]]
  ];
  var S = [[0, 0], [0, 0]], i, j;
  for (i = 0; i < 2; i++) {
    for (j = 0; j < 2; j++) {
      S[i][j] = -(cov[i][j] + covXd[i][j]) / tau;
    }
  }
  return {
    mean: mean,
    cov: cov,
    covXd: covXd,
    S: S,
    logZ: maxl + Math.log(Z)
  };
}

function initDemand() {
  var tauEl = document.getElementById("tau");
  var p1El = document.getElementById("p1");
  var p2El = document.getElementById("p2");
  var alphaEl = document.getElementById("alpha");
  var plot = document.getElementById("plot");
  if (!tauEl || !plot) return;

  function draw() {
    var tau = parseFloat(tauEl.value);
    var p1 = parseFloat(p1El.value);
    var p2 = parseFloat(p2El.value);
    var alpha = parseFloat(alphaEl.value);
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("p1-val").textContent = p1.toFixed(2);
    document.getElementById("p2-val").textContent = p2.toFixed(2);
    document.getElementById("alpha-val").textContent = alpha.toFixed(2) + (alpha === 0 ? " · independent" : "");

    var cur = demandAt(p1, p2, tau, alpha);
    document.getElementById("x1-stat").textContent = fmt(cur.mean[0]);
    document.getElementById("x2-stat").textContent = fmt(cur.mean[1]);
    var asym = Math.abs(cur.S[0][1] - cur.S[1][0]);
    document.getElementById("asym-stat").textContent = fmt(asym, 4);
    document.getElementById("s00").textContent = fmt(cur.S[0][0]);
    document.getElementById("s01").textContent = fmt(cur.S[0][1]);
    document.getElementById("s10").textContent = fmt(cur.S[1][0]);
    document.getElementById("s11").textContent = fmt(cur.S[1][1]);
    var box = document.getElementById("sym-box");
    box.className = "eqbox " + (asym < 1e-8 ? "ok" : "bad");
    document.getElementById("split-eq").innerHTML =
      "−Cov/τ  = [[" + fmt( -cur.cov[0][0] / tau) + ", " + fmt(-cur.cov[0][1] / tau) + "], [" +
      fmt(-cur.cov[1][0] / tau) + ", " + fmt(-cur.cov[1][1] / tau) + "]]<br>" +
      "Cov(x, ∂_p log μ)/τ  = [[" + fmt(cur.covXd[0][0] / tau) + ", " + fmt(cur.covXd[0][1] / tau) + "], [" +
      fmt(cur.covXd[1][0] / tau) + ", " + fmt(cur.covXd[1][1] / tau) + "]]<br>" +
      "antisymmetric |S12 − S21| = " + fmt(asym, 4);

    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    var pMin = 0.20, pMax = 2.20, xMax = 4;
    function X(p) { return L + ((p - pMin) / (pMax - pMin)) * iw; }
    function Y(v) { return top + (1 - v / xMax) * ih; }
    var n = 80, d1 = [], d2 = [], i, p;
    for (i = 0; i <= n; i++) {
      p = pMin + (i / n) * (pMax - pMin);
      var r = demandAt(p, p2, tau, alpha);
      d1.push([X(p), Y(r.mean[0])]);
      d2.push([X(p), Y(r.mean[1])]);
    }
    var ticks = "", k, tv, tu;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * xMax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(0) + "</text>";
    }
    for (k = 0; k <= 4; k++) {
      tu = pMin + (k / 4) * (pMax - pMin);
      ticks += "<text x=\"" + X(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(1) + "</text>";
    }
    var marks = "<line x1=\"" + X(p1) + "\" y1=\"" + top + "\" x2=\"" + X(p1) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    marks += "<circle cx=\"" + X(p1) + "\" cy=\"" + Y(cur.mean[0]) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + X(p1) + "\" cy=\"" + Y(cur.mean[1]) + "\" r=\"4\" fill=\"#8f2d1c\" />";
    plot.innerHTML = ticks + polyline(d1, "#1b1814") + polyline(d2, "#8f2d1c", "6 5") + marks;
  }

  ["tau", "p1", "p2", "alpha"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}

document.addEventListener("DOMContentLoaded", initDemand);

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
