"""Matching / search.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  §5: the frictions of search and matching are the kinetic cost.
    Search inherits its integrand: exploration pays the integrated
    squared value gradient at the price of information, so search
    intensity is governed by the tilt's scale and the relaxation
    geometry rather than by a free friction parameter.
  §3: K_info = D_KL(P∥Q_μ) = (1/4) E ∫ ||∇V/τ||² dt.
    At the rest point the integrand is (1/4) E ||∇ log(ρ*/μ)||².
  The matching function is inheritance.

Identified. Thin official. No matching function is written.
A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import Function, diff, log, simplify, symbols

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
    x = symbols("x", real=True)
    tau = symbols("tau", positive=True)
    V = Function("V")
    mu = Function("mu")
    # Forced law: ∇ log(ρ*/μ) = ∇V/τ. Search inherits this integrand.
    score = diff(log(mu(x)) + V(x) / tau, x) - diff(log(mu(x)), x)
    ident = simplify(score - diff(V(x), x) / tau)
    check("§3/§5: ∇ log(ρ*/μ) = ∇V/τ  (search inherits the kinetic integrand)", ident == 0, str(ident))

    # Rest-point rate: (1/4) ||∇V/τ||² = (1/4) ||∇ log(ρ*/μ)||².
    left = (diff(V(x), x) / tau) ** 2 / 4
    right = (diff(log(mu(x)) + V(x) / tau, x) - diff(log(mu(x)), x)) ** 2 / 4
    check(
        "§3 rest point: (1/4)||∇V/τ||² = (1/4)||∇ log(ρ*/μ)||²",
        simplify(left - right) == 0,
    )

    report_unbound(
        "matching function",
        "§5: inheritance. Not written.",
    )
    report_unbound(
        "path-space Girsanov evaluation of K_info",
        "§3 names Girsanov. Not re-proved here.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
