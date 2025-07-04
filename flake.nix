{
  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-24.11";
    utilities.url = "github:master-software-gmbh/nixos-utilities";
    utilities.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, utilities }: utilities.lib.allSystems (system: let
    pkgs = import nixpkgs {
      inherit system;
      overlays = [
        (utilities.lib.bun.overlay1_2_2 system)
      ];
    };
    biome = utilities.lib.biome pkgs;
  in {
    devShell = pkgs.mkShell {
      buildInputs = [
        pkgs.bun
      ] ++ biome;
    };
  });
}
