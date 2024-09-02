"use client";

import { ProductItem } from "@/types/product";
import {
  generateUniqueId,
  getStoredJSONValuesFromLocalStorage,
  setStoredJSONValuesToLocalStorage,
} from "@/util/helper";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface Product extends ProductItem {
  id: string;
  [key: string]: any;
}

interface CartItem extends ProductItem {
  quantity: number;
}

interface CategoryOption {
  value: string;
  label: string;
}

interface AppContextType {
  products: Product[];
  cartData: CartItem[];
  categories: CategoryOption[];
  addProduct: (value: Product) => void;
  removeProduct: (productId: string) => void;
  updateProducts: (value: Product[]) => void;
  addToCart: (product: ProductItem) => void;
  editProduct: (product: ProductItem) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  currentUser?: any;
  isLoading: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [cartData, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("https://fakestoreapi.com/products");
      const data = await response.json();

      const mappedProducts: ProductItem[] = data.map((product: any) => ({
        id: generateUniqueId(),
        name: product.title,
        category: product.category,
        price: product.price,
        imageUrl: product.image,
      }));

      const storedProducts =
        (await getStoredJSONValuesFromLocalStorage("products")) || [];
      if (storedProducts.length === 0) {
        await setStoredJSONValuesToLocalStorage("products", [
          ...storedProducts,
          ...mappedProducts,
        ]);
      }
      setProducts(() => [...storedProducts]);

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    const response = await fetch(
      "https://fakestoreapi.com/products/categories"
    );
    const data = await response.json();

    const others: string[] = [
      "home appliances",
      "books",
      "toys",
      "sports equipment",
      "automotive",
      "health and beauty",
      "groceries",
      "furniture",
      "pet supplies",
    ];
    const category = [...data, ...others];
    const mappedCategories: CategoryOption[] = [
      { value: "", label: "Select Any category" },
      ...category.map((category: string) => ({
        value: category,
        label: category.charAt(0).toUpperCase() + category.slice(1),
      })),
    ];

    setCategories(mappedCategories);
  };

  const updateProducts = async (value: Product[]) => {
    setProducts(value as Product[]);
    await setStoredJSONValuesToLocalStorage("products", value);
  };

  const addToCart = (product: ProductItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart?.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart?.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => {
      return prevCart
        .map((item) => {
          if (item.id === productId) {
            if (item.quantity > 1) {
              return { ...item, quantity: item.quantity - 1 };
            }
            return null;
          }
          return item;
        })
        .filter((item) => item !== null);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  const addProduct = (product: Product) => {
    const updatedProducts = [product, ...products];
    updateProducts(updatedProducts);
  };

  const removeProduct = (productId: string) => {
    const updatedProducts = products.filter(
      (product) => product.id !== productId
    );
    updateProducts(updatedProducts);
  };

  const editProduct = (updatedProduct: Product) => {
    const updatedProducts = products.map((product) =>
      product.id === updatedProduct.id ? updatedProduct : product
    );
    updateProducts(updatedProducts);
  };

  const fetchCart = async () => {
    const storedCart = await getStoredJSONValuesFromLocalStorage("cart");
    if (storedCart) {
      setCart(storedCart);
    }
  };

  useEffect(() => {
    setStoredJSONValuesToLocalStorage("cart", cartData);
  }, [cartData]);

  useEffect(() => {
    fetchProducts();
    fetchCart();
    fetchCategories();
  }, []);

  return (
    <AppContext.Provider
      value={{
        isLoading,
        products,
        categories,
        cartData: Array.isArray(cartData) ? cartData : [],
        updateProducts,
        addToCart,
        removeFromCart,
        clearCart,
        addProduct,
        removeProduct,
        editProduct,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppData = () => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error("useAppData must be used within an AppContextProvider");
  }

  return context;
};

export default AppContextProvider;
