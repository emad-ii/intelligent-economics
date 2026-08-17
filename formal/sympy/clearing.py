"""GE / clearing.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Clearing & welfare — the convex program of Section 6;
    interest: dissipative tâtonnement, welfare at temperature.
  §6.1: couple agents through Σ_i E_{ρ_i}[x_i] = ω. Each optimal law is
    ρ*_i(x) ∝ μ_i(x) exp((V_i(x) − p·x)/τ_i), the price tilt of the
    demand recovery. Φ(p) = Σ_a τ_a log Z_a(p) + p·ω. Aggregate excess
    demand is −∇Φ. Φ is convex because every log Z is. Producers enter
    through e^{(p·y − c(y))/τ}. Quasi-linear scope, same as Slutsky.
    Income effects not claimed. SMD lives where those are restored.

This file is clearing only. Welfare is a later tag. Particular u and c
on the live page are not in the paper. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import exp, log, simplify, symbols

PASS, FAIL, UNBOUND = [], [], []


def check(name, cond, detail=""):
    if cond:
        PASS.append(name)
        print(f"GREEN  {name}")
    else:
        FAIL.append(name)
        print(f"FAIL   {name}" + (f"  {detail}" if detail else ""))


def report_unbound(name, why):
    UNBOUND.append(name)
    print(f"UNBOUND  {name}  {why}")


def ensemble(xs, scores):
    w = [exp(s) for s in scores]
    Z = sum(w)
    rho = [wi / Z for wi in w]
    mean = sum(rho[k] * xs[k] for k in range(len(xs)))
    var = sum(rho[k] * (xs[k] - mean) ** 2 for k in range(len(xs)))
    return rho, mean, var, Z


def main():
    tau = symbols("tau", positive=True)
    p, omega = symbols("p omega", real=True)
    xs = [0, 1, 2]
    V0, V1, V2 = symbols("V0 V1 V2", real=True)
    c0, c1, c2 = symbols("c0 c1 c2", real=True)
    V = [V0, V1, V2]
    c = [c0, c1, c2]

    # Consumer: §6.1 price tilt exp((V − p x)/τ). Uniform μ.
    scores_d = [(V[k] - p * xs[k]) / tau for k in range(3)]
    _, xstar, varx, Zd = ensemble(xs, scores_d)

    # Producer: e^{(p y − c(y))/τ}.
    scores_s = [(p * xs[k] - c[k]) / tau for k in range(3)]
    _, ystar, vary, Zs = ensemble(xs, scores_s)

    Phi = tau * log(Zd) + tau * log(Zs) + p * omega
    z = xstar - ystar - omega
    envelope = simplify(z + Phi.diff(p))
    check("§6.1: z(p) = −Φ'(p)  with z = x* − y* − ω", envelope == 0, str(envelope))

    hess = simplify(Phi.diff(p, 2) - (varx + vary) / tau)
    check("§6.1: Φ'' = (Var(x)+Var(y))/τ  (convex; every log Z)", hess == 0, str(hess))

    # Stationarity of Φ is clearing.
    check(
        "§6.1: Φ'=0 iff x* − y* = ω",
        simplify(Phi.diff(p) - (ystar - xstar + omega)) == 0,
        str(simplify(Phi.diff(p) - (ystar - xstar + omega))),
    )

    # Consumer law is the demand recovery with V ↦ V − p x.
    # x* = −τ ∂_p log Z_d  (μ ⊥ p, V ⊥ p).
    env_d = simplify(xstar + tau * log(Zd).diff(p))
    check("§6.1 price tilt: x* = −τ ∂_p log Z_consumer", env_d == 0, str(env_d))

    env_s = simplify(ystar - tau * log(Zs).diff(p))
    check("§6.1 producer: y* = +τ ∂_p log Z_producer", env_s == 0, str(env_s))

    report_unbound(
        "existence / coercivity on compact support, interior ω",
        "§6.1 states it. Not an algebraic identity on this pass.",
    )
    report_unbound(
        "tâtonnement ODE converges globally",
        "named as gradient flow of Φ. Not proved here.",
    )
    report_unbound(
        "τ→0 kinks / SMD under income effects",
        "paper locates those; this page does not simulate them. Quasi-linear scope.",
    )
    report_unbound(
        "particular u(x), c(y) on the live page",
        "illustrative. Φ and z=−∇Φ do not use them.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
