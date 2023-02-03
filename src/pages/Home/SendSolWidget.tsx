import React, { FC, useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Input,
  LinearProgress,
  Link,
  Typography,
} from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CloseIcon from "@mui/icons-material/Close";
import { WalletNotConnectedError } from "@solana/wallet-adapter-base";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import BigNumber from "bignumber.js";
import SolLogo from "../../assets/coin.svg";
import { InfoRow } from "../../components/InfoRow";
import { useGetSolanaPrice } from "../../hooks/useGetSolanaPrice";

const LAMPORTS_PER_SOL = BigNumber(1000000000);
const CONFIRMATIONS_FOR_SUCCESS = 21;
const TEMP_RANDO_KEY = Keypair.generate().publicKey;

export const SendSolWidget: FC = () => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const [amount, setAmount] = useState("0");
  const [confirmations, setConfirmations] = useState(0);
  const [minLamports, setMinLamports] = useState(0);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState<null | BigNumber>(null);
  const [isSending, setIsSending] = useState(true);
  const [loading, setLoading] = useState(false);
  const [nextPressed, setNextPressed] = useState(false);
  const [fee, setFee] = useState<null | number>(null);
  const solInUsd = useGetSolanaPrice();
  const [txn, setTxn] = useState("");
  const [isWaitingForConfirmation, setIsWaitingForConfirmation] =
    useState(false);
  const wallet = useWallet()
  const getBalance = useCallback(async () => {
    if (publicKey) {
      let bal = await connection.getBalance(AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT);
      // let wallet = new PublicKey("AmgWvVsaJy7UfWJS5qXn5DozYcsBiP2EXBH8Xdpj5YXT");
      //let balance = await connection.getBalance(wallet);
      // console.log(wallet);
      // console.log(`${balance } SOL`);
      console.log("balance", bal);
      setBalance(BigNumber(bal));

      console.log(publicKey);
    }
  }, [connection, publicKey, setBalance]);

  useEffect(() => {
    getBalance();
  }, [getBalance]);

  const onMaxClick = () => {
    if (balance) {
      setAmount(
        balance
          .minus(BigNumber(minLamports))
          .minus(BigNumber(fee || 0))
          .dividedBy(LAMPORTS_PER_SOL)
          .toString()
      );
    }
  };

  const onCopyClick = () => {
    navigator.clipboard.writeText(publicKey?.toString() ?? "");
  };

  const onExplorerClick = () => {
    const win: Window = window;
    win
      .open(`https://solscan.io/tx/${txn ?? ""}?cluster=devnet`, "_blank")
      ?.focus();
  };

  const confirmerLooop = useCallback(
    async (startBlock: number) => {
      const interval = setInterval(async () => {
        const recentBlockhash = await connection.getLatestBlockhash();
        setConfirmations(
          (recentBlockhash?.lastValidBlockHeight ?? 0) - startBlock
        );
        if (
          (recentBlockhash?.lastValidBlockHeight ?? 0) - startBlock >
          CONFIRMATIONS_FOR_SUCCESS
        ) {
          clearInterval(interval);
        }
      }, 1000);
    },
    [connection, setConfirmations]
  );

  useEffect(() => {
    (async () => {
      if (publicKey) {
        const lamports = await connection.getMinimumBalanceForRentExemption(0);
        setMinLamports(lamports);
        const recentBlockhash = await connection.getLatestBlockhash();
        const transaction = new Transaction({
          blockhash: recentBlockhash.blockhash,
          feePayer: publicKey,
          lastValidBlockHeight: recentBlockhash.lastValidBlockHeight,
        }).add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: TEMP_RANDO_KEY,
            lamports: 9999,
          })
        );
        const response = await connection.getFeeForMessage(
          transaction.compileMessage()
        );
        if (response?.value) {
          setFee(response?.value);
        }
      }
    })();
  }, [connection, publicKey, setMinLamports]);

  const closeConfirmationBox = () => {
    setIsWaitingForConfirmation(false);
    setConfirmations(0);
  };

  const isValidAmount = useMemo(() => {
    const asBig = BigNumber(amount);
    if (asBig.isNaN()) {
      return false;
    }
    let adjustedAmt = asBig
      .multipliedBy(LAMPORTS_PER_SOL)
      .plus(BigNumber(minLamports))
      .plus(BigNumber(fee || 0).dividedBy(LAMPORTS_PER_SOL));
    return (
      adjustedAmt.isGreaterThan(BigNumber(0)) &&
      adjustedAmt.isLessThanOrEqualTo(balance != null ? balance : BigNumber(0))
    );
  }, [amount, balance, fee, minLamports]);

  const onSendClick = useCallback(async () => {
    if (!isValidAmount) {
      return setNextPressed(true);
    }
    setNextPressed(false);
    if (!publicKey) throw new WalletNotConnectedError();

    setLoading(true);

    const transaction = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: Keypair.generate().publicKey,
        lamports: BigInt(
          BigNumber(minLamports)
            .plus(BigNumber(amount).multipliedBy(LAMPORTS_PER_SOL))
            .decimalPlaces(0, 1)
            .toString()
        ),
      })
    );

    let {
      context: { slot: minContextSlot },
      value: { blockhash, lastValidBlockHeight },
    } = await connection.getLatestBlockhashAndContext();

    const signature = await sendTransaction(transaction, connection, {
      minContextSlot,
    });
    confirmerLooop(lastValidBlockHeight);
    setTxn(signature);
    setLoading(false);
    setIsWaitingForConfirmation(true);

    try {
      const res = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });
      if (res.value.err) {
        setError(res.value.err.toString());
        return;
      }
    } catch (err) {
      setError(err ? err.toString() : "");
      console.log(err);
    }
    setAmount("0");
    getBalance();
  }, [
    amount,
    confirmerLooop,
    connection,
    getBalance,
    minLamports,
    publicKey,
    sendTransaction,
    setError,
    setLoading,
    setTxn,
  ]);

  return (
    <Box p={3} sx={styles.container}>
      {!isWaitingForConfirmation ? (
        <>
          <Box p={1.2} sx={styles.switchContainer}>
            <Button
              onClick={() => {
                setIsSending(true);
              }}
              variant={!isSending ? "text" : "contained"}
              sx={[
                styles.sendButton,
                !isSending ? styles.sendButtonDead : styles.sendButtonActive,
              ]}
            >
              Send
            </Button>
            <Box mx={0.3} />
            <Button
              onClick={() => {
                setIsSending(false);
              }}
              variant={isSending ? "text" : "contained"}
              sx={[
                styles.sendButton,
                isSending ? styles.sendButtonDead : styles.sendButtonActive,
              ]}
            >
              Recieve
            </Button>
          </Box>
          <Box mt={3} sx={styles.coinLogo}>
            <img
              width="30px"
              style={{ opacity: "60%" }}
              src={SolLogo}
              alt="Solana Logo"
            />
            <Typography ml={1.4} color="text.primary" variant="h3">
              SOL
            </Typography>
          </Box>
          {!isSending ? (
            <Box mb={3} px={4} sx={{ width: "100%" }}>
              <Typography
                color="text.primary"
                mt={3}
                mb={2}
                sx={styles.centeredLongText}
                variant="h3"
              >
                My address:
              </Typography>
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box mr={2} sx={{ width: "80%" }}>
                  <Typography
                    color="text.primary"
                    variant="h3"
                    sx={styles.leftLongText}
                  >
                    <Link href="#" onClick={onCopyClick}>
                      {publicKey?.toString()}
                    </Link>
                  </Typography>
                </Box>
                <Box sx={{}}>
                  <IconButton onClick={onCopyClick}>
                    <ContentCopyIcon
                      color="action"
                      sx={{ width: "25px", height: "25px" }}
                    />
                  </IconButton>
                </Box>
              </Box>
            </Box>
          ) : (
            <Box mt={3} sx={{ justifyContent: "center" }}>
              <Input
                disableUnderline
                color="primary"
                onChange={(event) => {
                  if (/^[0-9,.]*$/.test(event?.target?.value)) {
                    setAmount(event?.target?.value ?? "");
                  }
                }}
                inputProps={{
                  style: { textAlign: "center" },
                }}
                sx={styles.input}
                type="tel"
                value={amount}
              />
            </Box>
          )}
          <Box
            p={1.5}
            mt={1.5}
            sx={[
              styles.maxContainer,
              {
                borderColor:
                  nextPressed && !isValidAmount ? "error.main" : undefined,
              },
            ]}
          >
            <Typography
              color={
                nextPressed && !isValidAmount ? "error.main" : "text.primary"
              }
              mr={1}
              variant="subtitle1"

            >
              Current Balance:{" "}

              {(balance !== null ? balance : BigNumber(10))
                .multipliedBy(LAMPORTS_PER_SOL)
                ?.toString()}{" "}

              SOL
            </Typography>
            {!!balance && !!isSending && (
              <Button
                onClick={onMaxClick}
                variant="contained"
                sx={styles.maxButton}
              >
                Max
              </Button>
            )}
          </Box>
          {!!isSending && (
            <>
              <Box mt={5} sx={styles.sendBox}>
                <Box>
                  <Typography color="primary.light" mr={1} variant="subtitle1">
                    You will send
                  </Typography>
                  <Typography color="text.primary" mr={1} variant="h3">
                    {amount || "0"}
                    {parseFloat(amount) > 0 &&
                      !!solInUsd &&
                      ` (${(parseFloat(amount) * solInUsd).toLocaleString(
                        "en-US",
                        {
                          style: "currency",
                          currency: "USD",
                        }
                      )})`}
                  </Typography>
                </Box>
                <Box sx={styles.coinLogo}>
                  <img width="20px" src={SolLogo} alt="Solana Logo" />
                  <Typography ml={2} color="text.primary" variant="body1">
                    Solana
                  </Typography>
                </Box>
              </Box>
              <Box mt={2} sx={styles.fullWidth}>
                <Button
                  disabled={!publicKey}
                  onClick={onSendClick}
                  variant="contained"
                  fullWidth
                  sx={{
                    justifyContent: "center",
                    backgroundColor: loading ? "grey" : undefined,
                  }}
                >
                  Send Sol
                </Button>
                {!!nextPressed && !isValidAmount && (
                  <Typography mt={1} color="error.main" variant="subtitle2">
                    Please enter a valid amount
                  </Typography>
                )}
              </Box>
            </>
          )}
          <Box sx={styles.fullWidth} mt={!isSending ? 5 : 2}>
            {!!solInUsd && (
              <InfoRow
                label="1 SOL"
                value={`~${solInUsd.toLocaleString("en-US", {
                  style: "currency",
                  currency: "USD",
                })}`}
              />
            )}
            <InfoRow label="Confirmation Time" value="~10 Seconds" />
            {fee != null && (
              <InfoRow
                label="Network Fee"
                value={`${BigNumber(fee).dividedBy(LAMPORTS_PER_SOL)} SOL`}
              />
            )}
          </Box>
        </>
      ) : (
        <Box px={2} m={2} sx={styles.holdingPanelContainer}>
          <Box
            mb={0.5}
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-end",
              textAlign: "right",
              width: "100%",
            }}
          >
            <IconButton onClick={closeConfirmationBox}>
              <CloseIcon sx={{ width: 40, height: 40 }} color="action" />
            </IconButton>
          </Box>
          {!error?.length ? (
            <>
              {confirmations < CONFIRMATIONS_FOR_SUCCESS ? (
                <QueryBuilderIcon sx={styles.warningIcon} color="action" />
              ) : (
                <CheckCircleOutlineIcon
                  sx={styles.warningIcon}
                  color="success"
                />
              )}
              <Typography color="text.primary" mb={1} mt={4} variant="h3">
                {confirmations < CONFIRMATIONS_FOR_SUCCESS
                  ? "Transaction pending confirmation"
                  : "Transaction complete"}
              </Typography>
              <Box mt={2} sx={styles.progressBox}>
                <Box sx={styles.linearProg}>
                  <LinearProgress
                    color={
                      confirmations < CONFIRMATIONS_FOR_SUCCESS
                        ? undefined
                        : "success"
                    }
                    variant="determinate"
                    value={Math.min(confirmations * 5, 100)}
                  />
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {Math.min(confirmations, CONFIRMATIONS_FOR_SUCCESS)} /{" "}
                    {CONFIRMATIONS_FOR_SUCCESS}
                  </Typography>
                </Box>
              </Box>
            </>
          ) : (
            <>
              <ErrorOutlineIcon sx={styles.warningIcon} color="info" />
              <Typography color="text.primary" mb={1} mt={4} variant="h3">
                Transaction has failed, please try again
              </Typography>
              <Typography
                color="text.primary"
                sx={styles.centeredLongText}
                variant="subtitle1"
              >
                Failure reason:
                <br />
                {error}
              </Typography>
            </>
          )}
          {!!txn?.length && (
            <Typography
              color="text.primary"
              mt={3}
              variant="subtitle1"
              sx={styles.centeredLongText}
            >
              Transaction number:
              <br />
              <Link href="#" onClick={onExplorerClick}>
                {txn}
              </Link>
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
};

const styles = {
  centeredLongText: {
    textAlign: "center",
    wordWrap: "break-word",
    width: "100%",
  },
  container: {
    height: 649,
    width: 521,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 20,
    borderColor: "#96979833",
    borderWidth: 1,
    borderStyle: "solid",
    boxShadow: 2,
  },
  fullWidth: { width: "100%" },
  input: {
    fontSize: 76,
    fontWeight: 500,
    textAlign: "center",
  },
  holdingPanelContainer: {
    display: "flex",
    width: "100%",
    flexDirection: "column",
    overflow: "hidden",
    overflowY: "auto",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  leftLongText: {
    textAlign: "left",
    wordWrap: "break-word",
  },
  linearProg: { width: "70%", mr: 1 },
  maxContainer: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "white",
    alignItems: "center",
    borderRadius: 20,
    borderColor: "#96979833",
    borderWidth: 1,
    borderStyle: "solid",
  },
  sendBox: {
    display: "flex",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  maxButton: {
    backgroundColor: "#B884541A",
    display: "flex",
    justifyContent: "center",
    color: "secondary.main",
    height: 22,
    width: 47,
    "&:hover": {
      backgroundColor: "#96979833",
    },
  },
  progressBox: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  sendButton: {
    display: "flex",
    justifyContent: "center",
    color: "text.primary",
    width: 144,
    "&:hover": {
      backgroundColor: "#96979833",
    },
  },
  sendButtonDead: {
    backgroundColor: "transparent",
  },
  sendButtonActive: {
    backgroundColor: "white",
  },
  coinLogo: {
    display: "flex",
    flexDirection: "horizontal",
    alignItems: "center",
  },
  switchContainer: {
    display: "flex",
    flexDirection: "horizontal",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
    borderRadius: 8,
  },
  warningIcon: { width: 240, height: 240 },
};
