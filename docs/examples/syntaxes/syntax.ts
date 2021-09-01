import * as it from "https://deno.land/x/itsudeno"

for (const chain of ["input", "output"]) {
  await it.modules.net.ip.firewall({
    _: `Set default policy for firewall for ${chain}`,
    _using: "ssh",
    _as: "root",
    chain,
    policy: "drop",
  })
}
