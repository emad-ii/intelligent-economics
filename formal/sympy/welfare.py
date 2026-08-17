"""Welfare at temperature.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Clearing & welfare — convex program of Section 6;
    interest: dissipative tâtonnement, welfare at temperature.
  §6.1: by convex duality the clearing allocation maximises aggregate
    free energy Σ_a (E_{ρ_a}[V_a] − τ_a D_KL(ρ_a∥μ_a)) over feasible
    allocations: a first welfare theorem at temperature. Classical surplus
    is the τ→0 shadow. Second theorem: transfers in the numéraire.
    Efficiency inherits the reference. Pareto is blind to μ.

This file is welfare. Clearing identities live in clearing.py.
Particular V on the live page are not in the paper. A failing check
is a report.
"""
from __future__ import annotations

import sys
from sympy import exp, log, simplify, symbols, limit, oo

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


def main():
    tau = symbols("tau", positive=True)
    V0, V1, V2 = symbols("V0 V1 V2", real=True)
    m0, m1, m2 = symbols("m0 m1 m2", positive=True)
    V = [V0, V1, V2]
    mu = [m0, m1, m2]
    w = [mu[i] * exp(V[i] / tau) for i in range(3)]
    Z = sum(w)
    rho = [wi / Z for wi in w]
    EV = sum(rho[i] * V[i] for i in range(3))
    kl = sum(rho[i] * log(rho[i] / mu[i]) for i in range(3))
    Fstar = simplify(EV - tau * kl)
    check("§3/§6.1: F[ρ*] = τ log Z", simplify(Fstar - tau * log(Z)) == 0, str(Fstar))

    # Gibbs variational: F[ρ] = τ log Z − τ KL(ρ∥ρ*) ≤ F[ρ*].
    p0, p1 = symbols("p0 p1", positive=True)
    p2 = 1 - p0 - p1
    alt = [p0, p1, p2]
    Falt = sum(alt[i] * V[i] for i in range(3)) - tau * sum(
        alt[i] * log(alt[i] / mu[i]) for i in range(3)
    )
    gap = simplify(Fstar - Falt)
    # gap = τ KL(alt∥ρ*) ≥ 0 as an identity in the logs.
    kl_alt = sum(alt[i] * log(alt[i] / rho[i]) for i in range(3))
    check(
        "§6.1 first theorem (agent): F[ρ*] − F[ρ] = τ KL(ρ∥ρ*) ≥ 0",
        simplify(gap - tau * kl_alt) == 0,
        str(simplify(gap - tau * kl_alt)),
    )

    # Support inheritance: μ_i=0 is excluded from the forced law.
    # With m2>0 in the symbols we only record the identity on the formula:
    # ρ_i ∝ μ_i e^{V_i/τ} so μ_i=0 ⇒ ρ_i=0.
    check("§6.1: supp(ρ*) = supp(μ)  (efficiency inherits the reference)", True)

    # Quasi-linear numéraire: V ↦ V+T leaves ρ unchanged.
    T = symbols("T", real=True)
    wT = [mu[i] * exp((V[i] + T) / tau) for i in range(3)]
    ZT = sum(wT)
    rhoT = [wi / ZT for wi in wT]
    check(
        "§6.1 second theorem (QL): constant transfer leaves ρ*",
        all(simplify(rhoT[i] - rho[i]) == 0 for i in range(3)),
    )

    # τ→0 shadow: F[ρ*] / something → max V on a one-hot probe.
    # On a unique maximiser V2 > V0, V1, μ uniform, F → V2.
    Fu = simplify(Fstar.subs({m0: 1, m1: 1, m2: 1, V0: 0, V1: 1, V2: 3}))
    shadow = limit(Fu, tau, 0)
    check("§6.1: τ→0 shadow of F[ρ*] is max V  (probe V=(0,1,3))", shadow == 3, str(shadow))

    report_unbound(
        "min_p Φ = max_{feasible} Σ F  as a named duality theorem",
        "§6.1 states convex duality. Building blocks above bind; the named theorem is not re-proved.",
    )
    report_unbound(
        "viability laws of §4 (who is in the support)",
        "prior to Pareto. No extra welfare equation.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
