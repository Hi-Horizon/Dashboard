{
  description = "Dev shell for Hi-Horizon Dashboard (SvelteKit + Tauri v2 frontend, Python MQTT listener, SQLite db)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };

        # MQTTlistener/MqttDataHandler.py uses paho-mqtt + python-socketio,
        # sqlite3 is part of the Python stdlib.
        pythonEnv = pkgs.python3.withPackages (ps: with ps; [
          paho-mqtt
          python-socketio
        ]);
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            # --- webapp: SvelteKit + Tauri v2 ---
            nodejs
            rustc
            cargo
            rustfmt
            clippy
            pkg-config

            # --- Tauri v2 Linux runtime/build deps ---
            at-spi2-atk
            atkmm
            cairo
            gdk-pixbuf
            glib
            gtk3
            harfbuzz
            librsvg
            libsoup_3
            pango
            webkitgtk_4_1
            openssl
            dbus
            file
            wget
            curl

            # --- MQTTlistener + db (sqlite) ---
            pythonEnv
            sqlite
          ];

          shellHook = ''
            export LD_LIBRARY_PATH=${pkgs.lib.makeLibraryPath [
              pkgs.webkitgtk_4_1
              pkgs.gtk3
              pkgs.libsoup_3
              pkgs.at-spi2-atk
              pkgs.gdk-pixbuf
              pkgs.cairo
              pkgs.pango
              pkgs.glib
              pkgs.openssl
            ]}:$LD_LIBRARY_PATH

            echo "Hi-Horizon Dashboard dev shell ready."
          '';
        };
      });
}
