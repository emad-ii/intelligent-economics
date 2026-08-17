function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "-";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}
var TAU = 1;
var DIN = 0.05;
function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}
function depthLabel(delta) {
  if (delta <= 0.25) return "near-shared";
  if (delta >= 1.6) return "strangers";
  if (delta <= 0.7) return "shared-doxa, thin gap";
  return "gap widening";
}
function initCoase() {
  var dEl = document.getElementById("delta");
  var mEl = document.getElementById("maint");
  var nEl = document.getElementById("load");
  var fleetEl = document.getElementById("fleet");
  var plot = document.getElementById("plot");
  if (!dEl || !plot) return;
  function draw() {
    if (fleetEl.checked) {
      dEl.value = "0.10";
      mEl.value = "10";
    }
    var fleet = fleetEl.checked;
    var delta = parseFloat(dEl.value);
    var M = parseFloat(mEl.value);
    var din = fleet ? 0.002 : DIN;
    var N = parseFloat(nEl.value);
    document.getElementById("delta-val").textContent = delta.toFixed(2) + " nats · " + depthLabel(delta);
    document.getElementById("m-val").textContent = M.toFixed(0) + " vu/mo";
    document.getElementById("n-val").textContent = N.toFixed(0) + "/mo";
    var mkt = N * TAU * delta;
    var firm = M + N * TAU * din;
    var pole = mkt < firm ? "market" : (Math.abs(mkt - firm) < 1e-6 ? "indifferent" : "firm");
    document.getElementById("mkt-stat").textContent = fmt(mkt, 1);
    document.getElementById("firm-stat").textContent = fmt(firm, 1);
    document.getElementById("pole-stat").textContent = pole;
    document.getElementById("depth-stat").textContent = depthLabel(delta);
    var nMin = 0, nMax = 500, cMax = 0, i, u;
    var mPts = [], fPts = [];
    for (i = 0; i <= 80; i++) {
      u = nMin + (i / 80) * (nMax - nMin);
      var mv = u * TAU * delta;
      var fv = M + u * TAU * din;
      mPts.push([u, mv]);
      fPts.push([u, fv]);
      if (mv > cMax) cMax = mv;
      if (fv > cMax) cMax = fv;
    }
    cMax = Math.max(cMax, 40);
    var crossN = (delta > din) ? M / (TAU * (delta - din)) : Infinity;
    var crossC = isFinite(crossN) ? crossN * TAU * delta : NaN;
    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    function X(u) { return L + ((u - nMin) / (nMax - nMin)) * iw; }
    function Y(v) { return top + (1 - v / cMax) * ih; }
    var ticks = "", k, tv, tu;
    for (k = 0; k <= 4; k++) {
      tv = (k / 4) * cMax;
      ticks += "<line x1=\"" + L + "\" y1=\"" + Y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + Y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (Y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(0) + "</text>";
    }
    for (k = 0; k <= 5; k++) {
      tu = nMin + (k / 5) * (nMax - nMin);
      ticks += "<text x=\"" + X(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(0) + "</text>";
    }
    var mLine = mPts.map(function (pt) { return [X(pt[0]), Y(pt[1])]; });
    var fLine = fPts.map(function (pt) { return [X(pt[0]), Y(pt[1])]; });
    var marks = "<line x1=\"" + X(N) + "\" y1=\"" + top + "\" x2=\"" + X(N) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    marks += "<circle cx=\"" + X(N) + "\" cy=\"" + Y(mkt) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + X(N) + "\" cy=\"" + Y(firm) + "\" r=\"4\" fill=\"#8f2d1c\" />";
    if (isFinite(crossN) && crossN >= nMin && crossN <= nMax) {
      marks += "<circle cx=\"" + X(crossN) + "\" cy=\"" + Y(crossC) + "\" r=\"7\" fill=\"none\" stroke=\"#0d5c3d\" />";
    }
    plot.innerHTML = ticks + polyline(mLine, "#1b1814") + polyline(fLine, "#8f2d1c", "6 5") + marks;
    document.getElementById("mkt-eq").innerHTML =
      "per-transaction tilt across the gap<br>N * tau * Delta = " + fmt(N, 0) + " * " + fmt(TAU, 0) + " * " + fmt(delta, 2) + " = " + fmt(mkt, 1);
    document.getElementById("firm-eq").innerHTML =
      "maintain mu_firm, then cheap internal tilts<br>M + N * tau * Delta_in = " + fmt(M, 0) + " + " + fmt(N, 0) + " * " + fmt(din, 3) + " = " + fmt(firm, 1);
    document.getElementById("mkt-box").className = "eqbox " + (pole === "market" ? "ok" : "");
    document.getElementById("firm-box").className = "eqbox " + (pole === "firm" ? "ok" : "");
    var crossTxt = isFinite(crossN) ? ("illustrative crossing near N = " + fmt(crossN, 0)) : "no crossing: the gap is not larger than Delta_in";
    document.getElementById("ai-eq").innerHTML = fleet
      ? "weight-copying: M -> 0 and Delta_in -> 0, so both poles collapse at once. The free shared reference is a monoculture; the resilience law prices the winning design."
      : crossTxt + ". Not a theorem — the paper's object is the depth of shared doxa, not this arithmetic.";
    document.getElementById("ai-box").className = "eqbox " + (fleet ? "bad" : "");
  }
  ["delta", "maint", "load"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      if (fleetEl.checked) fleetEl.checked = false;
      draw();
    });
  });
  fleetEl.addEventListener("change", draw);
  draw();
}
document.addEventListener("DOMContentLoaded", initCoase);
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
