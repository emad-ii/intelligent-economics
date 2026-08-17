function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
function klTwo(p0, mu0) {
  var p1 = 1 - p0, q0 = mu0, q1 = 1 - mu0, s = 0;
  if (p0 > 1e-15) s += p0 * Math.log(p0 / q0);
  if (p1 > 1e-15) s += p1 * Math.log(p1 / q1);
  return s;
}
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function initLandauer() {
  var eEl = document.getElementById("erase");
  var tEl = document.getElementById("tau");
  var pEl = document.getElementById("physical");
  var plot = document.getElementById("plot");
  if (!eEl || !plot) return;
  function draw() {
    var erase = parseFloat(eEl.value);
    var tau = parseFloat(tEl.value);
    var physical = pEl.checked;
    var ln2 = Math.log(2);
    var mu0 = 0.5;
    var p0 = erase;
    var dkl = klTwo(p0, mu0);
    var C = tau * dkl;
    var floor = tau * ln2;
    document.getElementById("erase-val").textContent = erase.toFixed(2);
    document.getElementById("tau-val").textContent = tau.toFixed(2) + (physical ? " = kT" : "");
    document.getElementById("kl-stat").textContent = fmt(dkl) + " nats";
    document.getElementById("ln2-stat").textContent = fmt(ln2);
    document.getElementById("c-stat").textContent = fmt(C);
    document.getElementById("floor-stat").textContent = physical ? ("kT ln 2 = " + fmt(floor)) : ("tau ln 2 = " + fmt(floor));
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    var ymax = 1;
    function X(i) { return L + ((i + 0.5) / 2) * iw; }
    function Y(v) { return top + (1 - v / ymax) * ih; }
    var ticks = "", k, tv;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * ymax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    ticks += "<text x=\"" + X(0) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">state 0</text>";
    ticks += "<text x=\"" + X(1) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">state 1</text>";
    var rho = [p0, 1 - p0], mu = [0.5, 0.5], bars = "", bw = iw / 2 * 0.32, i;
    for (i = 0; i < 2; i++) {
      var x = X(i) - bw / 2;
      var y = Y(rho[i]);
      bars += "<rect x=\"" + x.toFixed(2) + "\" y=\"" + y.toFixed(2) + "\" width=\"" + bw.toFixed(2) + "\" height=\"" + Math.max(0, H - bot - y).toFixed(2) + "\" fill=\"#1b1814\" fill-opacity=\"0.85\" />";
    }
    var muPts = [[X(0), Y(0.5)], [X(1), Y(0.5)]];
    plot.innerHTML = ticks + bars + polyline(muPts, "#8f2d1c", "6 5");
    var full = Math.abs(erase - 1) < 1e-6;
    document.getElementById("form-eq").innerHTML =
      "C = tau * D_KL = " + fmt(tau, 2) + " * " + fmt(dkl) + " = " + fmt(C) +
      "<br>at full erase, D_KL = ln 2 = " + fmt(ln2) + ", so C = tau ln 2 = " + fmt(floor);
    document.getElementById("form-box").className = "eqbox " + (full ? "ok" : "");
    document.getElementById("id-eq").innerHTML = physical
      ? "tau identified with k_B T. Inheritance: nonequilibrium free energy exceeds equilibrium by k_B T * KL from the Gibbs state.<br>tau ln 2 = k_B T ln 2 = " + fmt(floor)
      : "form tau ln 2 is forced. Magnitude waits on the physical identification tau = k_B T (Gibbs reference).<br>checkbox that identification to read Landauer's bound.";
    document.getElementById("id-box").className = "eqbox " + (physical ? "ok" : "");
    document.getElementById("floor-eq").innerHTML = physical
      ? "Table 3: two states, tau = k_B T. What it returns: the physical floor of C.<br>machine c_sub falls toward k_B T ln 2; the human sits far above and is metabolically pinned."
      : "Table 3 returns the physical floor of C once the identification is on.<br>both floors are this same complexity cost.";
    document.getElementById("floor-box").className = "eqbox " + (physical && full ? "ok" : "");
  }
  ["erase", "tau"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  pEl.addEventListener("change", draw);
  draw();
}
document.addEventListener("DOMContentLoaded", initLandauer);
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
