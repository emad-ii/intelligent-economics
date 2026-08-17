# Formal status

Cite: Emad Mostaque, *Intelligent Economics*, May 2026, Table 3 and the body
paragraphs named below. Site: https://ie.ii.inc. No invented equations.

Pass 1: `d2642b3`. Pass 2: `71a2b97`. Pass 3: `b2cc1fc`. Pass 4: this commit.

## Green

**Discounting / Link 2** (`formal/sympy/discounting.py`) — Table 3 / §5 / Link 2

- \(w(t)=e^{-\delta t}\) solves \(w(t+s)=w(t)w(s)\)
- \(f(V)=e^{V/\tau}\) solves \(f(V_1+V_2)=f(V_1)f(V_2)\)

**Demand / Slutsky** (`formal/sympy/demand_slutsky.py`) — Table 3 / §5, \(\mu\perp p\)

- \(x^*=-\tau\nabla_p\log Z\); \(\partial x^*/\partial p=-\tau\nabla_p^2\log Z=-\mathrm{Cov}(x)/\tau\)
- mixed partials; \(\nabla_p^2\log Z=\mathrm{Cov}(x)/\tau^2\)
- Forced-law Jacobian when \(\mu=\mu(x;p)\): \(\partial x^*/\partial p=-\mathrm{Cov}/\tau+\mathrm{Cov}(x,\partial_p\log\mu)\)
- Jacobian asymmetry sits in \(\mathrm{Cov}(x,\partial_p\log\mu)\)

**Logit** (`formal/sympy/logit.py`) — Table 3 / film II / §5

- \(\rho_i=\mu_i e^{V_i/\tau}/Z\)
- \(\log(\rho_i/\rho_j)=(V_i-V_j)/\tau+\log(\mu_i/\mu_j)\)
- uniform \(\mu\) kills the doxic term (classical logit)
- \(D_{\mathrm{KL}}(\rho^*\Vert\mu)=E_\rho[V]/\tau-\log Z\)

**Producer** (`formal/sympy/producer.py`) — §6.1 / Fig. 7

- \(\partial y^*/\partial p=+\mathrm{Var}(y)/\tau\succeq 0\)
- demand the other sign: \(\partial x^*/\partial p=-\mathrm{Var}(x)/\tau\)

**Black–Scholes** (`formal/sympy/black_scholes.py`) — Table 3 / film IV / §5 identification

- 2 states, \(E_\rho[R]=1\): unique \(\rho\)
- 3 states: the same constraint does not pin \(\rho\)
- min-KL FOC: \(\rho^*\propto\mu e^{\lambda R}\)
- \(D_{\mathrm{KL}}(\rho^*\Vert\mu)=\lambda E_\rho[R]-\log Z\)

**Landauer** (`formal/sympy/landauer.py`) — Table 3 / §7.1

- \(D_{\mathrm{KL}}(\mathrm{point}\Vert\mathrm{uniform}_2)=\ln 2\)
- forced form \(C=\tau\ln 2\)
- substitution \(\tau=k_B T\) returns \(k_B T\ln 2\)

**Lucas / Dual Engine** (`formal/sympy/lucas.py`) — Table 3 / §5.1 / Fig. 6

- \(\rho^*\propto\mu e^{V/\tau}\); one absorb is \(\mu\leftarrow\rho^*\)
- \(\mu_n\propto\mu_0 e^{n V/\tau}\) concentrates on \(\arg\max V\)
- point mass on the maximiser is a fixed point

**GE / clearing** (`formal/sympy/clearing.py`) — Table 3 / §6.1 / Fig. 7

- z(p) = -Phi'(p) with z = x* - y* - omega
- Phi'' = (Var(x)+Var(y))/tau (convex)
- Phi' = 0 iff x* - y* = omega
- consumer price tilt x* = -tau d_p log Z_c; producer y* = +tau d_p log Z_s



**Welfare** (`formal/sympy/welfare.py`) — Table 3 / §6.1 / Part IV

- F[rho*] = tau log Z
- F[rho*] - F[rho] = tau KL(rho || rho*)
- constant numeraire transfer leaves rho*
- tau->0 shadow is max V (probe)

**Nash / QRE** (`formal/sympy/nash.py`) — Table 3 / §5.2 / film III

- coupled tilt rho_i ∝ mu_i exp(E_{rho_{-i}}[V_i]/tau)
- at indifference, rho = mu
- tau->0 softmax -> exact BR
- finite-tau QRE is not a point-mass BR

**Akerlof** (`formal/sympy/akerlof.py`) — §6.1 / Fig. 6 identified

- mu <- (selection o tilt); a zeroed type stays zero
- tilt without selection is the Lucas iteration

**Euler** (`formal/sympy/euler.py`) — Table 3 / §5

- interior mode: grad V = -tau grad log mu
- tau->0 drops the correction

**Coase** (`formal/sympy/coase.py`) — §6.2 identified, not a Table 3 row

- supp(rho*) = supp(mu_firm); excluded types unreachable at any internal incentive

## Does not bind

- Link 2 uniqueness (measurable \(\Rightarrow\) exponential). Lean candidate; no toolchain (`formal/lean/Discounting.lean`).
- §5 printed split as \(\partial x^*/\partial p\). Printed \(-(\mathrm{Cov}+\mathrm{Cov}(x,\partial_p\log\mu))/\tau\neq\) Jacobian of \(E_\rho[x]\). Live page aligned to the print at `621fec1`. Page stays.
- §5 envelope under price-dependent \(\mu\).
- Black–Scholes call / PDE / \(d_1,d_2\). Not in the paper. Identification only.
- Path-space Girsanov / \(K_{\mathrm{info}}\). §3 already; not this recovery.
- Landauer joule magnitude. Inheritance \(\tau=k_B T\).
- Link 4 Langevin \(\to\rho^*\). Named in §5.1; not algebra.
- Live-page extras that are not paper objects: particular \(c(y)\); adaptation-rate mixture; \(\tau\) as a fitted logit scale.

- Clearing existence/coercivity; tatonnement ODE; tau->0 kinks / SMD. Named in section 6.1; not algebra. Quasi-linear scope. Welfare is a later tag.
- Live-page u(x) on the clearing page is illustrative.

- Welfare named duality min Phi = max feasible Sigma F; viability laws of section 4.
- Nash: Brouwer existence; PD cooperation reading.
- Akerlof: warranties/disclosure; Spence; finite-sample collapse.
- Euler: transversality (supplied); consumption-Euler (not in the paper).
- Coase: site slider accounting; Kramers / quantitative Coase 1960.

Stubs (contracts, MD, matching, growth, money): paper line only. Not formalised.
