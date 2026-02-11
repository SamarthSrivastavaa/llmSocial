/**
 * Airdrop ETH from Hardhat account #0 to a given address on localhost.
 *
 * Usage (PowerShell):
 *   $env:RECIPIENT_ADDRESS="0xYourWalletAddress"
 *   $env:AMOUNT_ETH="1"
 *   npx hardhat run scripts/airdrop.js --network localhost
 *
 * Or one line (replace 0x... with your full address):
 *   $env:RECIPIENT_ADDRESS="0x..."; $env:AMOUNT_ETH="2"; npx hardhat run scripts/airdrop.js --network localhost
 */
const hre = require("hardhat");

async function main() {
  const recipient = process.env.RECIPIENT_ADDRESS;
  if (!recipient) {
    console.error("Set RECIPIENT_ADDRESS (your wallet address).");
    console.error('Example: $env:RECIPIENT_ADDRESS="0x15...bca8"; npx hardhat run scripts/airdrop.js --network localhost');
    process.exit(1);
  }

  const amountEth = process.env.AMOUNT_ETH || "1";
  const amountWei = hre.ethers.parseEther(amountEth);

  const [sender] = await hre.ethers.getSigners();
  const balanceBefore = await hre.ethers.provider.getBalance(sender.address);
  console.log("Sender:", sender.address, "| Balance:", hre.ethers.formatEther(balanceBefore), "ETH");
  console.log("Recipient:", recipient);
  console.log("Amount:", amountEth, "ETH");

  const tx = await sender.sendTransaction({
    to: recipient,
    value: amountWei,
  });
  await tx.wait();
  console.log("Tx hash:", tx.hash);
  console.log("Done. Check your wallet balance.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
