{
    description = "Hi-Horizon dashboard environment setup flake";
    
    inputs = {
        nixpkgs.url = "github:nixos/nixpkgs?ref=nixos-unstable";
    };

    outputs = {nixpkgs, ...} @ inputs: 
    let
        pkgs = inputs.nixpkgs.legacyPackages."x86_64-linux";
    in {
        devShells."x86_64-linux".default = pkgs.mkShell {
            packages = with pkgs; [
                pkg-config
                wrapGAppsHook4
                cargo
                nodejs
                rustc
            ];
        };

        buildInputs = with pkgs; [
            librsvg
            webkitgtk_4_1
        ];

        shellHook = ''
            export XDG_DATA_DIRS="$GSETTINGS_SCHEMAS_PATH" # Needed on Wayland to report the correct display scale
        '';
    };
}