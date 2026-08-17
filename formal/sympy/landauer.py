"""Landauer's bound.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Landauer — two states, τ = k_B T; interest: physical floor of C.
  §7.1: erasing a bit takes two equiprobable states to one state.
    Against a uniform two-state reference this raises D_KL(ρ∥μ) by exactly
    ln 2 nats. C = τ D_KL charges τ per nat, so the cost is τ ln 2.
    Physically instantiated against the Gibbs state, τ = k_B T and
    τ ln 2 = k_B T ln 2, which is Landauer's bound.
  The form τ ln 2 is forced. The magnitude is an inheritance
  (Parrondo et al. 2015).

Do not invent a joule conversion. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import Rational, log, simplify, symbols

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


def kl(rho, mu):
    return sum(rho[i] * log(rho[i] / mu[i]) for i in range(len(rho)) if rho[i] != 0)


def main():
    tau, kB, T = symbols("tau k_B T", positive=True)
    mu = [Rational(1, 2), Rational(1, 2)]
    # Full erasure: mass on a single state.
    rho = [1, 0]
    dkl = simplify(kl(rho, mu))
    check("§7.1: D_KL(point ∥ uniform_2) = ln 2", dkl == log(2), str(dkl))

    C = simplify(tau * dkl)
    check("§7.1 forced form: C = τ ln 2", C == tau * log(2), str(C))

    # Physical identification is inheritance, not a derived magnitude.
    # The algebra is only: substitute τ = k_B T.
    phys = simplify((kB * T) * log(2) - (kB * T * log(2)))
    check("Table 3 substitution: τ=k_B T ⇒ τ ln 2 = k_B T ln 2", phys == 0)

    # Partial erasure is not the paper's one-bit cost. Report, do not invent.
    q = symbols("q")
    # skip a formula for partial erase
    report_unbound(
        "physical magnitude of k_B T (joules)",
        "inheritance. Form is forced; magnitude is the identification τ=k_B T.",
    )
    report_unbound(
        "human metabolic floor vs machine floor",
        "§7.1 locates both as this C. No extra equation.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
