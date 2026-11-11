// Pas de fenêtre console sous Windows en version finale.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    mm_app_lib::run()
}
