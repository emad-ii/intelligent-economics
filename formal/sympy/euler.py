"""Euler equation.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Euler — τ→0 mode over contingent plans;
    interest: the correction −τ ∇ log μ.
  §5: an interior mode of ρ* satisfies ∇V = −τ ∇ log μ. The τ→0 mode
    satisfies the FOC of dynamic optimisation, the Euler equation their
    intertemporal component. Transversality is a boundary condition.
    No consumption-Euler specialisation is written.

Particular V, μ on the live page are not in the paper. A failing check
is a report.
"""
from __future__ import annotations

import sys
from sympy import Function, diff, exp, log, simplify, symbols

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
    # log ρ* = log μ + V/τ − log Z, Z independent of x.
    log_rho = log(mu(x)) + V(x) / tau
    foc = simplify(diff(log_rho, x))
    # Interior mode: ∂_x log ρ* = 0 ⇒ V' = −τ (log μ)'.
    residual = simplify(foc - (diff(V(x), x) / tau + diff(log(mu(x)), x)))
    check(
        "§5: ∇ log ρ* = ∇V/τ + ∇ log μ",
        residual == 0,
        str(residual),
    )
    check(
        "§5 interior mode: ∇V = −τ ∇ log μ",
        simplify(diff(V(x), x) + tau * diff(log(mu(x)), x) - tau * foc) == 0,
    )

    # τ→0: the correction vanishes, FOC is ∇V = 0.
    corr = -tau * diff(log(mu(x)), x)
    check("Table 3: τ→0 drops the correction −τ ∇ log μ", limit_zero(corr))

    report_unbound(
        "transversality as a boundary condition",
        "supplied, not derived, in §5.",
    )
    report_unbound(
        "consumption-Euler specialisation",
        "not in the paper. Not added.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


def limit_zero(expr):
    from sympy import limit
    tau = symbols("tau", positive=True)
    return limit(expr, tau, 0) == 0


if __name__ == "__main__":
    sys.exit(main())
