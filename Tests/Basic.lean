import PaperProject

open PaperProject

example : twice 3 = 6 := by
  decide

example (n : Nat) : twice n = n + n := by
  exact twice_eq_add_self n

example (n : Nat) : 0 + n = n := by
  exact PaperProject.zero_add n
