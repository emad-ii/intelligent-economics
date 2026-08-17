"""Black–Scholes identification.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Black–Scholes — the complete market's minimal-entropy measure;
    interest: incompleteness prices the reference.
  §5: in the complete Black–Scholes setting the risk-neutral measure is
    the Girsanov exponential tilt of the physical measure of asset returns,
    fixed by no-arbitrage rather than by preference, at a relative-entropy
    cost of the same form as C.
  Boxed §5.1: the physical measure tilted to no-arbitrage gives Black–Scholes.

No call price, PDE, or d1,d2. Those are not in the paper. Finite support
is the identification, not a second kinetic term. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import Eq, exp, log, simplify, solve, symbols

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
    # Two states: unique equivalent measure with E_ρ[R]=1 (numeraire).
    # Completeness as the page and Table 3 use it. Returns numeric so
    # the linear system closes; they are a probe, not a paper pair.
    Rd, Ru = symbols("Rd Ru", positive=True)
    q = symbols("q")
    # ρ = (1-q, q) on (down, up). E[R]=1 ⇒ (1-q) Rd + q Ru = 1.
    q_star = simplify(solve(Eq((1 - q) * Rd + q * Ru, 1), q)[0])
    unique = simplify(q_star - (1 - Rd) / (Ru - Rd))
    check(
        "complete (2 states): E_ρ[R]=1 pins a unique ρ",
        unique == 0 and q_star.has(Rd, Ru),
        str(q_star),
    )

    # Three states: one linear constraint, two free weights. Not unique.
    r0, r1, r2 = symbols("r0 r1 r2", positive=True)
    a, b = symbols("a b")
    # ρ = (a, b, 1-a-b), E[R]=1 is one equation in two unknowns.
    constraint = a * r0 + b * r1 + (1 - a - b) * r2 - 1
    # The solution set is a line (generically), not a point.
    sol_b = solve(constraint, b)
    check(
        "incomplete (3 states): E_ρ[R]=1 does not pin ρ",
        len(sol_b) == 1 and sol_b[0].has(a),
        str(sol_b),
    )

    # Min-KL to μ subject to E[R]=1 and Σρ=1: FOC is the exponential tilt.
    # Paper: unique exponential tilt of a reference fixed by a constraint.
    mu0, mu1, mu2 = symbols("mu0 mu1 mu2", positive=True)
    rho0, rho1, rho2 = symbols("rho0 rho1 rho2", positive=True)
    lam, nu = symbols("lam nu", real=True)
    # L = Σ ρ log(ρ/μ) + lam (1 − Σ ρ R) + nu (1 − Σ ρ)
    # ∂L/∂ρ_i = log(ρ_i/μ_i) + 1 − lam R_i − nu = 0
    # ⇒ ρ_i = μ_i exp(lam R_i + nu − 1)
    R = [r0, r1, r2]
    mu = [mu0, mu1, mu2]
    tilt = [mu[i] * exp(lam * R[i]) for i in range(3)]
    Z = sum(tilt)
    rho = [t / Z for t in tilt]
    # FOC residual: log(ρ/μ) − lam R is i-independent (absorbed in Z).
    score = [simplify(log(rho[i] / mu[i]) - lam * R[i]) for i in range(3)]
    foc = simplify(score[0] - score[1]) == 0 and simplify(score[1] - score[2]) == 0
    check("min-KL FOC: ρ* ∝ μ e^{λ R}  (Girsanov / exponential tilt)", foc)

    # C = τ D_KL is the paper's cost form. Identity, not a new object.
    tau = symbols("tau", positive=True)
    kl = sum(rho[i] * log(rho[i] / mu[i]) for i in range(3))
    # log(ρ_i/μ_i) = λ R_i − log Z
    kl_closed = simplify(kl - (lam * sum(rho[i] * R[i] for i in range(3)) - log(Z)))
    check("C = τ D_KL: D_KL(ρ*∥μ) = λ E_ρ[R] − log Z", kl_closed == 0, str(kl_closed))

    report_unbound(
        "Black–Scholes call / PDE / d1,d2",
        "not in the paper. Identification only. No formula added.",
    )
    report_unbound(
        "path-space Girsanov (Link 4 / K_info)",
        "§3 already priced that term. This recovery is the asset-return identification.",
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
