//! Moteur de match : simulation par agents, sans interface.
//!
//! Règle d'or : le moteur est déterministe. La même graine donne
//! exactement la même partie (voir `docs/decisions/002-determinisme.md`).

pub mod rng;

pub use rng::SimRng;
