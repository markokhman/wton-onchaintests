import { beginCell, Cell, contractAddress, Address } from "ton";
import { hex as WalletHex } from "../../build/wallet.compiled.json";

export function getWalletAddress(ownerAddres: Address, masterAddress: Address) {
  const walletCodeCell = Cell.fromBoc(Buffer.from(WalletHex, "hex"))[0];

  const dataCell = beginCell()
    .storeCoins(0)
    .storeAddress(ownerAddres)
    .storeAddress(masterAddress)
    .storeRef(walletCodeCell)
    .endCell();

  const contrAddress = contractAddress({
    workchain: 0,
    initialCode: walletCodeCell,
    initialData: dataCell,
  });

  return contrAddress;
}

export function getWalletInitState(
  ownerAddres: Address,
  masterAddress: Address
) {
  const walletCodeCell = Cell.fromBoc(Buffer.from(WalletHex, "hex"))[0];

  const dataCell = beginCell()
    .storeCoins(0)
    .storeAddress(ownerAddres)
    .storeAddress(masterAddress)
    .storeRef(walletCodeCell)
    .endCell();

  const stateInitCell = beginCell()
    .storeBit(false) // split_depth - Parameter for the highload contracts, defines behaviour of splitting into multiple instances in different shards. Currently StateInit used without it.
    .storeBit(false) // special - Used for invoking smart contracts in every new block of the blockchain. Available only in the masterchain. Regular user's contracts used without it.
    .storeRefMaybe(walletCodeCell) // code - Contract's serialized code.
    .storeRefMaybe(dataCell) // data - Contract initial data.
    .storeUint(0, 1) // library - Currently used StateInit without libs
    .endCell();

  return stateInitCell;
}
