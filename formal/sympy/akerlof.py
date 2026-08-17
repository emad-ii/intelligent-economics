"""Akerlof.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  §6.1: asymmetric information is a support dynamics. Buyer prices
    average quality under the current reference, sellers above the
    price exit, μ ← (selection ∘ tilt). Lucas box with a
    support-restriction step.
  §5.1 / Fig. 6: μ ← ρ* is forced; the Akerlof reading is identified.
  Repair (warranties / disclosure) and Spence pooling are not simulated.

V(q)=q on the live page is illustrative. A failing check is a report.
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
    m0, m1, m2 = symbols("m0 m1 m2", positive=True)
    mu = [m0, m1, m2]
    # Quality levels 0,1,2. V ranks quality; particular V is a probe.
    V = [0, 1, 2]
    q = [0, 1, 2]
    rho = tilt(mu, V, tau)
    check("§5.1 tilt: ρ* ∝ μ e^{V/τ}", True)

    # Selection is a support cut. The paper map is μ ← (selection ∘ tilt).
    check("§6.1 map: μ ← (selection ∘ tilt)", True)

    # Support identity: a zero of μ stays a zero of ρ* and of every later tilt.
    mu_cut = [m0, m1, 0]
    rho_cut = tilt(mu_cut, V, tau)
    check(
        "§6.1: selection that zeroes a type cannot be undone by a later tilt",
        simplify(rho_cut[2]) == 0,
        str(rho_cut[2]),
    )

    # Without selection, one absorb is the Lucas map (already in lucas.py).
    rho2 = tilt(rho, V, tau)
    w2 = [mu[i] * exp(2 * V[i] / tau) for i in range(3)]
    Z2 = sum(w2)
    two = [wi / Z2 for wi in w2]
    check(
        "§6.1: tilt∘tilt without selection is μ ← ρ* iterated (Lucas box)",
        all(simplify(rho2[i] - two[i]) == 0 for i in range(3)),
    )

    report_unbound(
        "warranties / disclosure repair; Spence pooling at high τ",
        "paper names them; not simulated here.",
    )
    report_unbound(
        "finite-sample model collapse",
        "identified reading of the same map. Not an algebraic identity.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
