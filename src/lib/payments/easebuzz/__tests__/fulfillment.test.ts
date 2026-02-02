/**
 * @jest-environment node
 */
import { supabase } from "@/lib/supabase";

describe("Atomic Fulfillment RPC", () => {
  it("should call the confirm_order_and_deduct_inventory RPC", async () => {
    // Mock Supabase RPC
    const mockRpc = jest.fn().mockResolvedValue({ error: null });
    (supabase as any).rpc = mockRpc;

    const orderId = "order-123";
    const paymentId = "pay-456";
    const paymentMethod = "easebuzz";

    const { error } = await supabase.rpc("confirm_order_and_deduct_inventory", {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_payment_method: paymentMethod
    });

    expect(error).toBeNull();
    expect(mockRpc).toHaveBeenCalledWith("confirm_order_and_deduct_inventory", {
      p_order_id: orderId,
      p_payment_id: paymentId,
      p_payment_method: paymentMethod
    });
  });
});
