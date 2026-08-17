function expW(d,t){return Math.exp(-d*t);}
function altW(d,t){return 1/(1+d*t);}
function fmt(x){return (Math.abs(x)<1e-12?0:x).toFixed(4);}

function polyline(points, color, dash) {
  var d = points.map(function (pt, i) {
    return (i ? "L" : "M") + pt[0].toFixed(2) + " " + pt[1].toFixed(2);
  }).join(" ");
  var extra = dash ? " stroke-dasharray=\"" + dash + "\"" : "";
  return "<path d=\"" + d + "\" fill=\"none\" stroke=\"" + color + "\" stroke-width=\"2.2\"" + extra + " />";
}

function syncSplitBounds(horizonEl, splitEl) {
  var T = parseFloat(horizonEl.value);
  var t = parseFloat(splitEl.value);
  splitEl.max = (T - 0.2).toFixed(1);
  if (t > T - 0.2) splitEl.value = (T - 0.2).toFixed(1);
  if (t < 0.2) splitEl.value = "0.2";
}

function initDiscounting() {
  var deltaEl = document.getElementById("delta");
  var horizonEl = document.getElementById("horizon");
  var splitEl = document.getElementById("split");
  var plot = document.getElementById("plot");
  if (!deltaEl || !plot) return;

  function draw() {
    syncSplitBounds(horizonEl, splitEl);
    var delta = parseFloat(deltaEl.value);
    var T = parseFloat(horizonEl.value);
    var t = parseFloat(splitEl.value);
    var s = T - t;
    document.getElementById("delta-val").textContent = delta.toFixed(2);
    document.getElementById("horizon-val").textContent = T.toFixed(1);
    document.getElementById("split-val").textContent = "t=" + t.toFixed(1) + ", s=" + s.toFixed(1);

    var W = 640, H = 280, L = 48, R = 18, top = 16, bot = 36;
    var iw = W - L - R, ih = H - top - bot;
    function x(u) { return L + (u / T) * iw; }
    function y(v) { return top + (1 - v) * ih; }
    var n = 120, expPts = [], altPts = [];
    for (var i = 0; i <= n; i++) {
      var u = (i / n) * T;
      expPts.push([x(u), y(expW(delta, u))]);
      altPts.push([x(u), y(altW(delta, u))]);
    }
    var ticks = "";
    var k, tv, tu;
    for (k = 0; k <= 4; k++) {
      tv = k / 4;
      ticks += "<line x1=\"" + L + "\" y1=\"" + y(tv) + "\" x2=\"" + (W - R) + "\" y2=\"" + y(tv) + "\" stroke=\"#e4dccb\" />";
      ticks += "<text x=\"" + (L - 8) + "\" y=\"" + (y(tv) + 4) + "\" text-anchor=\"end\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tv.toFixed(2) + "</text>";
    }
    for (k = 0; k <= 4; k++) {
      tu = (k / 4) * T;
      ticks += "<text x=\"" + x(tu) + "\" y=\"" + (H - 12) + "\" text-anchor=\"middle\" font-size=\"11\" fill=\"#5e574d\" font-family=\"IBM Plex Mono, monospace\">" + tu.toFixed(1) + "</text>";
    }

    var marks = "";
    function mark(u) {
      marks += "<line x1=\"" + x(u) + "\" y1=\"" + top + "\" x2=\"" + x(u) + "\" y2=\"" + (H - bot) + "\" stroke=\"#1b1814\" stroke-dasharray=\"2 3\" stroke-opacity=\".45\" />";
    }
    mark(t);
    mark(T);
    var we = expW(delta, t), ws = expW(delta, s), wsum = expW(delta, t + s);
    var ae = altW(delta, t), asv = altW(delta, s), asum = altW(delta, t + s);
    marks += "<circle cx=\"" + x(t + s) + "\" cy=\"" + y(wsum) + "\" r=\"4\" fill=\"#1b1814\" />";
    marks += "<circle cx=\"" + x(t + s) + "\" cy=\"" + y(we * ws) + "\" r=\"7\" fill=\"none\" stroke=\"#1b1814\" />";
    marks += "<circle cx=\"" + x(t + s) + "\" cy=\"" + y(asum) + "\" r=\"4\" fill=\"#8f2d1c\" />";
    marks += "<circle cx=\"" + x(t + s) + "\" cy=\"" + y(ae * asv) + "\" r=\"7\" fill=\"none\" stroke=\"#8f2d1c\" />";
    plot.innerHTML = ticks + polyline(expPts, "#1b1814") + polyline(altPts, "#8f2d1c", "6 5") + marks;
    document.getElementById("exp-eq").innerHTML = "w(t+s) = " + fmt(wsum) + "<br>w(t) w(s) = " + fmt(we * ws) + "<br>|residual| = " + fmt(Math.abs(wsum - we * ws));
    document.getElementById("alt-eq").innerHTML = "w(t+s) = " + fmt(asum) + "<br>w(t) w(s) = " + fmt(ae * asv) + "<br>|residual| = " + fmt(Math.abs(asum - ae * asv));
  }
  ["delta", "horizon", "split"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", draw);
  });
  draw();
}

document.addEventListener("DOMContentLoaded", initDiscounting);

function renderKatex() {
  if (!window.renderMathInElement) return;
  window.renderMathInElement(document.body, {
    delimiters: [
      {left: "$$", right: "$$", display: true},
      {left: "$", right: "$", display: false}
    ]
  });
}
window.addEventListener("load", renderKatex);
