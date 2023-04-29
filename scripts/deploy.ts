import { hex as MinterHex } from "../build/minter.compiled.json";
import { hex as WalletHex } from "../build/wallet.compiled.json";
import { beginCell, Cell, contractAddress, toNano } from "ton";
import qs from "qs";
import qrcode from "qrcode-terminal";

import dotenv from "dotenv";
import { buildTokenMetadataCell } from "./utils/buildTokenMetadataCell";
dotenv.config();

async function deployScript() {
  console.log(
    "================================================================="
  );
  console.log("Deploy script is running, let's deploy our main.fc contract...");

  const codeCell = Cell.fromBoc(Buffer.from(MinterHex, "hex"))[0];
  const walletCodeCell = Cell.fromBoc(Buffer.from(WalletHex, "hex"))[0];

  const contentCell = buildTokenMetadataCell({
    name: "Wrapped TON",
    symbol: "WTON",
    description: "wTON is a standardised jetton representation of native TON 2",
    image: "https://i.ibb.co/MP2WFSQ/wton.png",
  });

  const dataCell = beginCell()
    .storeRef(contentCell)
    .storeRef(walletCodeCell)
    .endCell();

  const stateInitCell = beginCell()
    .storeBit(false) // split_depth - Parameter for the highload contracts, defines behaviour of splitting into multiple instances in different shards. Currently StateInit used without it.
    .storeBit(false) // special - Used for invoking smart contracts in every new block of the blockchain. Available only in the masterchain. Regular user's contracts used without it.
    .storeRefMaybe(codeCell) // code - Contract's serialized code.
    .storeRefMaybe(dataCell) // data - Contract initial data.
    .storeUint(0, 1) // library - Currently used StateInit without libs
    .endCell();

  const address = contractAddress({
    workchain: 0,
    initialCode: codeCell,
    initialData: dataCell,
  });

  console.log(
    `The address of the contract is following: ${address.toFriendly({
      testOnly: process.env.TESTNET ? true : false,
    })}`
  );
  console.log(`Please scan the QR code below to deploy the contract:`);

  console.log(
    address.toFriendly({
      testOnly: process.env.TESTNET ? true : false,
    })
  );

  let link =
    `https://${process.env.TESTNET ? "test." : ""}tonhub.com/transfer/` +
    address.toFriendly({
      testOnly: process.env.TESTNET ? true : false,
    }) +
    "?" +
    qs.stringify({
      text: "Deploy contract",
      amount: toNano(1).toString(10),
      init: stateInitCell.toBoc({ idx: false }).toString("base64"),
    });

  qrcode.generate(link, { small: true }, (code) => {
    console.log(code);
  });
}

deployScript();
