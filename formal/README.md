# Formal recoveries

Cite: Emad Mostaque, *Intelligent Economics*, May 2026, Table 3 and the body
paragraphs named in each file. Site: https://ie.ii.inc.

SymPy for algebraic recoveries and limits. Lean when the claim is a theorem
(Link 2 Cauchy → exponential is the first). A failing check is a report, not
a skip. No invented equations. Stubs (contracts, MD, matching, growth, money)
stay paper-line only.

Status of what is green and what does not bind: [STATUS.md](STATUS.md).

Run (SymPy required):

```
python formal/sympy/discounting.py
python formal/sympy/demand_slutsky.py
python formal/sympy/logit.py
python formal/sympy/producer.py
python formal/sympy/black_scholes.py
python formal/sympy/landauer.py
python formal/sympy/lucas.py
python formal/sympy/clearing.py
python formal/sympy/welfare.py
python formal/sympy/nash.py
python formal/sympy/akerlof.py
python formal/sympy/euler.py
python formal/sympy/coase.py
python formal/sympy/contracts.py
python formal/sympy/mechanism_design.py
python formal/sympy/matching.py
python formal/sympy/growth.py
python formal/sympy/money.py
```

Lean: `formal/lean/Discounting.lean`. Needs a Lean 4 toolchain. Until one is
present the file is the statement, not a green `#check`.
