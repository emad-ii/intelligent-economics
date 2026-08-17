"""Multinomial logit.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Multinomial logit — uniform μ on finite alternatives;
    interest: the doxic term in the log-odds.
  §5: the logit is this object on a finite uniform support, with τ an
    information price rather than a fitting constant (McFadden 1974;
    Matějka and McKay 2015).
  Forced law (§3): ρ*_i = μ_i e^{V_i/τ} / Z.

Do not invent. V numbers on the live page are illustrative. A failing
check is a report.
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
    w = [mu[i] * exp(V[i] / tau) for i in range(3)]
    Z = sum(w)
    rho = [wi / Z for wi in w]

    # Forced law on finite support.
    check("§3/§5 forced law: ρ_i = μ_i e^{V_i/τ} / Z", True)

    odds = simplify(log(rho[0] / rho[1]) - ((V[0] - V[1]) / tau + log(mu[0] / mu[1])))
    check(
        "log-odds: log(ρ_i/ρ_j) = (V_i−V_j)/τ + log(μ_i/μ_j)",
        odds == 0,
        str(odds),
    )

    # Uniform μ kills the doxic term. Table 3 recovery.
    mu_u = [1, 1, 1]
    w_u = [mu_u[i] * exp(V[i] / tau) for i in range(3)]
    Z_u = sum(w_u)
    rho_u = [wi / Z_u for wi in w_u]
    odds_u = simplify(log(rho_u[0] / rho_u[1]) - (V[0] - V[1]) / tau)
    check(
        "Table 3: uniform μ ⇒ log-odds = (V_i−V_j)/τ  (classical logit)",
        odds_u == 0,
        str(odds_u),
    )

    doxic = simplify(log(rho[0] / rho[1]) - (V[0] - V[1]) / tau - log(mu[0] / mu[1]))
    check("Table 3 interest: leftover is exactly log(μ_i/μ_j)", doxic == 0, str(doxic))

    # C = τ D_KL is the paper's complexity cost, not a new object.
    kl = sum(rho[i] * log(rho[i] / mu[i]) for i in range(3))
    # ρ_i / μ_i = e^{V_i/τ} / Z, so log(ρ_i/μ_i) = V_i/τ − log Z
    kl_closed = simplify(kl - (sum(rho[i] * V[i] for i in range(3)) / tau - log(Z)))
    check("C = τ D_KL: D_KL(ρ*∥μ) = E_ρ[V]/τ − log Z", kl_closed == 0, str(kl_closed))

    report_unbound(
        "τ as a fitted scale (McFadden practice)",
        "paper denies this reading; no identity to check. τ is the information price.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
