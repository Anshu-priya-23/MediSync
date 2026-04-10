const Cart = require("../models/Cart");
const Order = require("../models/Order");
const inventoryClient = require("../services/inventoryClient");
const eventPublisher = require("../services/eventPublisher");

const CHECKOUT_LOCK_MS = 2 * 60 * 1000;
const MAX_ITEM_QUANTITY = 20;
const IST_OFFSET_MINUTES = 5 * 60 + 30;
const SLOT_START_HOUR_IST = 9;
const SLOT_LAST_START_HOUR_IST = 20;
const SLOT_LEAD_TIME_MINUTES = 60;
const ORDER_STATUS = [
  "placed",
  "payment_pending",
  "confirmed",
  "ready_for_pickup",
  "picked_up",
  "cancelled",
];
const USER_CANCELLABLE_STATUSES = ["placed", "payment_pending", "confirmed", "ready_for_pickup"];

function toNumber(value, defaultValue = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : defaultValue;
}

function toIstPseudoDate(date) {
  return new Date(date.getTime() + IST_OFFSET_MINUTES * 60 * 1000);
}

function getIstPartsFromDate(date) {
  const istDate = toIstPseudoDate(date);
  return {
    year: istDate.getUTCFullYear(),
    monthIndex: istDate.getUTCMonth(),
    day: istDate.getUTCDate(),
    hour: istDate.getUTCHours(),
    minute: istDate.getUTCMinutes(),
  };
}

function createUtcDateFromIstParts(year, monthIndex, day, hour, minute = 0) {
  const utcMs = Date.UTC(year, monthIndex, day, hour, minute, 0, 0) - IST_OFFSET_MINUTES * 60 * 1000;
  return new Date(utcMs);
}

function formatIstDateKey(date) {
  const ist = getIstPartsFromDate(date);
  return `${ist.year}-${String(ist.monthIndex + 1).padStart(2, "0")}-${String(ist.day).padStart(2, "0")}`;
}

function formatCart(cart) {
  return {
    userId: cart.userId,
    items: cart.items.map((item) => ({
      medicineId: item.medicineId,
      medicineName: item.medicineName,
      category: item.category,
      imageData: item.imageData || "",
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      lineTotal: item.lineTotal,
    })),
    totalItems: cart.totalItems,
    subtotal: cart.subtotal,
    currency: cart.currency,
    updatedAt: cart.updatedAt,
  };
}

async function hydrateCartImages(cart) {
  if (!cart?.items?.length) {
    return cart;
  }

  let updated = false;

  for (const item of cart.items) {
    if (String(item.imageData || "").trim()) {
      continue;
    }

    try {
      const medicine = await inventoryClient.getMedicineById(item.medicineId);
      item.imageData = medicine?.imageData || "";
      if (item.imageData) {
        updated = true;
      }
    } catch (_error) {
      continue;
    }
  }

  if (updated) {
    await cart.save();
  }

  return cart;
}

function formatOrder(order) {
  return {
    id: order._id,
    orderNumber: order.orderNumber,
    userId: order.userId,
    items: order.items,
    totalItems: order.totalItems,
    subtotal: order.subtotal,
    tax: order.tax,
    deliveryFee: order.deliveryFee,
    totalAmount: order.totalAmount,
    currency: order.currency,
    pickupSlot: order.pickupSlot,
    address: order.address,
    status: order.status,
    paymentStatus: order.paymentStatus,
    inventoryStatus: order.inventoryStatus,
    statusHistory: order.statusHistory,
    note: order.note,
    placedAt: order.placedAt,
    updatedAt: order.updatedAt,
  };
}

async function hydrateOrderImages(order) {
  if (!order?.items?.length) {
    return order;
  }

  let updated = false;

  for (const item of order.items) {
    if (String(item.imageData || "").trim()) {
      continue;
    }

    try {
      const medicine = await inventoryClient.getMedicineById(item.medicineId);
      item.imageData = medicine?.imageData || "";
      if (item.imageData) {
        updated = true;
      }
    } catch (_error) {
      continue;
    }
  }

  if (updated) {
    await order.save();
  }

  return order;
}

function generateOrderNumber() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `MS-${yyyy}${mm}${dd}-${rand}`;
}

function generatePickupSlots(days = 3) {
  const slots = [];
  const nowUtc = new Date();
  const cutoffUtc = new Date(nowUtc.getTime() + SLOT_LEAD_TIME_MINUTES * 60 * 1000);
  const nowIst = getIstPartsFromDate(nowUtc);

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    for (let startHour = SLOT_START_HOUR_IST; startHour <= SLOT_LAST_START_HOUR_IST; startHour += 1) {
      const endHour = startHour + 1;
      const slotStartUtc = createUtcDateFromIstParts(
        nowIst.year,
        nowIst.monthIndex,
        nowIst.day + dayOffset,
        startHour,
        0
      );

      if (slotStartUtc.getTime() <= cutoffUtc.getTime()) {
        continue;
      }

      slots.push({
        id: `${formatIstDateKey(slotStartUtc)}-H${String(startHour).padStart(2, "0")}`,
        date: slotStartUtc.toISOString(),
        label: `${String(startHour).padStart(2, "0")}:00 - ${String(endHour).padStart(2, "0")}:00`,
      });
    }
  }

  return slots;
}

function getPickupSlotStartAt(pickupSlot) {
  if (!pickupSlot?.date) {
    return null;
  }

  const baseDateUtc = new Date(pickupSlot.date);
  if (Number.isNaN(baseDateUtc.getTime())) {
    return null;
  }

  const label = String(pickupSlot.label || "");
  const match = label.match(/(\d{1,2})\s*:\s*(\d{2})/);
  if (!match) {
    return baseDateUtc;
  }

  const startHour = Math.min(23, Math.max(0, Number(match[1])));
  const startMinute = Math.min(59, Math.max(0, Number(match[2])));
  const baseIst = getIstPartsFromDate(baseDateUtc);
  return createUtcDateFromIstParts(baseIst.year, baseIst.monthIndex, baseIst.day, startHour, startMinute);
}

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ userId });
  if (!cart) {
    cart = await Cart.create({ userId, items: [] });
  }
  return cart;
}

async function mutateCart(userId, mutator) {
  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    const cart = await getOrCreateCart(userId);
    mutator(cart);
    cart.recalculate();

    try {
      await cart.save();
      return cart;
    } catch (error) {
      if (error.name === "VersionError" && attempt < maxRetries) {
        continue;
      }
      throw error;
    }
  }

  throw new Error("Unable to update cart due to concurrent updates");
}

async function saveOrderSafely(order) {
  try {
    await order.save();
  } catch (error) {
    if (error.name === "VersionError") {
      const conflict = new Error("Order update conflict detected. Please retry.");
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }
}

exports.listMedicines = async (req, res) => {
  const medicines = await inventoryClient.fetchMedicines({
    q: req.query.q,
    category: req.query.category,
  });

  res.status(200).json({
    items: medicines.map((medicine) => ({
      id: medicine._id || medicine.id || medicine.medicineId,
      name: medicine.name,
      description: medicine.description || "",
      category: medicine.category || "General",
      price: toNumber(medicine.price),
      stock: toNumber(medicine.availableStock, toNumber(medicine.stock)),
      availableStock: toNumber(medicine.availableStock, toNumber(medicine.stock)),
      manufacturer: medicine.manufacturer || "Unknown",
      imageData: medicine.imageData || "",
      expiryDate: medicine.expiryDate || null,
      batchNo: medicine.batchNo || "",
      supplierId: medicine.supplierId || null,
    })),
  });
};

exports.getPickupSlots = async (req, res) => {
  const slots = generatePickupSlots(4);
  res.status(200).json({ items: slots });
};

exports.getCart = async (req, res) => {
  const cart = await getOrCreateCart(req.user.userId);
  cart.recalculate();
  await hydrateCartImages(cart);
  await cart.save();
  res.status(200).json({ cart: formatCart(cart) });
};

exports.addToCart = async (req, res) => {
  const medicineId = String(req.body.medicineId || "").trim();
  const requestedQty = Math.max(1, Math.floor(toNumber(req.body.quantity, 1)));

  if (!medicineId) {
    return res.status(400).json({ message: "medicineId is required" });
  }

  if (requestedQty > MAX_ITEM_QUANTITY) {
    return res.status(400).json({
      message: `Quantity cannot exceed ${MAX_ITEM_QUANTITY} per item`,
    });
  }

  const medicine = await inventoryClient.getMedicineById(medicineId);
  if (!medicine) {
    return res.status(404).json({ message: "Medicine not found" });
  }

  if (requestedQty > toNumber(medicine.availableStock, toNumber(medicine.stock, 0))) {
    return res.status(409).json({ message: "Requested quantity exceeds stock" });
  }

  const cart = await mutateCart(req.user.userId, (editableCart) => {
    const current = editableCart.items.find((item) => item.medicineId === medicineId);
    if (current) {
      current.quantity = Math.min(current.quantity + requestedQty, MAX_ITEM_QUANTITY);
      current.imageData = current.imageData || medicine.imageData || "";
    } else {
      editableCart.items.push({
        medicineId,
        medicineName: medicine.name,
        category: medicine.category || "General",
        imageData: medicine.imageData || "",
        unitPrice: toNumber(medicine.price, 0),
        quantity: requestedQty,
      });
    }
  });

  await hydrateCartImages(cart);
  return res.status(200).json({ cart: formatCart(cart) });
};

exports.updateCartItem = async (req, res) => {
  const medicineId = String(req.params.medicineId || "").trim();
  const nextQuantity = Math.floor(toNumber(req.body.quantity, 0));

  if (!medicineId) {
    return res.status(400).json({ message: "medicineId is required" });
  }

  if (nextQuantity > MAX_ITEM_QUANTITY) {
    return res.status(400).json({
      message: `Quantity cannot exceed ${MAX_ITEM_QUANTITY} per item`,
    });
  }

  const medicine = await inventoryClient.getMedicineById(medicineId);
  if (!medicine) {
    return res.status(404).json({ message: "Medicine not found" });
  }

  if (nextQuantity > toNumber(medicine.availableStock, toNumber(medicine.stock, 0))) {
    return res.status(409).json({ message: "Requested quantity exceeds stock" });
  }

  const cart = await mutateCart(req.user.userId, (editableCart) => {
    const index = editableCart.items.findIndex((item) => item.medicineId === medicineId);
    if (index === -1) {
      throw new Error("ITEM_NOT_FOUND");
    }

    if (nextQuantity <= 0) {
      editableCart.items.splice(index, 1);
    } else {
      editableCart.items[index].quantity = nextQuantity;
    }
  }).catch((error) => {
    if (error.message === "ITEM_NOT_FOUND") {
      return null;
    }
    throw error;
  });

  if (!cart) {
    return res.status(404).json({ message: "Cart item not found" });
  }

  await hydrateCartImages(cart);
  return res.status(200).json({ cart: formatCart(cart) });
};

exports.removeFromCart = async (req, res) => {
  const medicineId = String(req.params.medicineId || "").trim();

  const cart = await mutateCart(req.user.userId, (editableCart) => {
    editableCart.items = editableCart.items.filter((item) => item.medicineId !== medicineId);
  });

  await hydrateCartImages(cart);
  return res.status(200).json({ cart: formatCart(cart) });
};

exports.clearCart = async (req, res) => {
  const cart = await mutateCart(req.user.userId, (editableCart) => {
    editableCart.items = [];
  });
  return res.status(200).json({ cart: formatCart(cart) });
};

exports.checkout = async (req, res) => {
  const userId = req.user.userId;
  const requestedSlot = req.body.pickupSlot;
  const selectedAddress = String(req.body.address || "").trim();
  const note = String(req.body.note || "").trim();
  const idempotencyKey = String(
    req.headers["idempotency-key"] || req.body.idempotencyKey || ""
  ).trim();

  if (!selectedAddress) {
    return res.status(400).json({
      message: "address is required",
    });
  }

  if (!requestedSlot || !requestedSlot.date || !requestedSlot.label) {
    return res.status(400).json({
      message: "pickupSlot.date and pickupSlot.label are required",
    });
  }

  const selectedPickupStartAt = getPickupSlotStartAt(requestedSlot);
  if (!selectedPickupStartAt || selectedPickupStartAt.getTime() <= Date.now()) {
    return res.status(400).json({
      message: "Selected pickup slot is not available. Please choose a future slot.",
    });
  }

  if (idempotencyKey) {
    const existingOrder = await Order.findOne({ userId, idempotencyKey }).sort({
      createdAt: -1,
    });

    if (existingOrder) {
      return res.status(200).json({
        message: "Order already created for this idempotency key",
        order: formatOrder(existingOrder),
      });
    }
  }

  const now = new Date();
  const lockUntil = new Date(now.getTime() + CHECKOUT_LOCK_MS);

  const cart = await Cart.findOneAndUpdate(
    {
      userId,
      $or: [{ isLocked: false }, { lockExpiresAt: { $lte: now } }],
    },
    {
      $set: {
        isLocked: true,
        lockExpiresAt: lockUntil,
      },
    },
    { new: true }
  );

  if (!cart) {
    return res.status(409).json({
      message: "Checkout already in progress. Please retry in a moment.",
    });
  }

  let stockReserved = false;
  let checkoutItems = [];

  try {
    cart.recalculate();
    await cart.save();

    if (!cart.items.length) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    checkoutItems = cart.items.map((item) => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
    }));

    const stockCheck = await inventoryClient.verifyStock(cart.items);
    if (!stockCheck.ok) {
      return res.status(409).json({
        message: "Some medicines are out of stock",
        unavailable: stockCheck.unavailable || [],
      });
    }

    const orderNumber = generateOrderNumber();

    const reserveResult = await inventoryClient.reserveStock(cart.items, orderNumber);
    if (!reserveResult.ok) {
      return res.status(409).json({
        message: reserveResult.message || "Unable to reserve stock",
        unavailable: reserveResult.unavailable || [],
      });
    }
    stockReserved = true;

    const tax = Number((cart.subtotal * 0.05).toFixed(2));
    const deliveryFee = 0;
    const totalAmount = Number((cart.subtotal + tax + deliveryFee).toFixed(2));

    let order;

    try {
      order = await Order.create({
        orderNumber,
        userId,
        items: cart.items.map((item) => ({
          medicineId: item.medicineId,
          medicineName: item.medicineName,
          category: item.category,
          imageData: item.imageData || "",
          unitPrice: item.unitPrice,
          quantity: item.quantity,
          lineTotal: item.lineTotal,
        })),
        totalItems: cart.totalItems,
        subtotal: cart.subtotal,
        tax,
        deliveryFee,
        totalAmount,
        currency: cart.currency,
        pickupSlot: {
          date: selectedPickupStartAt,
          label: requestedSlot.label,
        },
        address: selectedAddress,
        status: "payment_pending",
        paymentStatus: "pending",
        inventoryStatus: "deducted",
        idempotencyKey: idempotencyKey || undefined,
        note,
        statusHistory: [
          {
            status: "payment_pending",
            updatedBy: userId,
            note: "Order created and waiting for payment",
          },
        ],
        placedAt: new Date(),
      });
    } catch (error) {
      const duplicateKeyError = error?.code === 11000;
      if (!duplicateKeyError || !idempotencyKey) {
        throw error;
      }

      const existingOrder = await Order.findOne({ userId, idempotencyKey }).sort({ createdAt: -1 });
      if (existingOrder) {
        if (stockReserved && checkoutItems.length) {
          await inventoryClient.releaseStock(checkoutItems, orderNumber);
        }

        return res.status(200).json({
          message: "Order already created for this idempotency key",
          order: formatOrder(existingOrder),
        });
      }

      throw error;
    }

    cart.items = [];
    cart.recalculate();
    cart.isLocked = false;
    cart.lockExpiresAt = new Date(0);
    await cart.save();

    await eventPublisher.publishOrderCreated(order);

    return res.status(201).json({
      message: "Order placed successfully",
      order: formatOrder(order),
    });
  } catch (error) {
    if (stockReserved && checkoutItems.length) {
      await inventoryClient.releaseStock(checkoutItems, `rollback-${Date.now()}`);
    }
    throw error;
  } finally {
    await Cart.updateOne(
      { userId },
      { $set: { isLocked: false, lockExpiresAt: new Date(0) } }
    );
  }
};

exports.getOrderHistory = async (req, res) => {
  const isPrivileged = ["admin", "pharmacist"].includes(req.user.role);
  const filter = isPrivileged ? {} : { userId: req.user.userId };

  const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(200);

  res.status(200).json({
    items: orders.map(formatOrder),
  });
};

exports.cancelOrder = async (req, res) => {
  const isPrivileged = ["admin", "pharmacist"].includes(req.user.role);
  const filter = isPrivileged
    ? { _id: req.params.orderId }
    : { _id: req.params.orderId, userId: req.user.userId };

  const order = await Order.findOne(filter);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  if (order.status === "cancelled") {
    return res.status(200).json({
      message: "Order is already cancelled",
      order: formatOrder(order),
    });
  }

  if (!USER_CANCELLABLE_STATUSES.includes(order.status)) {
    return res.status(409).json({
      message: `Order cannot be cancelled in '${order.status}' status`,
    });
  }

  const pickupSlotStartAt = getPickupSlotStartAt(order.pickupSlot);
  if (pickupSlotStartAt && Date.now() >= pickupSlotStartAt.getTime()) {
    return res.status(409).json({
      message: "Order can only be cancelled before the selected pickup slot time",
      pickupSlotStartAt: pickupSlotStartAt.toISOString(),
    });
  }

  if (["reserved", "deducted"].includes(order.inventoryStatus)) {
    const releaseItems = order.items.map((item) => ({
      medicineId: item.medicineId,
      quantity: item.quantity,
    }));

    try {
      const releaseResult = await inventoryClient.releaseStock(
        releaseItems,
        `cancel-${order.orderNumber || order._id}`
      );

      if (!releaseResult.ok) {
        return res.status(409).json({
          message: releaseResult.message || "Unable to release stock for cancellation",
          unavailable: releaseResult.unavailable || [],
        });
      }
    } catch (error) {
      return res.status(502).json({
        message: "Unable to cancel order right now. Please retry.",
        details: error.message,
      });
    }

    order.inventoryStatus = "released";
  }

  const previousStatus = order.status;
  const note = String(req.body.note || "").trim();

  order.status = "cancelled";
  order.statusHistory.push({
    status: "cancelled",
    updatedBy: req.user.userId,
    note: note || "Cancelled before pickup slot time",
  });

  await saveOrderSafely(order);
  await eventPublisher.publishOrderStatusUpdated(order, previousStatus);

  return res.status(200).json({
    message: "Order cancelled successfully",
    order: formatOrder(order),
  });
};

exports.getOrderById = async (req, res) => {
  const isPrivileged = ["admin", "pharmacist"].includes(req.user.role);
  const filter = isPrivileged
    ? { _id: req.params.orderId }
    : { _id: req.params.orderId, userId: req.user.userId };

  const order = await Order.findOne(filter);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  await hydrateOrderImages(order);
  return res.status(200).json({ order: formatOrder(order) });
};

exports.updateOrderStatus = async (req, res) => {
  const nextStatus = String(req.body.status || "").trim();
  const note = String(req.body.note || "").trim();

  if (!ORDER_STATUS.includes(nextStatus)) {
    return res.status(400).json({
      message: `Invalid status. Allowed: ${ORDER_STATUS.join(", ")}`,
    });
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const previousStatus = order.status;
  if (previousStatus === nextStatus) {
    return res.status(200).json({ order: formatOrder(order) });
  }

  order.status = nextStatus;

  order.statusHistory.push({
    status: nextStatus,
    updatedBy: req.user.userId,
    note,
  });

  await saveOrderSafely(order);
  await eventPublisher.publishOrderStatusUpdated(order, previousStatus);

  return res.status(200).json({
    message: "Order status updated",
    order: formatOrder(order),
  });
};

exports.updatePaymentStatusInternal = async (req, res) => {
  const paymentStatus = String(req.body.paymentStatus || "").trim().toLowerCase();
  const requestedOrderStatus = String(req.body.status || "").trim();

  if (!["pending", "paid", "failed", "refunded"].includes(paymentStatus)) {
    return res.status(400).json({
      message: "Invalid paymentStatus. Allowed: pending, paid, failed, refunded",
    });
  }

  const order = await Order.findById(req.params.orderId);
  if (!order) {
    return res.status(404).json({ message: "Order not found" });
  }

  const previousStatus = order.status;
  order.paymentStatus = paymentStatus;

  if (
    order.status === "cancelled" &&
    requestedOrderStatus &&
    requestedOrderStatus !== "cancelled"
  ) {
    // Keep cancelled orders terminal even if delayed events arrive.
  } else if (requestedOrderStatus && ORDER_STATUS.includes(requestedOrderStatus)) {
    order.status = requestedOrderStatus;
  } else if (
    paymentStatus === "paid" &&
    ["placed", "payment_pending"].includes(order.status)
  ) {
    order.status = "confirmed";
  } else if (
    paymentStatus === "failed" &&
    ["placed", "payment_pending"].includes(order.status)
  ) {
    order.status = "payment_pending";
  }

  order.statusHistory.push({
    status: order.status,
    updatedBy: "payment-service",
    note: `Payment status updated to ${paymentStatus}`,
  });

  await saveOrderSafely(order);

  if (order.status !== previousStatus) {
    await eventPublisher.publishOrderStatusUpdated(order, previousStatus);
  }

  return res.status(200).json({
    message: "Payment status synced successfully",
    order: formatOrder(order),
  });
};
