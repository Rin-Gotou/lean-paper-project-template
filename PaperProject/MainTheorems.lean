import PaperProject.Definitions

namespace PaperProject

theorem twice_eq_add_self (n : Nat) : twice n = n + n := by
  rfl

theorem zero_add (n : Nat) : 0 + n = n := by
  simp

end PaperProject
