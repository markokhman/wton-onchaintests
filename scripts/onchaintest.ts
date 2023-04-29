import { Address, beginCell, toNano, TonClient4, contractAddress } from "ton";
import qs from "qs";
import qrcode from "qrcode-terminal";
import { getHttpV4Endpoint } from "@orbs-network/ton-access";
import { getMinterAddress } from "./utils/getMinterAddress";
import { getWalletAddress, getWalletInitState } from "./utils/getWalletAddress";

const tonhubAddress1 = "kQDU69xgU6Mj-iNDHYsWWuNx7yRPQC_bNZNCpq5yVc7LiE7D";
const tonkeeperAddress = "kQC7zjln0_fghMQg0A-ZhYFar3DU1bDW9A4Vi5Go5uu-tLpU";

async function mintWTONWallet() {
  const contrAddress = getMinterAddress();

  console.log(Address.parse(tonkeeperAddress).toFriendly({ testOnly: true }));

  let link = `ton://transfer/${contrAddress.toFriendly({
    testOnly: process.env.TESTNET ? true : false,
  })}?${qs.stringify({
    text: "Mint a wallet",
    amount: toNano("0.05").toString(10),
    bin: beginCell()
      .storeUint(0xaeaf6718n, 32) // op::mint
      .storeUint(0, 64) // query_id
      .storeAddress(Address.parse(tonkeeperAddress))
      .endCell()
      .toBoc({ idx: false })
      .toString("base64"),
  })}`;

  qrcode.generate(link, { small: true }, (code) => {
    console.log(code);
  });
}
async function getWalletData(address: Address) {
  const endpoint = await getHttpV4Endpoint({
    network: process.env.TESTNET ? "testnet" : "mainnet",
  });

  const client4 = new TonClient4({ endpoint });

  const latestBlock = await client4.getLastBlock();

  const { exitCode, result } = await client4.runMethod(
    latestBlock.last.seqno,
    address,
    "get_wallet_data"
  );
  console.log(result);
  if (exitCode === 0 && result.length > 0 && result[0].type === "slice") {
  }
}
async function sendWTON() {
  const contrAddress = getMinterAddress();

  const endpoint = await getHttpV4Endpoint({
    network: process.env.TESTNET ? "testnet" : "mainnet",
  });

  const client4 = new TonClient4({ endpoint });

  const latestBlock = await client4.getLastBlock();

  const { exitCode, result } = await client4.runMethod(
    latestBlock.last.seqno,
    contrAddress,
    "get_wallet_address",
    [
      {
        type: "slice",
        cell: beginCell()
          .storeAddress(Address.parse(tonkeeperAddress))
          .endCell(),
      },
    ]
  );
  if (exitCode === 0 && result.length > 0 && result[0].type === "slice") {
    const jettonWalletAddr = result[0].cell.beginParse().readAddress();

    // console.log(jettonWalletAddr);

    getWalletData(jettonWalletAddr!);

    let link = `ton://transfer/${jettonWalletAddr!.toFriendly({
      testOnly: process.env.TESTNET ? true : false,
    })}?${qs.stringify({
      text: "Send WTON",
      amount: toNano(6).toString(10),
      bin: beginCell()
        .storeUint(0xf8a7ea5n, 32) // op::transfer
        .storeUint(0, 64) // query_id
        .storeCoins(toNano(5))
        .storeAddress(Address.parse(tonhubAddress1))
        .endCell()
        .toBoc({ idx: false })
        .toString("base64"),
    })}`;

    qrcode.generate(link, { small: true }, (code) => {
      console.log(code);
    });
  }
}
async function manuallDeployWallet() {
  console.log(getMinterAddress());
  const addr = getWalletAddress(
    Address.parse(tonkeeperAddress),
    getMinterAddress()
  );

  let link = `ton://transfer/${addr!.toFriendly({
    testOnly: process.env.TESTNET ? true : false,
  })}?${qs.stringify({
    text: "Deploy a wallet",
    amount: toNano("0.05").toString(10),
    init: getWalletInitState(
      Address.parse(tonkeeperAddress),
      getMinterAddress()
    )
      .toBoc({ idx: false })
      .toString("base64"),
  })}`;

  console.log(addr);

  // qrcode.generate(link, { small: true }, (code) => {
  //   console.log(code);
  // });
}

mintWTONWallet();
// getWalletData();
// sendWTON();
// manuallDeployWallet();
