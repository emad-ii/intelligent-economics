"""Link 2 / exponential discounting.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Link 2 (§3): f(V1+V2)=f(V1)f(V2); measurable non-vanishing solutions e^{cV},
  c=1/τ. Forced law ρ* = μ e^{V/τ} / Z, Z = ∫ μ e^{V/τ}.
  Table 3: Exponential discounting — Link 2's equation read along the clock;
  interest: time-consistency as independence.
  §5: a stationary weighting of delayed value satisfies w(t+s)=w(t)w(s),
  the Cauchy equation of Link 2 again, so the weight is e^{-δ t}.

Do not invent. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import Eq, exp, simplify, symbols

PASS = []
FAIL = []
UNBOUND = []


def check(name: str, cond: bool, detail: str = "") -> None:
    if cond:
        PASS.append(name)
        print(f"GREEN  {name}")
    else:
        FAIL.append(name)
        print(f"FAIL   {name}" + (f"  {detail}" if detail else ""))


def report_unbound(name: str, why: str) -> None:
    UNBOUND.append(name)
    print(f"UNBOUND  {name}  {why}")


def main() -> int:
    t, s, delta, V1, V2, tau = symbols("t s delta V1 V2 tau", real=True)

    # Table 3 / §5: w(t)=e^{-δ t} solves Cauchy.
    w = lambda u: exp(-delta * u)
    residual = simplify(w(t + s) - w(t) * w(s))
    check("§5 Cauchy: exp(-δ t) solves w(t+s)=w(t)w(s)", residual == 0, str(residual))

    # Link 2: f(V)=e^{V/τ} solves f(V1+V2)=f(V1)f(V2).
    f = lambda V: exp(V / tau)
    r2 = simplify(f(V1 + V2) - f(V1) * f(V2))
    check("Link 2 Cauchy: exp(V/τ) solves f(V1+V2)=f(V1)f(V2)", r2 == 0, str(r2))

    # Paper: measurable non-vanishing solutions are the exponentials.
    # SymPy does not prove uniqueness of Cauchy solutions.
    report_unbound(
        "Link 2 uniqueness (measurable ⇒ exponential)",
        "not an algebraic identity; Lean candidate (see formal/lean/Discounting.lean)",
    )

    # Probe that Cauchy is not vacuous. 1/(1+δt) is not a paper object.
    alt = lambda u: 1 / (1 + delta * u)
    alt_res = simplify(alt(t + s) - alt(t) * alt(s))
    check(
        "probe (not in paper): 1/(1+δt) fails Cauchy",
        alt_res != 0 and alt_res != 0,
        str(alt_res),
    )
    if alt_res == 0:
        FAIL.append("probe collapsed")

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
