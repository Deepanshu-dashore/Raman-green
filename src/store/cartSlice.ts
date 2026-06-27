import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, del, patch } from "@/lib/axios";
import { RootState } from "./index";

export interface CartItem {
  product: {
    _id: string;
    name: string;
    image: string;
    category?: string;
    slug?: string;
    description?: string;
  };
  variant: {
    _id?: string;
    weight: string;
    price: number;
    stock?: number;
    sku?: string;
    images?: string[];
  };
  quantity: number;
  price: number;
}

export interface CartModalData {
  productName: string;
  productImage: string;
  variantWeight: string;
  variantPrice: number;
  quantity: number;
  cartTotalItems: number;
  cartTotalPrice: number;
}

interface CartState {
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
  loading: boolean;
  error: string | null;
  showCartModal: boolean;
  cartModalData: CartModalData | null;
  updatingItemId: string | null; // tracks which item is being updated
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  showCartModal: false,
  cartModalData: null,
  updatingItemId: null,
};

// Local storage helper
const loadLocalCart = (): { items: CartItem[]; totalItems: number; totalPrice: number } => {
  if (typeof window === "undefined") return { items: [], totalItems: 0, totalPrice: 0 };
  try {
    // Migrate old format if exists
    const old = localStorage.getItem("rg-cart");
    if (old) {
      const parsed = JSON.parse(old);
      if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].id || typeof parsed[0] === "string")) {
        const newItems: CartItem[] = [];
        parsed.forEach((item: any) => {
          if (!item || typeof item !== "object") return;
          const idStr = item.id || "";
          const [prodId, weightVal] = idStr.split("-");
          if (!prodId) return;
          const existing = newItems.find(
            (x) => x.product._id === prodId && x.variant.weight === (weightVal || "Default")
          );
          if (existing) {
            existing.quantity += 1;
          } else {
            newItems.push({
              product: {
                _id: prodId,
                name: item.name ? item.name.replace(/\s*\(.*\)$/, "") : "Organic Product",
                image: item.image || "",
                category: item.category || "Organic",
              },
              variant: {
                weight: weightVal || "Default",
                price: item.price || 0,
              },
              quantity: 1,
              price: item.price || 0,
            });
          }
        });
        localStorage.setItem("rg-cart-new", JSON.stringify(newItems));
        localStorage.removeItem("rg-cart");
        localStorage.removeItem("rg-cart-count");
      }
    }

    const stored = localStorage.getItem("rg-cart-new");
    if (stored) {
      const items: CartItem[] = JSON.parse(stored);
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
      const totalPrice = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
      return { items, totalItems, totalPrice };
    }
  } catch (e) {
    console.error("Failed to parse local cart", e);
  }
  return { items: [], totalItems: 0, totalPrice: 0 };
};

const saveLocalCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("rg-cart-new", JSON.stringify(items));
    // Also sync old keys for backward compatibility in static layout checks if any
    const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);
    localStorage.setItem("rg-cart-count", totalCount.toString());
    window.dispatchEvent(new Event("storage"));
  } catch (e) {
    console.error("Failed to save local cart", e);
  }
};

// Async thunks
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isAuthenticated = !!state.auth.user;
      if (isAuthenticated) {
        const response = await get<any>("/api/cart");
        return response.data; // Mongoose cart object
      } else {
        return { items: [], totalItems: 0, totalPrice: 0 };
      }
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch cart");
    }
  }
);

export const addItemToCart = createAsyncThunk(
  "cart/addItemToCart",
  async (
    payload: { productId: string; variant: any; quantity: number; productInfo?: any },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const isAuthenticated = !!state.auth.user;
      if (!isAuthenticated) {
        return rejectWithValue("Please log in to add items to cart.");
      }
      const response = await post<any>("/api/cart", {
        productId: payload.productId,
        variant: payload.variant,
        quantity: payload.quantity,
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to add item to cart");
    }
  }
);

export const removeItemFromCart = createAsyncThunk(
  "cart/removeItemFromCart",
  async (payload: { productId: string; variant: any }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isAuthenticated = !!state.auth.user;
      if (!isAuthenticated) {
        return rejectWithValue("Please log in to manage cart.");
      }
      const response = await del<any>("/api/cart", {
        data: {
          productId: payload.productId,
          variant: payload.variant,
        },
      });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to remove item from cart");
    }
  }
);

export const updateItemQuantity = createAsyncThunk(
  "cart/updateItemQuantity",
  async (
    payload: { productId: string; variant: any; quantity: number; productInfo?: any },
    { getState, rejectWithValue }
  ) => {
    try {
      const state = getState() as RootState;
      const isAuthenticated = !!state.auth.user;
      if (!isAuthenticated) {
        return rejectWithValue("Please log in to manage cart.");
      }
      const currentItem = state.cart.items.find(
        (item) =>
          item.product._id === payload.productId &&
          JSON.stringify(item.variant) === JSON.stringify(payload.variant)
      );
      const currentQty = currentItem ? currentItem.quantity : 0;
      const diff = payload.quantity - currentQty;

      if (diff === 0) return state.cart;

      const response = await patch<any>(`/api/cart/${payload.productId}/${encodeURIComponent(JSON.stringify(payload.variant))}`,
        {
          quantity: diff,
        });
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to update quantity");
    }
  }
);

export const mergeLocalCartToBackend = createAsyncThunk(
  "cart/mergeLocalCartToBackend",
  async (_, { getState, rejectWithValue }) => {
    try {
      const state = getState() as RootState;
      const isAuthenticated = !!state.auth.user;
      if (!isAuthenticated) return { items: [], totalItems: 0, totalPrice: 0 };

      // Since local guest cart is disabled, just retrieve backend cart
      const response = await get<any>("/api/cart");
      return response.data;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to fetch cart");
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    clearCartState(state) {
      state.items = [];
      state.totalItems = 0;
      state.totalPrice = 0;
      if (typeof window !== "undefined") {
        localStorage.removeItem("rg-cart-new");
        localStorage.removeItem("rg-cart");
        localStorage.removeItem("rg-cart-count");
      }
    },
    showCartModal(state, action: PayloadAction<CartModalData>) {
      state.showCartModal = true;
      state.cartModalData = action.payload;
    },
    hideCartModal(state) {
      state.showCartModal = false;
      state.cartModalData = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchCart
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems ?? 0;
          state.totalPrice = action.payload.totalPrice ?? 0;
        }
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // addItemToCart
       .addCase(updateItemQuantity.pending, (state, action) => {
         state.loading = true;
         state.updatingItemId = `${action.meta.arg.productId}-${JSON.stringify(action.meta.arg.variant)}`;
         state.error = null;
       })
       .addCase(updateItemQuantity.fulfilled, (state, action) => {
         state.loading = false;
         state.updatingItemId = null;
         const updated = action.payload;
         if (updated && updated.items) {
           state.items = updated.items;
           state.totalItems = updated.totalItems;
           state.totalPrice = updated.totalPrice;
         }
       })
       .addCase(updateItemQuantity.rejected, (state, action) => {
         state.loading = false;
         state.updatingItemId = null;
         state.error = action.error.message || "Failed to update quantity";
       })
       // addItemToCart
      .addCase(addItemToCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addItemToCart.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems ?? 0;
          state.totalPrice = action.payload.totalPrice ?? 0;
        }
      })
      .addCase(addItemToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // removeItemFromCart
      .addCase(removeItemFromCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeItemFromCart.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems ?? 0;
          state.totalPrice = action.payload.totalPrice ?? 0;
        }
      })
      .addCase(removeItemFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // mergeLocalCartToBackend
      .addCase(mergeLocalCartToBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(mergeLocalCartToBackend.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems ?? 0;
          state.totalPrice = action.payload.totalPrice ?? 0;
        }
      })
      .addCase(mergeLocalCartToBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearCartState, showCartModal, hideCartModal } = cartSlice.actions;
export default cartSlice.reducer;
