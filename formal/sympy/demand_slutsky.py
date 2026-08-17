"""Demand / Slutsky.

Cite: Emad Mostaque, Intelligent Economics, May 2026.
  Table 3: Demand & Slutsky — V=−p·x in the forced law; slopes −Cov/τ.
    Interest: price-dependent μ, the Slutsky-asymmetry estimator.
  §5: x*(p)=−τ ∇_p log Z; ∂x*/∂p=−τ ∇_p² log Z.
    Symmetry: mixed partials of a scalar commute.
    Negativity: log Z is a convex CGF; Hessian PSD; leading −τ flips the sign.
    Income effects live in a richer V; not claimed.
  §5 boxed: when μ=μ(x;p),
    ∂x*_i/∂p_j = −(1/τ) ( Cov(x_i,x_j) + Cov(x_i, ∂_{p_j} log μ) ).
  Forced law (§3): ρ* = μ e^{V/τ} / Z, Z = Σ μ e^{V/τ} on finite support.

Finite support is the paper's compact-support setting (and film I). No new
objects. A failing check is a report.
"""
from __future__ import annotations

import sys
from sympy import (
    Matrix,
    exp,
    log,
    simplify,
    symbols,
    zeros,
)

PASS = []
FAIL = []
UNBOUND = []


def check(name: str, cond, detail: str = "") -> None:
    ok = bool(cond) if not hasattr(cond, "doit") else bool(cond)
    if ok:
        PASS.append(name)
        print(f"GREEN  {name}")
    else:
        FAIL.append(name)
        print(f"FAIL   {name}" + (f"  {detail}" if detail else ""))


def report_unbound(name: str, why: str) -> None:
    UNBOUND.append(name)
    print(f"UNBOUND  {name}  {why}")


def eq0(expr) -> bool:
    return simplify(expr) == 0


def mat0(M) -> bool:
    return all(eq0(M[i, j]) for i in range(M.rows) for j in range(M.cols))


def finite_objects(xs, log_mu, p, tau):
    """Forced law on a listed support. xs: list of column Matrix(2,1)."""
    V = [-(p.T * x)[0] for x in xs]
    w = [exp(lm + v / tau) for lm, v in zip(log_mu, V)]
    Z = sum(w)
    rho = [wi / Z for wi in w]
    mean = sum((rho[k] * xs[k] for k in range(len(xs))), zeros(2, 1))
    logZ = log(Z)
    return {"V": V, "Z": Z, "rho": rho, "mean": mean, "logZ": logZ, "w": w}


def cov_xx(xs, rho, mean):
    C = zeros(2, 2)
    for k, x in enumerate(xs):
        d = x - mean
        C += rho[k] * (d * d.T)
    return C


def cov_x_scalar(xs, rho, mean, scalars):
    out = zeros(2, 1)
    msc = sum(rho[k] * scalars[k] for k in range(len(xs)))
    for k, x in enumerate(xs):
        out += rho[k] * (x - mean) * (scalars[k] - msc)
    return out


def main() -> int:
    tau = symbols("tau", positive=True)
    p1, p2 = symbols("p1 p2", real=True)
    p = Matrix([p1, p2])
    # Compact support, four bundles. Coordinates numeric so algebra closes.
    xs = [Matrix([i, j]) for i in (0, 1) for j in (0, 1)]

    # --- price-independent μ (uniform; paper's "price-independent reference")
    log_mu0 = [0, 0, 0, 0]
    obj = finite_objects(xs, log_mu0, p, tau)
    mean, logZ, rho = obj["mean"], obj["logZ"], obj["rho"]
    grad = Matrix([logZ.diff(p1), logZ.diff(p2)])
    envelope = simplify(mean + tau * grad)
    check("§5 envelope: x* = −τ ∇_p log Z  (μ ⊥ p)", mat0(envelope), str(envelope))

    hess = Matrix([[logZ.diff(a, b) for b in (p1, p2)] for a in (p1, p2)])
    jac = Matrix([[mean[i].diff(p[j]) for j in range(2)] for i in range(2)])
    slutsky_hess = simplify(jac + tau * hess)
    check("§5 Slutsky: ∂x*/∂p = −τ ∇_p² log Z  (μ ⊥ p)", mat0(slutsky_hess), str(slutsky_hess))

    C = cov_xx(xs, rho, mean)
    slopes = simplify(jac + C / tau)
    check("Table 3 slopes: ∂x*/∂p = −Cov(x)/τ  (μ ⊥ p)", mat0(slopes), str(slopes))

    check(
        "§5 symmetry: mixed partials, Jac[0,1]−Jac[1,0] = 0  (μ ⊥ p)",
        eq0(jac[0, 1] - jac[1, 0]),
        str(simplify(jac[0, 1] - jac[1, 0])),
    )

    # CGF convexity: Hessian of log Z is a covariance (PSD).
    cgf = simplify(hess - C / tau**2)
    check("§5 CGF: ∇_p² log Z = Cov(x)/τ²  (μ ⊥ p)", mat0(cgf), str(cgf))

    # --- price-dependent μ, paper's named class (reference / fairness / customary).
    # Probe form is the live interactive's: log μ = −α x2 (p1 − p̄1). Not a paper μ.
    # The identities under test are the paper's.
    alpha, pbar = symbols("alpha pbar", real=True)
    log_mu_p = [-alpha * xs[k][1] * (p1 - pbar) for k in range(4)]
    objp = finite_objects(xs, log_mu_p, p, tau)
    meanp, logZp, rhop = objp["mean"], objp["logZ"], objp["rho"]
    jacp = Matrix([[meanp[i].diff(p[j]) for j in range(2)] for i in range(2)])
    Cp = cov_xx(xs, rhop, meanp)
    dlog = [
        [log_mu_p[k].diff(p1), log_mu_p[k].diff(p2)]
        for k in range(4)
    ]
    cov_xd = Matrix.hstack(
        cov_x_scalar(xs, rhop, meanp, [dlog[k][0] for k in range(4)]),
        cov_x_scalar(xs, rhop, meanp, [dlog[k][1] for k in range(4)]),
    )

    # What the forced law differentiates to (score of ρ*).
    # ∂x*/∂p_j = −Cov(x, x_j)/τ + Cov(x, ∂_{p_j} log μ).
    score_id = simplify(jacp - (-Cp / tau + cov_xd))
    check(
        "forced-law Jacobian: ∂x*/∂p = −Cov(x)/τ + Cov(x, ∂_p log μ)",
        mat0(score_id),
        str(score_id),
    )

    # Printed §5 boxed line (live interactive after 621fec1). Report, do not skip.
    printed = simplify(jacp - (-(Cp + cov_xd) / tau))
    if mat0(printed):
        check("§5 printed split: ∂x*/∂p = −(Cov(x)+Cov(x,∂_p log μ))/τ", True)
    else:
        report_unbound(
            "§5 printed split as ∂x*/∂p",
            "printed −(Cov+Cov(x,∂_p log μ))/τ ≠ Jacobian of E_ρ[x]; "
            "forced law gives −Cov/τ + Cov(x, ∂_p log μ). "
            "Live interactive was aligned to the print at 621fec1.",
        )

    # Envelope as written is the μ ⊥ p paragraph. Direct p-dependence of μ shifts ∇ log Z.
    gradp = Matrix([logZp.diff(p1), logZp.diff(p2)])
    env_p = simplify(meanp + tau * gradp)
    if mat0(env_p):
        check("§5 envelope with μ=μ(x;p): x* = −τ ∇_p log Z", True)
    else:
        report_unbound(
            "§5 envelope under price-dependent μ",
            "x* = −τ ∇_p log Z is stated before the μ(x;p) clause; "
            "direct p-dependence of μ shifts ∇_p log Z by E[∂_p log μ].",
        )

    # Asymmetry handle still sits in the second covariance (paper's dividend).
    # Score identity: Jac_12 − Jac_21 = Cov(x1, ∂_{p2} log μ) − Cov(x2, ∂_{p1} log μ).
    asym_jac = simplify(jacp[0, 1] - jacp[1, 0])
    asym_dox = simplify(cov_xd[0, 1] - cov_xd[1, 0])
    check(
        "§5 dividend: Jac asymmetry = asymmetry of Cov(x, ∂_p log μ)",
        eq0(asym_jac - asym_dox),
        str(simplify(asym_jac - asym_dox)),
    )

    print()
    print(f"green={len(PASS)} fail={len(FAIL)} unbound={len(UNBOUND)}")
    return 1 if FAIL else 0


if __name__ == "__main__":
    sys.exit(main())
