// supabase/functions/cancel-order/index.ts
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { handleCors, json, err } from "../_shared/cors.ts";
// Statuses that can still be cancelled
const CUSTOMER_CANCELLABLE = ["pending", "confirmed", "preparing"];
const RIDER_CANCELLABLE = ["assigned", "preparing"]; // before picked_up
// How many rider cancellations trigger a rating penalty
const CANCELLATION_PENALTY_THRESHOLD = 5;
const RATING_DEDUCTION = 0.1;
serve(async (req) => {
    const cors = handleCors(req);
    if (cors)
        return cors;
    const supabase = createClient(Deno.env.get("SUPABASE_URL"), Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));
    // Auth
    const authHeader = req.headers.get("Authorization");
    const { data: { user }, error: authErr } = await supabase.auth.getUser(authHeader?.replace("Bearer ", "") ?? "");
    if (authErr || !user)
        return err("Unauthorized", 401);
    const { order_id, reason, cancelled_by } = await req.json();
    if (!order_id)
        return err("Missing order_id");
    // ── Fetch order ────────────────────────────────────────────
    const { data: order } = await supabase
        .from("orders")
        .select("id, order_code, status, customer_id, rider_id, store_id, total, payment_method, payment_status, stores(owner_id, name)")
        .eq("id", order_id)
        .single();
    if (!order)
        return err("Order not found", 404);
    // ── CUSTOMER CANCELLATION ──────────────────────────────────
    if (cancelled_by === "customer") {
        if (order.customer_id !== user.id)
            return err("Not your order", 403);
        if (!CUSTOMER_CANCELLABLE.includes(order.status)) {
            return err(`Cannot cancel order in status: '${order.status}'. Only pending/confirmed/preparing orders can be cancelled.`);
        }
        // Mark order cancelled
        await supabase.from("orders")
            .update({ status: "cancelled" })
            .eq("id", order_id);
        // Refund wallet if paid by wallet
        if (order.payment_method === "wallet" && order.payment_status === "paid") {
            const { data: wallet } = await supabase
                .from("wallets").select("id, balance").eq("user_id", user.id).single();
            if (wallet) {
                const newBal = wallet.balance + order.total;
                await supabase.from("wallets").update({ balance: newBal }).eq("id", wallet.id);
                await supabase.from("wallet_transactions").insert({
                    wallet_id: wallet.id,
                    type: "credit",
                    amount: order.total,
                    description: `Refund – Order #${order.order_code}`,
                    icon: "↩️",
                    method: "Auto Refund",
                    balance_after: newBal,
                    order_id: order.id,
                });
            }
        }
        // Notify store
        const storeOwnerId = order.stores?.owner_id;
        if (storeOwnerId) {
            await supabase.from("notifications").insert({
                user_id: storeOwnerId,
                title: "Order Cancelled ❌",
                body: `Order #${order.order_code} was cancelled by the customer. Reason: ${reason}`,
                type: "cancelled",
                icon: "❌",
                data: { order_id: order.id },
            });
        }
        // Notify rider if one was assigned
        if (order.rider_id) {
            await supabase.from("notifications").insert({
                user_id: order.rider_id,
                title: "Order Cancelled",
                body: `Order #${order.order_code} from ${order.stores?.name} was cancelled by the customer.`,
                type: "cancelled",
                icon: "❌",
                data: { order_id: order.id },
            });
        }
        // Notify customer confirmation
        await supabase.from("notifications").insert({
            user_id: order.customer_id,
            title: "Order Cancelled",
            body: order.payment_method === "wallet"
                ? `Your order #${order.order_code} was cancelled. Refund of ₦${(order.total / 100).toLocaleString()} sent to your wallet.`
                : `Your order #${order.order_code} was cancelled.`,
            type: "cancelled",
            icon: "↩️",
            data: { order_id: order.id },
        });
        return json({
            success: true,
            refunded: order.payment_method === "wallet",
            amount: order.total,
        });
    }
    // ── RIDER JOB CANCELLATION ─────────────────────────────────
    if (cancelled_by === "rider") {
        if (order.rider_id !== user.id)
            return err("Not your job", 403);
        if (!RIDER_CANCELLABLE.includes(order.status)) {
            return err(`Cannot cancel job in status: '${order.status}'. Only assigned/preparing jobs can be un-grabbed.`);
        }
        // Un-assign rider — put order back to 'ready' so another rider can grab it
        await supabase.from("orders")
            .update({ status: "ready", rider_id: null, eta: null })
            .eq("id", order_id);
        // Track daily cancellation count for this rider
        const today = new Date().toISOString().split("T")[0];
        const { data: stats } = await supabase
            .from("rider_daily_stats")
            .select("id, cancellations")
            .eq("rider_id", user.id)
            .eq("stat_date", today)
            .maybeSingle();
        const newCancellations = (stats?.cancellations ?? 0) + 1;
        await supabase.from("rider_daily_stats").upsert({
            rider_id: user.id,
            stat_date: today,
            cancellations: newCancellations,
        }, { onConflict: "rider_id,stat_date" });
        let ratingPenalised = false;
        // Penalty: 5+ cancellations in one day → -0.1 rating + warning
        if (newCancellations >= CANCELLATION_PENALTY_THRESHOLD) {
            const { data: rp } = await supabase
                .from("rider_profiles").select("id, rating").eq("id", user.id).single();
            if (rp) {
                const newRating = Math.max(1.0, parseFloat((rp.rating - RATING_DEDUCTION).toFixed(1)));
                await supabase.from("rider_profiles").update({ rating: newRating }).eq("id", user.id);
                ratingPenalised = true;
                await supabase.from("notifications").insert({
                    user_id: user.id,
                    title: "⚠️ Rating Warning",
                    body: `You've cancelled ${newCancellations} deliveries today. Your rating dropped to ${newRating}. Excessive cancellations affect your account standing.`,
                    type: "rider_cancelled",
                    icon: "⚠️",
                    data: { cancellations: newCancellations, rating: newRating },
                });
            }
        }
        else {
            // Standard cancellation notice
            await supabase.from("notifications").insert({
                user_id: user.id,
                title: "Job Cancelled",
                body: `You cancelled order #${order.order_code}. ${CANCELLATION_PENALTY_THRESHOLD - newCancellations} more today and your rating will be affected.`,
                type: "rider_cancelled",
                icon: "⚠️",
                data: { order_id: order.id, cancellations: newCancellations },
            });
        }
        // Notify store to re-assign
        const storeOwnerId = order.stores?.owner_id;
        if (storeOwnerId) {
            await supabase.from("notifications").insert({
                user_id: storeOwnerId,
                title: "Rider Dropped Job",
                body: `The rider for Order #${order.order_code} cancelled. Your order is back in the queue for re-assignment.`,
                type: "rider_cancelled",
                icon: "🔄",
                data: { order_id: order.id },
            });
        }
        // Notify customer
        await supabase.from("notifications").insert({
            user_id: order.customer_id,
            title: "Finding a New Rider 🔍",
            body: `Your rider had to cancel Order #${order.order_code}. We're finding a new rider for you now.`,
            type: "rider_cancelled",
            icon: "🔍",
            data: { order_id: order.id },
        });
        return json({
            success: true,
            cancellations_today: newCancellations,
            rating_penalised: ratingPenalised,
        });
    }
    return err("Unknown cancelled_by value. Use 'customer' or 'rider'.");
});
