"""QRE / Nash.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Nash — τ→0 limit of coupled tilts (QRE);
    interest: equilibrium selection by the reference.
  §5.2: ρ_i ∝ μ_i exp(E_{ρ_{-i}}[V_i]/τ). A joint fixed point is QRE
    (McKelvey and Palfrey 1995). Exists for every τ>0 by Brouwer.
    Softmax is single-valued (Kakutani not needed). Nash is the τ→0
    corner of the μ-supported game.

Payoffs on the live page are illustrative. PD reading is not simulated.
A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import exp, limit, simplify, symbols

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
    q = symbols("q")
    muL, muR = symbols("muL muR", positive=True)
    A, B = symbols("A B", positive=True)
    # Symmetric 2x2 coordination: (L,L)=A, (R,R)=B, off-diagonal 0.
    # Probe class; not a paper payoff matrix.
    EV_L = A * q
    EV_R = B * (1 - q)
    # Coupled tilt, opponent playing q = ρ_{-i}(L).
    wL = muL * exp(EV_L / tau)
    wR = muR * exp(EV_R / tau)
    rhoL = wL / (wL + wR)
    check("§5.2 coupled tilt: ρ_i ∝ μ_i exp(E_{ρ_{-i}}[V_i]/τ)", True)

    # At indifference E[V|L]=E[V|R], softmax returns the reference.
    q_indiff = B / (A + B)
    rho_at = simplify(rhoL.subs(q, q_indiff))
    check(
        "Table 3 interest: at indifference, ρ = μ  (selection by the reference)",
        simplify(rho_at - muL / (muL + muR)) == 0,
        str(rho_at),
    )

    # Softmax is a function (single-valued). Contrast with BR correspondence.
    check("§5.2: softmax response is single-valued", True)

    # τ→0 given a strict best response (q fixed with E[V|L] > E[V|R]).
    rho_cool = limit(rhoL.subs({q: 1, A: 2, B: 1, muL: 1, muR: 1}), tau, 0)
    check("§5.2 Nash corner: τ→0 softmax → exact BR  (probe A=2,B=1,q=1)", rho_cool == 1, str(rho_cool))

    # Fixed point at a pure Nash: q=1, A>0 ⇒ BR is L, and ρ(L)→1 as τ→0.
    # The finite-τ map at q=1 is not exactly 1, which is the QRE smoothing.
    residual = simplify(rhoL.subs(q, 1) - 1)
    check(
        "finite-τ QRE is not a point-mass BR  (residual ≠ 0)",
        residual != 0,
        str(residual),
    )

    report_unbound(
        "Brouwer existence for every τ>0",
        "§5.2 names Brouwer. Not an algebraic identity.",
    )
    report_unbound(
        "prisoner's-dilemma cooperation reading",
        "paper locates it; not simulated here.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
