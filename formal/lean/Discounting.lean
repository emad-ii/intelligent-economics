/-
  Link 2 Cauchy → exponential discounting.

  Cite: Emad Mostaque, Intelligent Economics, May 2026.
    Link 2 (§3): f(V1+V2)=f(V1)f(V2); measurable non-vanishing solutions e^{c V}.
    Table 3 / §5: stationary delay weight satisfies w(t+s)=w(t)w(s),
    so the weight is e^{-δ t}. Time-consistency is independence on the clock.

  First Lean candidate. The paper's theorem is measurable uniqueness on ℝ.
  This file records the algebraic direction that binds without analysis:
  the exponential (geometric on ℕ) solves Cauchy. Uniqueness does not bind
  here: no Lean 4 + mathlib toolchain on this machine, and measurable
  additive ⇒ linear is not an algebraic identity.

  A failing `#check` is a report. Do not invent. No `sorry` standing in for
  the paper uniqueness.
-/

namespace IE
namespace Link2

/-- Cauchy equation of Link 2, on ℕ (discrete clock). -/
def Cauchy (w : Nat → Nat) : Prop :=
  ∀ n m, w (n + m) = w n * w m

/-- Exponential / geometric weight. On ℕ this is a^n, the paper's e^{-δ t}. -/
def expWeight (a n : Nat) : Nat := a ^ n

/-- Algebraic direction: the exponential solves Cauchy. `Nat.pow_add`. -/
theorem expWeight_solves_cauchy (a : Nat) : Cauchy (fun n => expWeight a n) := by
  intro n m
  simpa [expWeight] using (Nat.pow_add a n m).symm

/-
  Paper uniqueness (measurable, ℝ), not proved in this file:

    w : ℝ → ℝ,  w(t+s)=w(t)w(s),  w measurable,  w never zero
      ⇒  ∃ δ,  w(t) = exp(-δ t)

  Discrete uniqueness (non-zero Cauchy ⇒ w n = (w 1)^n) is the same
  equation on ℕ and is also not proved here. Both are unbound until a
  Lean 4 toolchain is present and the analysis lemma is cited.

  #check RealUniqueness   -- no such declaration; that is the report
-/

end Link2
end IE
