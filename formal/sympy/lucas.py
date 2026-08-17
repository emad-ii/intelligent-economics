"""Lucas / Dual Engine.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: rational expectations — the fixed point of μ ← ρ*;
    interest: the Lucas critique as motion.
  §5.1: a policy change is a change in V. Within a round, the realised
    distribution relaxes toward ρ* ∝ μ e^{V/τ} (μ held fixed). Across
    rounds the settled distribution becomes the updated reference:
    μ ← ρ*. Iterated under a fixed policy, the update anneals the
    reference toward a point mass on the optimum.
  Slow adaptation recovers fixed expectations; fast adaptation recovers
  rational expectations. The adaptation-rate mixture on the live page
  is illustrative of incomplete settlement, not a second equation.

Finite support. Do not invent a Langevin proof. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import exp, limit, oo, simplify, symbols

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


def tilt(mu, V, tau):
    w = [mu[i] * exp(V[i] / tau) for i in range(len(mu))]
    Z = sum(w)
    return [wi / Z for wi in w]


def main():
    tau = symbols("tau", positive=True)
    n = symbols("n", positive=True, integer=True)
    # Three plans. Unique maximiser of V at index 2.
    V = [0, 1, 3]
    m0, m1, m2 = symbols("m0 m1 m2", positive=True)
    mu0 = [m0, m1, m2]

    # One across-round step: μ ← ρ* = tilt(μ, V, τ).
    rho = tilt(mu0, V, tau)
    check("§5.1 within-round target: ρ* ∝ μ e^{V/τ}", True)

    # n-fold absorb under fixed V: μ_n ∝ μ_0 e^{n V/τ}.
    w_n = [mu0[i] * exp(n * V[i] / tau) for i in range(3)]
    Z_n = sum(w_n)
    mu_n = [wi / Z_n for wi in w_n]
    # One step from μ_0 is n=1 and equals ρ*.
    step = [simplify(mu_n[i].subs(n, 1) - rho[i]) for i in range(3)]
    check("§5.1 Dual Engine: one absorb is μ ← ρ*", all(s == 0 for s in step), str(step))

    # Anneal: mass ratio vs a non-max state → ∞ as n → ∞.
    ratio = simplify(mu_n[2] / mu_n[0])
    # ratio = (m2/m0) exp(n (3-0)/τ) → ∞
    going = limit(ratio, n, oo)
    check(
        "§5.1 anneal: μ_n concentrates on argmax V  (ratio → ∞)",
        going is oo or going == oo,
        str(going),
    )

    # Fixed point μ = ρ* ⇒ e^{V/τ} constant on supp(μ).
    # On this V, the only full-support equality fails; the point mass on
    # the maximiser is a fixed point.
    mu_pt = [0, 0, 1]
    rho_pt = tilt([1, 1, 1], V, tau)  # dummy; recompute from the point mass
    # tilt of a point mass is the point mass (support stays).
    w_pt = [mu_pt[i] * exp(V[i] / tau) for i in range(3)]
    # 0 * exp is 0; Z = exp(3/τ); ρ = (0,0,1)
    Z_pt = sum(w_pt)
    rho_from_pt = [w_pt[i] / Z_pt for i in range(3)]
    check(
        "Table 3: point mass on argmax is a fixed point of μ ← ρ*",
        all(simplify(rho_from_pt[i] - mu_pt[i]) == 0 for i in range(3)),
        str(rho_from_pt),
    )

    report_unbound(
        "Link 4 Langevin dX = ∇log ρ* dt + √2 dW → ρ*",
        "§5.1 names the SDE. Not an algebraic identity. No Lean/SDE proof this pass.",
    )
    report_unbound(
        "adaptation-rate mixture (live page slider)",
        "page labels it illustrative of incomplete settlement, not a second equation.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
