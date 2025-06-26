import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import {
  Connection,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  SystemProgram,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

// Load env variables
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const DEVNET_URL = "https://api.devnet.solana.com";
const connection = new Connection(DEVNET_URL, "confirmed");

// Load faucet wallet from secret key in .env
function loadFaucetKeypair() {
  if (!process.env.FAUCET_SECRET_KEY) {
    throw new Error("FAUCET_SECRET_KEY not set in .env");
  }
  const secret = JSON.parse(process.env.FAUCET_SECRET_KEY);
  return Keypair.fromSecretKey(Uint8Array.from(secret));
}

const faucetKeypair = loadFaucetKeypair();

app.post("/airdrop", async (req, res) => {
  try {
    const { publicKey } = req.body;
    if (!publicKey) {
      return res
        .status(400)
        .json({ error: "Missing publicKey in request body." });
    }
    let recipient;
    try {
      recipient = new PublicKey(publicKey);
    } catch (e) {
      return res.status(400).json({ error: "Invalid Solana public key." });
    }

    // Randomize amount between 0.05 and 0.1 SOL
    const min = 0.05,
      max = 0.1;
    const solAmount = Math.random() * (max - min) + min;
    const lamports = Math.floor(solAmount * LAMPORTS_PER_SOL);

    // Create transfer transaction
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: faucetKeypair.publicKey,
        toPubkey: recipient,
        lamports,
      })
    );

    // Sign and send
    const signature = await sendAndConfirmTransaction(connection, tx, [
      faucetKeypair,
    ]);
    return res.json({ signature, amount: solAmount });
  } catch (err) {
    console.error("Airdrop error:", err);
    return res
      .status(500)
      .json({ error: "Airdrop failed", details: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Solana Faucet backend running on port ${PORT}`);
});
