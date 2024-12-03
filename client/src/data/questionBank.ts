import { QuestionBankEntry } from "../types";

export const questionBank: QuestionBankEntry[] = [
  {
    id: "1",
    content: "In measure theory, which of the following statements about outer measure μ* is FALSE?",
    answer: "μ* is always σ-additive for all sets",
    choices: [
      "μ* is monotone (if A ⊆ B then μ*(A) ≤ μ*(B))",
      "μ* is countably subadditive",
      "μ*(∅) = 0",
      "μ* is always σ-additive for all sets"
    ]
  },
  {
    id: "2",
    content: "In algebraic topology, what is the Euler characteristic χ(T²) of a torus?",
    answer: "0",
    choices: ["2", "1", "0", "-2"]
  },
  {
    id: "3",
    content: "Which statement about the Riemann zeta function ζ(s) is correct?",
    answer: "All non-trivial zeros lie on the critical line Re(s) = 1/2",
    choices: [
      "All non-trivial zeros lie on the critical line Re(s) = 1/2",
      "The function has no poles",
      "It converges for all complex numbers s",
      "It has a simple pole at s = 2"
    ]
  },
  {
    id: "4",
    content: "What is the cohomological dimension of a K(G,1) space where G is a finite group?",
    answer: "Equal to the highest n where H^n(G,M) ≠ 0 for some G-module M",
    choices: [
      "Always 0",
      "Always 1",
      "Equal to the order of G",
      "Equal to the highest n where H^n(G,M) ≠ 0 for some G-module M"
    ]
  },
  {
    id: "5",
    content: "In representation theory, what is the character of an irreducible representation of SU(2) of dimension 3?",
    answer: "χ(θ) = 1 + 2cos(θ)",
    choices: [
      "χ(θ) = 3cos(θ)",
      "χ(θ) = 1 + 2cos(θ)",
      "χ(θ) = 1 + 2cos(2θ)",
      "χ(θ) = 1 + 2cos(θ) + cos(2θ)"
    ]
  },
  {
    id: "6",
    content: "Which statement about perfect fields is FALSE?",
    answer: "Every finite field is perfect",
    choices: [
      "Every finite field is perfect",
      "Every field of characteristic 0 is perfect",
      "Every algebraically closed field is perfect",
      "Every finite extension of a perfect field is perfect"
    ]
  },
  {
    id: "7",
    content: "In differential geometry, what is the Gaussian curvature of a hyperbolic paraboloid at its origin?",
    answer: "-1",
    choices: ["1", "0", "-1", "2"]
  },
  {
    id: "8",
    content: "What is the fundamental group of RP² × S¹?",
    answer: "Z × Z₂",
    choices: ["Z × Z₂", "Z", "Z₂", "Z × Z"]
  },
  {
    id: "9",
    content: "In complex analysis, what is the residue of f(z) = z²/(z⁴+1) at z = e^(iπ/4)?",
    answer: "e^(iπ/4)/4",
    choices: ["e^(-iπ/4)/4", "e^(iπ/4)/4", "1/4", "i/4"]
  },
  {
    id: "10",
    content: "Which statement about von Neumann algebras is TRUE?",
    answer: "The double commutant theorem characterizes von Neumann algebras",
    choices: [
      "Every von Neumann algebra is separable",
      "The weak operator topology is metrizable",
      "Every von Neumann algebra is isomorphic to B(H) for some Hilbert space H",
      "The double commutant theorem characterizes von Neumann algebras"
    ]
  },
  {
    id: "11",
    content: "In category theory, what is a zero object?",
    answer: "An object that is both initial and terminal",
    choices: [
      "An object that is both initial and terminal",
      "An object with no morphisms to or from it",
      "An object that is isomorphic to the empty set",
      "An object that represents the zero functor"
    ]
  },
  {
    id: "12",
    content: "What is the homological dimension of the ring Z[x]/(x²-2)?",
    answer: "1",
    choices: ["1", "2", "∞", "0"]
  },
  {
    id: "13",
    content: "In Lie algebra theory, what is the Killing form of sl(2,C)?",
    answer: "k(X,Y) = 8tr(XY)",
    choices: [
      "k(X,Y) = tr(XY)",
      "k(X,Y) = 2tr(XY)",
      "k(X,Y) = 4tr(XY)",
      "k(X,Y) = 8tr(XY)"
    ]
  },
  {
    id: "14",
    content: "What is the Krull dimension of k[x,y,z]/(xy-z²) where k is a field?",
    answer: "2",
    choices: ["1", "2", "3", "0"]
  },
  {
    id: "15",
    content: "In algebraic geometry, what is the genus of a smooth cubic curve in P²?",
    answer: "1",
    choices: ["0", "1", "2", "3"]
  },
  {
    id: "16",
    content: "Which statement about spectral sequences is FALSE?",
    answer: "Every spectral sequence converges",
    choices: [
      "Every spectral sequence converges",
      "The differentials on the r-th page have bidegree (-r,r-1)",
      "There exist collapse theorems",
      "They can be used to compute derived functors"
    ]
  },
  {
    id: "17",
    content: "What is the K-theory group K₁(Z)?",
    answer: "Z/2Z",
    choices: ["Z/2Z", "Z/4Z", "Z/6Z", "Z/8Z"]
  },
  {
    id: "18",
    content: "In operator theory, what characterizes compact operators?",
    answer: "They map bounded sets to relatively compact sets",
    choices: [
      "They have countable spectrum",
      "Their range is closed",
      "They map bounded sets to relatively compact sets",
      "They are bounded"
    ]
  },
  {
    id: "19",
    content: "What is the stable homotopy group π₁ˢ(S⁰)?",
    answer: "Z₂",
    choices: ["Z", "Z₂", "Z₄", "Z₈"]
  },
  {
    id: "20",
    content: "In geometric group theory, what is the growth rate of F₂ × Z?",
    answer: "Exponential",
    choices: ["Linear", "Quadratic", "Exponential", "Polynomial of degree 3"]
  }
]; 