FROM mcr.microsoft.com/vscode/devcontainers/universal:1-focal
USER codespace

# Deno install
RUN curl -fsSL https://deno.land/x/install/install.sh | sh \
    && sudo cp /home/codespace/.deno/bin/deno /usr/bin/deno 
ENV PATH="/home/codespace/.deno/bin:$PATH"

# Velociraptor install
RUN deno install -qAn vr https://deno.land/x/velociraptor@1.4.0/cli.ts
