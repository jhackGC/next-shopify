import { useCart } from "@/contexts/CartContext";
import { formatMoney } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cart,
    isLoading,
    totalQuantity,
    isEmpty,
    checkoutUrl,
    updateLineQuantity,
    removeItem,
    clearCart,
  } = useCart();

  const handleQuantityChange = async (lineId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(lineId);
    } else {
      await updateLineQuantity(lineId, quantity);
    }
  };

  const handleCheckout = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, "_blank");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md">
          <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
            {/* Header */}
            <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
              <div className="flex items-start justify-between">
                <h2 className="text-lg font-medium text-gray-900">
                  Shopping cart ({totalQuantity})
                </h2>
                <div className="ml-3 flex h-7 items-center">
                  <button
                    type="button"
                    className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <span className="absolute -inset-0.5" />
                    <span className="sr-only">Close panel</span>
                    <svg
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Cart Items */}
              <div className="mt-8">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-900" />
                  </div>
                ) : isEmpty ? (
                  <div className="text-center py-12">
                    <svg
                      className="mx-auto h-12 w-12 text-gray-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      Your cart is empty
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Start adding some items to your cart!
                    </p>
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                      >
                        Continue Shopping
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flow-root">
                    <ul role="list" className="-my-6 divide-y divide-gray-200">
                      {cart?.lines.edges.map((line) => {
                        const lineItem = line.node;
                        const merchandise = lineItem.merchandise;

                        return (
                          <li key={lineItem.id} className="flex py-6">
                            <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                              {merchandise.image ? (
                                <Image
                                  src={merchandise.image.url}
                                  alt={
                                    merchandise.image.altText ||
                                    merchandise.product.title
                                  }
                                  width={96}
                                  height={96}
                                  className="h-full w-full object-cover object-center"
                                />
                              ) : (
                                <div className="h-full w-full bg-gray-200 flex items-center justify-center">
                                  <span className="text-gray-400 text-xs">
                                    No image
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="ml-4 flex flex-1 flex-col">
                              <div>
                                <div className="flex justify-between text-base font-medium text-gray-900">
                                  <h3>
                                    <Link
                                      href={
                                        `/products/${merchandise.product.handle}` as any
                                      }
                                    >
                                      {merchandise.product.title}
                                    </Link>
                                  </h3>
                                  <p className="ml-4">
                                    {formatMoney(lineItem.cost.totalAmount)}
                                  </p>
                                </div>
                                {merchandise.title !== "Default Title" && (
                                  <p className="mt-1 text-sm text-gray-500">
                                    {merchandise.title}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-1 items-end justify-between text-sm">
                                <div className="flex items-center space-x-2">
                                  <label
                                    htmlFor={`quantity-${lineItem.id}`}
                                    className="sr-only"
                                  >
                                    Quantity
                                  </label>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        lineItem.id,
                                        lineItem.quantity - 1
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                  >
                                    <span className="sr-only">
                                      Decrease quantity
                                    </span>
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M20 12H4"
                                      />
                                    </svg>
                                  </button>
                                  <span className="text-gray-500 px-2 py-1 min-w-[2rem] text-center">
                                    {lineItem.quantity}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleQuantityChange(
                                        lineItem.id,
                                        lineItem.quantity + 1
                                      )
                                    }
                                    className="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 bg-white text-gray-600 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    disabled={isLoading}
                                  >
                                    <span className="sr-only">
                                      Increase quantity
                                    </span>
                                    <svg
                                      className="h-4 w-4"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 6v12m6-6H6"
                                      />
                                    </svg>
                                  </button>
                                </div>

                                <div className="flex">
                                  <button
                                    type="button"
                                    onClick={() => removeItem(lineItem.id)}
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                    disabled={isLoading}
                                  >
                                    Remove
                                  </button>
                                </div>
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            {!isEmpty && (
              <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                <div className="flex justify-between text-base font-medium text-gray-900">
                  <p>Subtotal</p>
                  <p>
                    {cart?.cost.subtotalAmount &&
                      formatMoney(cart.cost.subtotalAmount)}
                  </p>
                </div>
                <p className="mt-0.5 text-sm text-gray-500">
                  Shipping and taxes calculated at checkout.
                </p>
                <div className="mt-6 space-y-4">
                  <button
                    type="button"
                    onClick={handleCheckout}
                    disabled={isLoading || !checkoutUrl}
                    className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      "Checkout"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                  >
                    Continue Shopping
                  </button>
                  {totalQuantity > 0 && (
                    <button
                      type="button"
                      onClick={clearCart}
                      disabled={isLoading}
                      className="flex w-full items-center justify-center text-sm font-medium text-red-600 hover:text-red-500 disabled:opacity-50"
                    >
                      Clear Cart
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
