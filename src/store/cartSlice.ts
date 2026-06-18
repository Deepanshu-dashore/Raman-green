import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { get, post, del } from "@/lib/axios";
import { RootState } from "./index";

export interface CartItem {
  product: {
    _id: string;
    name: string;
    image: string;
    category?: string;
    slug?: string;
  };
  variant: {
    _id?: string;
    weight: string;
    price: number;
    stock?: number;
    sku?: string;
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
}

const initialState: CartState = {
  items: [],
  totalItems: 0,
  totalPrice: 0,
  loading: false,
  error: null,
  showCartModal: false,
  cartModalData: null,
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
        return loadLocalCart();
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
      if (isAuthenticated) {
        const response = await post<any>("/api/cart", {
          productId: payload.productId,
          variant: payload.variant,
          quantity: payload.quantity,
        });
        return response.data;
      } else {
        // Guest user local storage implementation
        const local = loadLocalCart();
        const existingIndex = local.items.findIndex(
          (item) =>
            item.product._id === payload.productId &&
            JSON.stringify(item.variant) === JSON.stringify(payload.variant)
        );

        const price = payload.variant?.discountedPrice || payload.variant?.price || payload.variant?.basePrice || 0;

        if (existingIndex > -1) {
          local.items[existingIndex].quantity += payload.quantity;
          local.items[existingIndex].price = price;
        } else {
          local.items.push({
            product: {
              _id: payload.productId,
              name: payload.productInfo?.name || "Organic Product",
              image: payload.productInfo?.image || "",
              category: payload.productInfo?.category || "Organic",
            },
            variant: payload.variant,
            quantity: payload.quantity,
            price: price,
          });
        }
        saveLocalCart(local.items);
        return loadLocalCart();
      }
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
      if (isAuthenticated) {
        // DELETE /api/cart with body is sent via custom wrapper
        const response = await del<any>("/api/cart", {
          data: {
            productId: payload.productId,
            variant: payload.variant,
          },
        });
        return response.data;
      } else {
        // Guest user local storage implementation
        const local = loadLocalCart();
        const updatedItems = local.items.filter(
          (item) =>
            !(
              item.product._id === payload.productId &&
              JSON.stringify(item.variant) === JSON.stringify(payload.variant)
            )
        );
        saveLocalCart(updatedItems);
        return loadLocalCart();
      }
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
      if (isAuthenticated) {
        // Re-adding item with relative change or set absolute.
        // On backend, we can set absolute by posting a custom update or addToCart relative.
        // Currently CartController.addToCart adds quantity relatively: cart.items[itemIndex].quantity += quantity.
        // To set an absolute quantity, we can calculate the difference: diff = target - current
        const currentItem = state.cart.items.find(
          (item) =>
            item.product._id === payload.productId &&
            JSON.stringify(item.variant) === JSON.stringify(payload.variant)
        );
        const currentQty = currentItem ? currentItem.quantity : 0;
        const diff = payload.quantity - currentQty;

        if (diff === 0) return state.cart;

        const response = await post<any>("/api/cart", {
          productId: payload.productId,
          variant: payload.variant,
          quantity: diff,
        });
        return response.data;
      } else {
        const local = loadLocalCart();
        const idx = local.items.findIndex(
          (item) =>
            item.product._id === payload.productId &&
            JSON.stringify(item.variant) === JSON.stringify(payload.variant)
        );
        if (idx > -1) {
          if (payload.quantity <= 0) {
            local.items = local.items.filter((_, i) => i !== idx);
          } else {
            local.items[idx].quantity = payload.quantity;
          }
          saveLocalCart(local.items);
        }
        return loadLocalCart();
      }
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
      if (!isAuthenticated) return loadLocalCart();

      const local = loadLocalCart();
      if (local.items.length === 0) {
        const response = await get<any>("/api/cart");
        return response.data;
      }

      // Loop through local items and add them to backend cart
      let lastCart = null;
      for (const item of local.items) {
        const res = await post<any>("/api/cart", {
          productId: item.product._id,
          variant: item.variant,
          quantity: item.quantity,
        });
        lastCart = res.data;
      }

      // Clear local storage cart once merged
      if (typeof window !== "undefined") {
        localStorage.removeItem("rg-cart-new");
        localStorage.removeItem("rg-cart");
        localStorage.removeItem("rg-cart-count");
      }

      return lastCart;
    } catch (err: any) {
      return rejectWithValue(err.message || "Failed to merge local cart to backend");
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
      // updateItemQuantity
      .addCase(updateItemQuantity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateItemQuantity.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        if (action.payload) {
          state.items = action.payload.items || [];
          state.totalItems = action.payload.totalItems ?? 0;
          state.totalPrice = action.payload.totalPrice ?? 0;
        }
      })
      .addCase(updateItemQuantity.rejected, (state, action) => {
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
