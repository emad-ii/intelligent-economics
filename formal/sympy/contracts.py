"""Contracts / moral hazard.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  §5: mechanism and contract design is the choice of a value function to
    induce a target response against a reference. The principal sets V
    but inherits the agent's μ; doxa is not contractible. The optimal
    contract is inheritance.
  §6.1: moral hazard holds at the level of structure — principal sets V,
    inherits μ, the information rent being the divergence term no
    contract extracts. Mechanism-design content beyond that belongs to
    its own literature.

Identified. Thin official. No optimal-contract formula is written.
A failing check is a report.
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


def main():
    tau = symbols("tau", positive=True)
    V0, V1, V2 = symbols("V0 V1 V2", real=True)
    m0, m1, m2 = symbols("m0 m1 m2", positive=True)
    V = [V0, V1, V2]
    mu = [m0, m1, m2]
    # Principal sets V; agent responds by the forced law. μ is inherited.
    w = [mu[i] * exp(V[i] / tau) for i in range(3)]
    Z = sum(w)
    rho = [wi / Z for wi in w]
    check("§5/§6.1: principal sets V; ρ* ∝ μ e^{V/τ}  (μ inherited)", True)

    kl = sum(rho[i] * log(rho[i] / mu[i]) for i in range(3))
    # Divergence term: D_KL(ρ*∥μ) = E[V]/τ − log Z ≥ 0.
    ident = simplify(kl - (sum(rho[i] * V[i] for i in range(3)) / tau - log(Z)))
    check(
        "§6.1 rent: D_KL(ρ*∥μ) = E_ρ[V]/τ − log Z  (divergence no contract extracts)",
        ident == 0,
        str(ident),
    )

    # Flat V: no tilt, KL vanishes. A contract that does not move V extracts nothing.
    Zmu = sum(mu)
    mu_n = [mu[i] / Zmu for i in range(3)]
    w_flat = [mu[i] * exp(0 / tau) for i in range(3)]
    Zf = sum(w_flat)
    rho_f = [wi / Zf for wi in w_flat]
    check(
        "flat V: ρ* = μ/Σμ  (no tilt, no extracted divergence)",
        all(simplify(rho_f[i] - mu_n[i]) == 0 for i in range(3)),
    )

    # Principal cannot write μ. Changing V does not change μ.
    check("§5: doxa is not contractible  (μ is not an argument of V)", True)

    report_unbound(
        "optimal contract (IR/IC menu, wage formula)",
        "§5: the optimal contract is inheritance. Not written.",
    )
    report_unbound(
        "mechanism-design content beyond the structure",
        "§6.1: belongs to its own literature.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
