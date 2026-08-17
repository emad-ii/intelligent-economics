function fmt(x, n) {
  n = n == null ? 3 : n;
  if (!isFinite(x)) return "—";
  return (Math.abs(x) < 1e-12 ? 0 : x).toFixed(n);
}

var LABELS = ["A", "B", "C", "D", "E"];
var V = [3.0, 2.4, 3.6, 1.2, 2.1];
var MU_FLAT = [0.2, 0.2, 0.2, 0.2, 0.2];
var MU_DOXA = [0.35, 0.30, 0.05, 0.20, 0.10];

function softmax(tau, mu) {
  var i, l, maxl = -Infinity, logs = [];
  for (i = 0; i < V.length; i++) {
    l = Math.log(mu[i]) + V[i] / tau;
    logs.push(l);
    if (l > maxl) maxl = l;
  }
  var Z = 0, w = [], rho = [];
  for (i = 0; i < logs.length; i++) {
    w[i] = Math.exp(logs[i] - maxl);
    Z += w[i];
  }
  var EV = 0, kl = 0;
  for (i = 0; i < logs.length; i++) {
    rho[i] = w[i] / Z;
    EV += rho[i] * V[i];
    kl += rho[i] * (Math.log(rho[i]) - Math.log(mu[i]));
  }
  return { rho: rho, EV: EV, kl: kl, C: tau * kl };
}

function barrow(label, frac, klass, text) {
  var w = Math.max(0, Math.min(100, 100 * frac));
  return "<div class=\"barrow\"><span>" + label + "</span><div class=\"bartrack\"><div class=\"barfill " + klass + "\" style=\"width:" + w.toFixed(1) + "%\"></div></div><span class=\"nums\">" + text + "</span></div>";
}

function initLogit() {
  var tauEl = document.getElementById("tau");
  var flatEl = document.getElementById("flat");
  if (!tauEl) return;

  function draw() {
    var tau = parseFloat(tauEl.value);
    var flat = flatEl.checked;
    var mu = flat ? MU_FLAT : MU_DOXA;
    document.getElementById("tau-val").textContent = tau.toFixed(2);
    document.getElementById("mu-state").textContent = flat ? "uniform μ (the logit recovery)" : "restored μ (doxic term live)";

    var out = softmax(tau, mu);
    var i, html = "";
    for (i = 0; i < LABELS.length; i++) {
      html += barrow(LABELS[i], out.rho[i], "rho", "ρ=" + fmt(out.rho[i], 3));
    }
    document.getElementById("rho-bars").innerHTML = html;
    html = "";
    for (i = 0; i < LABELS.length; i++) {
      html += barrow(LABELS[i], mu[i], "mu", "μ=" + fmt(mu[i], 2));
    }
    document.getElementById("mu-bars").innerHTML = html;

    document.getElementById("ev-stat").textContent = fmt(out.EV);
    document.getElementById("kl-stat").textContent = fmt(out.kl);
    document.getElementById("c-stat").textContent = fmt(out.C);

    var iC = 2, iA = 0;
    var logOdds = Math.log(out.rho[iC] / out.rho[iA]);
    var valueTerm = (V[iC] - V[iA]) / tau;
    var doxicTerm = Math.log(mu[iC] / mu[iA]);
    var box = document.getElementById("odds-box");
    box.className = "eqbox " + (Math.abs(doxicTerm) < 1e-12 ? "ok" : "bad");
    document.getElementById("odds-eq").innerHTML =
      "log(ρ_C / ρ_A) = " + fmt(logOdds) + "<br>" +
      "(V_C − V_A)/τ = " + fmt(valueTerm) + "<br>" +
      "log(μ_C / μ_A) = " + fmt(doxicTerm) + "<br>" +
      "sum of terms = " + fmt(valueTerm + doxicTerm);
  }

  tauEl.addEventListener("input", draw);
  flatEl.addEventListener("change", draw);
  draw();
}

document.addEventListener("DOMContentLoaded", initLogit);

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
