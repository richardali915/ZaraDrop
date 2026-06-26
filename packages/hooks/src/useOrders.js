import { writable, get } from 'svelte/store';
import { callFunction, fetchOrdersForUser, createOrder, fetchMerchantRequests, fetchOpenRiderJobs, updateOrderStatus } from '@zaradrop/lib';
import { user } from './useAuth';
export const orders = writable([]);
export const merchantRequests = writable([]);
export const riderJobs = writable([]);
export const orderLoading = writable(false);
export async function loadCustomerOrders() {
    const currentUser = get(user);
    if (!currentUser?.id) {
        orders.set([]);
        return [];
    }
    orderLoading.set(true);
    try {
        const result = await fetchOrdersForUser(currentUser.id, 'customer');
        orders.set(result);
        return result;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function placeCustomerOrder(payload) {
    const currentUser = get(user);
    if (!currentUser?.id)
        throw new Error('Customer must be signed in.');
    orderLoading.set(true);
    try {
        const newOrder = await createOrder({
            customer_id: currentUser.id,
            store_id: payload.store_id,
            total: payload.total,
            payment_method: payload.payment_method,
            destination: payload.destination,
            items: payload.items,
        });
        orders.update((list) => [newOrder, ...list]);
        return newOrder;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function cancelCustomerOrder(orderId) {
    orderLoading.set(true);
    try {
        const response = await callFunction('cancel-order', {
            order_id: orderId,
            cancelled_by: 'customer',
            reason: 'Customer request',
        });
        await loadCustomerOrders();
        return response;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function loadMerchantRequests(storeId) {
    orderLoading.set(true);
    try {
        const result = await fetchMerchantRequests(storeId);
        merchantRequests.set(result);
        return result;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function approveMerchantOrder(orderId, storeId) {
    orderLoading.set(true);
    try {
        const updated = await updateOrderStatus(orderId, { status: 'accepted' });
        await loadMerchantRequests(storeId);
        return updated;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function declineMerchantOrder(orderId, storeId) {
    orderLoading.set(true);
    try {
        const updated = await updateOrderStatus(orderId, { status: 'declined' });
        await loadMerchantRequests(storeId);
        return updated;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function loadRiderJobs() {
    orderLoading.set(true);
    try {
        const result = await fetchOpenRiderJobs();
        riderJobs.set(result);
        return result;
    }
    finally {
        orderLoading.set(false);
    }
}
export async function acceptRiderJob(orderId) {
    orderLoading.set(true);
    try {
        const updated = await updateOrderStatus(orderId, { status: 'assigned' });
        await loadRiderJobs();
        return updated;
    }
    finally {
        orderLoading.set(false);
    }
}
