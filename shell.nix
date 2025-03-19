{ pkgs ? import <nixpkgs-unstable> {} }:

with pkgs;

mkShell {
  name = "fintiko-shell";
  buildInputs = with pkgs.python312Packages; [
    pkgs.aider-chat
    beautifulsoup4
    playwright
    requests
  ];
}
