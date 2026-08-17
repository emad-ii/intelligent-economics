# Formal status

Cite: Emad Mostaque, *Intelligent Economics*, May 2026, Table 3 and §3 / §5.
HEAD at writing: `91c6b51`. No invented equations.

## Green

**Discounting / Link 2** (`formal/sympy/discounting.py`)

- §5: \(w(t)=e^{-\delta t}\) solves \(w(t+s)=w(t)w(s)\)
- Link 2: \(f(V)=e^{V/\tau}\) solves \(f(V_1+V_2)=f(V_1)f(V_2)\)

**Demand / Slutsky** (`formal/sympy/demand_slutsky.py`), finite support, \(\mu\perp p\)

- §5 envelope: \(x^*=-\tau\nabla_p\log Z\)
- §5 Slutsky: \(\partial x^*/\partial p=-\tau\nabla_p^2\log Z\)
- Table 3 slopes: \(\partial x^*/\partial p=-\mathrm{Cov}(x)/\tau\)
- §5 symmetry: mixed partials commute
- §5 CGF: \(\nabla_p^2\log Z=\mathrm{Cov}(x)/\tau^2\)
- Forced-law Jacobian when \(\mu=\mu(x;p)\): \(\partial x^*/\partial p=-\mathrm{Cov}(x)/\tau+\mathrm{Cov}(x,\partial_p\log\mu)\)
- §5 dividend: Jacobian asymmetry equals asymmetry of \(\mathrm{Cov}(x,\partial_p\log\mu)\)

## Does not bind

- Link 2 uniqueness (measurable \(\Rightarrow\) exponential). Not an algebraic identity. Lean candidate; no Lean 4 toolchain on this machine (`formal/lean/Discounting.lean`).
- §5 printed split as \(\partial x^*/\partial p\). Printed \(-(\mathrm{Cov}+\mathrm{Cov}(x,\partial_p\log\mu))/\tau\) is not the Jacobian of \(E_\rho[x]\). The forced law gives \(-\mathrm{Cov}/\tau+\mathrm{Cov}(x,\partial_p\log\mu)\). Live interactive was aligned to the print at `621fec1`.
- §5 envelope under price-dependent \(\mu\). \(x^*=-\tau\nabla_p\log Z\) is stated before the \(\mu(x;p)\) clause; direct \(p\)-dependence of \(\mu\) shifts \(\nabla_p\log Z\) by \(E[\partial_p\log\mu]\).

Stubs (contracts, MD, matching, growth, money): paper line only. Not formalised.
