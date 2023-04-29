import * as fs from "fs";
import process from "process";
import { Cell } from "ton-core";
import { compileFunc } from "@ton-community/func-js";

async function compileScript() {
  console.log(
    "================================================================="
  );
  console.log(
    "Compile script is running, let's find some FunC code to compile..."
  );

  const compileResultMinter = await compileFunc({
    targets: ["./contracts/jetton-minter.func"],
    sources: (x) => fs.readFileSync(x).toString("utf8"),
  });

  if (compileResultMinter.status === "error") {
    console.log(
      " - OH NO! Compilation Errors on minter compile! The compiler output was:"
    );
    console.log(`\n${compileResultMinter.message}`);
    process.exit(1);
  }

  console.log(" - Compilation minter was successful!");

  const minterArtifact = `build/minter.compiled.json`;

  fs.writeFileSync(
    minterArtifact,
    JSON.stringify({
      hex: Cell.fromBoc(Buffer.from(compileResultMinter.codeBoc, "base64"))[0]
        .toBoc()
        .toString("hex"),
    })
  );

  console.log(" - Compiled code saved to " + minterArtifact);

  const compileResultWallet = await compileFunc({
    targets: ["./contracts/jetton-wallet.func"],
    sources: (x) => fs.readFileSync(x).toString("utf8"),
  });

  if (compileResultWallet.status === "error") {
    console.log(
      " - OH NO! Compilation Errors on minter compile! The compiler output was:"
    );
    console.log(`\n${compileResultWallet.message}`);
    process.exit(1);
  }

  console.log(" - Compilation minter was successful!");

  const walletArtifact = `build/wallet.compiled.json`;

  fs.writeFileSync(
    walletArtifact,
    JSON.stringify({
      hex: Cell.fromBoc(Buffer.from(compileResultWallet.codeBoc, "base64"))[0]
        .toBoc()
        .toString("hex"),
    })
  );
  console.log(" - Compiled code saved to " + walletArtifact);
}
compileScript();
