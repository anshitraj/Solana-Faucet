import React, { useState, useEffect } from "react";
import {
  Moon,
  Sun,
  Wallet,
  Loader2,
  CheckCircle,
  XCircle,
  Coins,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

interface AirdropStatus {
  loading: boolean;
  success: boolean;
  error: string | null;
  amount: number | null;
}

const SolanaFaucet = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [publicKey, setPublicKey] = useState("");
  const [airdropStatus, setAirdropStatus] = useState<AirdropStatus>({
    loading: false,
    success: false,
    error: null,
    amount: null,
  });
  const { toast } = useToast();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const validateSolanaAddress = (address: string): boolean => {
    // Basic Solana address validation (44 characters, base58)
    const base58Regex = /^[1-9A-HJ-NP-Za-km-z]{43,44}$/;
    return base58Regex.test(address);
  };

  const generateRandomAmount = (): number => {
    // Generate random amount between 0.05 and 0.1 SOL with 3 decimal places
    const min = 0.05;
    const max = 0.1;
    return Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
  };

  const handleAirdrop = async () => {
    if (!publicKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid Solana public key",
        variant: "destructive",
      });
      return;
    }

    if (!validateSolanaAddress(publicKey.trim())) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid Solana public key (44 characters)",
        variant: "destructive",
      });
      return;
    }

    setAirdropStatus({
      loading: true,
      success: false,
      error: null,
      amount: null,
    });

    try {
      const response = await fetch("http://localhost:3001/airdrop", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ publicKey: publicKey.trim() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Airdrop failed");
      }

      const data = await response.json();
      setAirdropStatus({
        loading: false,
        success: true,
        error: null,
        amount: data.amount,
      });

      toast({
        title: "Airdrop Successful! 🎉",
        description: `${data.amount} SOL sent!\nTx: ${data.signature}`,
        variant: "default",
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setAirdropStatus({
        loading: false,
        success: false,
        error: errorMessage,
        amount: null,
      });
      toast({
        title: "Airdrop Failed",
        description: errorMessage,
        variant: "destructive",
      });
    }
  };

  const resetStatus = () => {
    setAirdropStatus({
      loading: false,
      success: false,
      error: null,
      amount: null,
    });
  };

  return (
    <div
      className={`min-h-screen transition-all duration-500 ${
        darkMode
          ? "bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
          : "bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50"
      } animate-gradient`}
    >
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`absolute top-1/4 left-1/4 w-64 h-64 rounded-full opacity-20 blur-3xl animate-float ${
            darkMode ? "bg-purple-500" : "bg-purple-300"
          }`}
        />
        <div
          className={`absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float ${
            darkMode ? "bg-blue-500" : "bg-blue-300"
          }`}
          style={{ animationDelay: "1s" }}
        />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-3">
            <div
              className={`p-3 rounded-xl ${
                darkMode
                  ? "bg-gradient-to-r from-purple-600 to-blue-600"
                  : "bg-gradient-to-r from-purple-500 to-blue-500"
              } animate-pulse-glow`}
            >
              <Coins className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1
                className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${
                  darkMode
                    ? "from-purple-400 to-blue-400"
                    : "from-purple-600 to-blue-600"
                } bg-clip-text text-transparent`}
              >
                Solana Devnet Faucet
              </h1>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                Get free SOL for development on Devnet
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => setDarkMode(!darkMode)}
            className={`relative overflow-hidden transition-all duration-300 ${
              darkMode
                ? "border-purple-500/50 hover:border-purple-400 hover:bg-purple-500/10"
                : "border-purple-300 hover:border-purple-500 hover:bg-purple-50"
            }`}
          >
            <div
              className={`absolute inset-0 transition-transform duration-300 ${
                darkMode ? "translate-y-0" : "translate-y-full"
              }`}
            >
              <Moon className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
            <div
              className={`absolute inset-0 transition-transform duration-300 ${
                darkMode ? "-translate-y-full" : "translate-y-0"
              }`}
            >
              <Sun className="w-4 h-4 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
            </div>
          </Button>
        </div>

        {/* Main faucet card */}
        <div className="max-w-md mx-auto">
          <Card
            className={`backdrop-blur-lg border-0 shadow-2xl transition-all duration-300 ${
              darkMode
                ? "bg-slate-900/80 shadow-purple-500/20"
                : "bg-white/80 shadow-purple-500/10"
            }`}
          >
            <CardHeader className="text-center pb-6">
              <CardTitle
                className={`text-xl flex items-center justify-center space-x-2 ${
                  darkMode ? "text-gray-100" : "text-gray-900"
                }`}
              >
                <Wallet className="w-5 h-5" />
                <span>Request Airdrop</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Public key input */}
              <div className="space-y-2">
                <label
                  className={`text-sm font-medium ${
                    darkMode ? "text-gray-300" : "text-gray-700"
                  }`}
                >
                  Solana Public Key
                </label>
                <Input
                  type="text"
                  placeholder="Enter your Solana wallet address..."
                  value={publicKey}
                  onChange={(e) => {
                    setPublicKey(e.target.value);
                    resetStatus();
                  }}
                  className={`transition-all duration-300 ${
                    darkMode
                      ? "bg-slate-800/50 border-slate-700 focus:border-purple-500 text-gray-100 placeholder:text-gray-500"
                      : "bg-white/50 border-gray-300 focus:border-purple-500 text-gray-900 placeholder:text-gray-400"
                  }`}
                />
              </div>

              {/* Status messages */}
              {airdropStatus.success && (
                <div
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    darkMode
                      ? "bg-green-900/30 border-green-700 text-green-300"
                      : "bg-green-50 border-green-300 text-green-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Success!</span>
                  </div>
                  <p className="text-sm mt-1">
                    Airdropped {airdropStatus.amount} SOL to your wallet
                  </p>
                </div>
              )}

              {airdropStatus.error && (
                <div
                  className={`p-4 rounded-lg border transition-all duration-300 ${
                    darkMode
                      ? "bg-red-900/30 border-red-700 text-red-300"
                      : "bg-red-50 border-red-300 text-red-700"
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-5 h-5" />
                    <span className="font-medium">Error</span>
                  </div>
                  <p className="text-sm mt-1">{airdropStatus.error}</p>
                </div>
              )}

              {/* Airdrop button */}
              <Button
                onClick={handleAirdrop}
                disabled={airdropStatus.loading || !publicKey.trim()}
                className={`w-full py-6 text-lg font-semibold transition-all duration-300 ${
                  darkMode
                    ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500"
                    : "bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                } text-white border-0 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {airdropStatus.loading ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Processing Airdrop...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Coins className="w-5 h-5" />
                    <span>Request Airdrop</span>
                  </div>
                )}
              </Button>

              {/* Info text */}
              <div
                className={`text-center text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                <p>You will receive between 0.05 and 0.1 SOL</p>
                <p className="mt-1">Only works on Solana Devnet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div
          className={`text-center mt-12 text-sm ${
            darkMode ? "text-gray-500" : "text-gray-600"
          }`}
        >
          <p>This faucet provides test SOL for development purposes only.</p>
          <p className="mt-1">
            Please use responsibly and don't abuse the service.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SolanaFaucet;
