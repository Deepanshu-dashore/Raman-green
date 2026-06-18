"use client";

import React, { useEffect } from "react";
import { Provider } from "react-redux";
import { store } from "@/store";
import { fetchMe } from "@/store/authSlice";
import { fetchCart, mergeLocalCartToBackend } from "@/store/cartSlice";

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Fetch initial user data, then resolve cart loading/merging
    store.dispatch(fetchMe())
      .unwrap()
      .then(() => {
        store.dispatch(mergeLocalCartToBackend());
      })
      .catch(() => {
        store.dispatch(fetchCart());
      });
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
