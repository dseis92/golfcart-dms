"use client";
import { useEffect, useState } from "react";
import { onSnapshot } from "firebase/firestore";

export function useFirestoreQuery(queryRef) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!queryRef) return;
    const unsub = onSnapshot(
      queryRef,
      (snap) => {
        setData(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => {
        setError(err.message || "Failed to load");
        setLoading(false);
      }
    );
    return () => unsub();
  }, [queryRef]);

  return { data, loading, error };
}
