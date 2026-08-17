"""Coase / firm as maintained μ.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  §6.2: a firm is a maintained μ joined to a joint V and a residual
    claimant. Market = coordination at minimal shared doxa; firm =
    coordination by deep shared doxa. One trade-off. Not a Table 3 row.
  Inward: supp(ρ*) = supp(μ_firm) (exclusion / innovator's dilemma).
  §5: Coase 1960 reads against the physical kinetic cost — cheap
    reallocation reaches ρ* from any start; dear reallocation is
    path-dependent. No Kramers formula is on the page.

The site slider N·τ·Δ vs M + N·τ·Δ_in is illustrative accounting,
not a theorem. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import exp, simplify, symbols

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
    m0, m1 = symbols("m0 m1", positive=True)
    # Corporate reference excludes configuration 2.
    mu = [m0, m1, 0]
    V = [V0, V1, V2]
    w = [mu[i] * exp(V[i] / tau) for i in range(3)]
    Z = sum(w)
    rho = [wi / Z for wi in w]
    check(
        "§6.2: supp(ρ*) = supp(μ_firm)  (exclusion / innovator's dilemma)",
        simplify(rho[2]) == 0,
        str(rho[2]),
    )
    # A large internal incentive on the excluded type does not restore it.
    w_big = [mu[i] * exp(V[i] / tau) for i in range(3)]
    w_big[2] = mu[2] * exp(1000 / tau)
    Zb = sum(w_big)
    check(
        "§6.2: excluded configurations unreachable at any internal incentive",
        simplify(w_big[2] / Zb) == 0,
    )

    report_unbound(
        "site slider N·τ·Δ vs M+N·τ·Δ_in",
        "page labels it illustrative accounting, not a theorem.",
    )
    report_unbound(
        "Kramers rate / Coase 1960 quantitative kinetic cost",
        "§5 names the cheap/dear reading. No formula on the page.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
