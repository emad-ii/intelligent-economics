"""Growth.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  §5: growth is the widening of the reachable support as the capitals
    lower the cost terms. The non-rivalry endogenous growth theory
    builds in by hand is the defining trait of intelligence capital,
    the one stock not depleted by use. The balanced-growth path is
    inheritance.

Identified. Thin official. No BGP, production function, or growth rate
is written. A failing check is a report.
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


def tilt(mu, V, tau):
    w = [mu[i] * exp(V[i] / tau) for i in range(len(mu))]
    Z = sum(w)
    return [wi / Z for wi in w]


def main():
    tau = symbols("tau", positive=True)
    V0, V1, V2 = symbols("V0 V1 V2", real=True)
    V = [V0, V1, V2]
    m0, m1 = symbols("m0 m1", positive=True)
    # Narrow support: type 2 unreachable.
    rho_n = tilt([m0, m1, 0], V, tau)
    check("§5: supp(ρ*) = supp(μ)  (reachable support)", simplify(rho_n[2]) == 0)

    # Widening μ (capitals opening a type) opens ρ*.
    m2 = symbols("m2", positive=True)
    rho_w = tilt([m0, m1, m2], V, tau)
    opened = simplify(rho_w[2]) != 0
    check("§5: widening μ widens reachable support", opened)

    report_unbound(
        "balanced-growth path / production function / growth rate",
        "§5: BGP is inheritance. Intelligence non-rival is a trait, not an equation.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
