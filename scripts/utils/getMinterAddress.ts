import { beginCell, Cell, contractAddress } from "ton";
import { hex as MinterHex } from "../../build/minter.compiled.json";
import { hex as WalletHex } from "../../build/wallet.compiled.json";
import { buildTokenMetadataCell } from "./buildTokenMetadataCell";

export function getMinterAddress() {
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

  const contrAddress = contractAddress({
    workchain: 0,
    initialCode: codeCell,
    initialData: dataCell,
  });

  return contrAddress;
}
