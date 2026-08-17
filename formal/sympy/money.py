"""Money.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  §4.5: money is a maintained concentration of μ in the medium-of-exchange
    domain (property, firm, market: the same operation on other slices).
  §6.1: the numéraire whose constant marginal value makes utility
    transferable is the slot where the deferred question of money resides.
    Scope condition and the money question are one question.

Identified. Thin official. Numéraire and circuits stay deferred.
A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import log

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
    # A concentration of μ: mass on one exchange configuration.
    # Entropy of a point mass is 0; of a uniform 3-state reference is log 3.
    H_point = 0
    H_flat = log(3)
    check("§4.5: a point-mass μ is a concentration  (H=0 < H_uniform)", H_point < H_flat)

    # Maintenance: unattended, the paper says μ relaxes toward its scaffolding.
    # No rate is written. Identification only.
    check("§4.5: money is that concentration in the exchange domain  (identification)", True)

    report_unbound(
        "numéraire / circuits / quantity equation",
        "§6.1 defers the numéraire. Circuits not written. Not invented.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
