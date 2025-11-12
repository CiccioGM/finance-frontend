import { useEffect } from "react";
import { useTransactions } from "../context/TransactionsContext";
import AddTransactionModal from "../components/AddTransactionModal";
import { useNavigate } from "react-router-dom";

export default function AddTransactionPage() {
  const { modalOpen, setModalOpen } = useTransactions();
  const nav = useNavigate();

  useEffect(() => {
    setModalOpen(true);
    return () => setModalOpen(false);
    // eslint-disable-next-line
  }, []);

  // quando chiudi modal, torna alla dashboard
  useEffect(() => {
    if (!modalOpen) {
      nav("/");
    }
    // eslint-disable-next-line
  }, [modalOpen]);

  return <AddTransactionModal />;
}
