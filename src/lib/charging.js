import { db } from "@/lib/firebase";
import {
  addDoc, collection, deleteDoc, doc, getDoc, getDocs,
  limit, orderBy, query, setDoc, updateDoc, where
} from "firebase/firestore";

/** Priority formula (lower is sooner) */
export function computePriority(cart, reason) {
  const base = cart?.batteryType === "lead-acid" ? 50 : 60; // lead-acid slightly sooner
  const rentalBoost = cart?.status === "rental" ? -20 : 0;
  const reservedBoost = Array.isArray(cart?.tags) && cart.tags.join(",").toLowerCase().includes("test drive")
    ? -10
    : 0;
  const reasonBoost =
    reason === "low_soc" ? -15 :
    reason === "post_service" ? -8 :
    reason === "scheduled_cycle" ? -5 : 0;

  return base + rentalBoost + reservedBoost + reasonBoost;
}

/** Minimal defaults if you don't want to create /chargePlans docs yet */
function getPlanForCart(cart) {
  if ((cart?.batteryType || "").toLowerCase() === "lead-acid") {
    return {
      id: "lead-acid-default",
      batteryType: "lead-acid",
      minSoCToQueue: 40,
      targetSoC: 100,
      dwellMinutesAfterFull: 30,
      restWindowHours: 12
    };
  }
  return {
    id: "lithium-default",
    batteryType: "lithium",
    minSoCToQueue: 40,
    targetSoC: 90,
    dwellMinutesAfterFull: 0,
    restWindowHours: 0
  };
}

/** Queue a cart by id with a reason */
export async function enqueueCart(cartId, reason = "low_soc") {
  const cartRef = doc(db, "carts", cartId);
  const snap = await getDoc(cartRef);
  if (!snap.exists()) throw new Error("Cart not found");
  const cart = snap.data();

  // If SoC known, gate on minSoC
  const plan = getPlanForCart(cart);
  const soc = Number(cart.soc ?? NaN);
  if (!Number.isNaN(soc) && soc >= plan.minSoCToQueue) {
    throw new Error(`Cart SoC ${soc}% is above min (${plan.minSoCToQueue}%)`);
  }

  // Prevent duplicate queue entries for same cart
  const qDup = query(collection(db, "chargeQueue"), where("cartId", "==", cartId), limit(1));
  const dupSnap = await getDocs(qDup);
  if (!dupSnap.empty) return dupSnap.docs[0].id;

  const priority = computePriority(cart, reason);
  const docRef = await addDoc(collection(db, "chargeQueue"), {
    cartId,
    requestedAt: new Date().toISOString(),
    reason,
    planId: plan.id,
    priority
  });
  return docRef.id;
}

/** Assign next eligible queue entry to a single free bay */
export async function assignNextToBay(bayId) {
  const bayRef = doc(db, "chargingBays", bayId);
  const baySnap = await getDoc(bayRef);
  if (!baySnap.exists()) throw new Error("Bay not found");
  const bay = baySnap.data();
  if (bay.currentCartId) throw new Error("Bay is occupied");

  // Pull the highest priority item (priority asc, then requestedAt asc)
  const q = query(
    collection(db, "chargeQueue"),
    orderBy("priority", "asc"),
    orderBy("requestedAt", "asc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) throw new Error("Queue is empty");
  const entry = { id: snap.docs[0].id, ...snap.docs[0].data() };

  await updateDoc(bayRef, {
    currentCartId: entry.cartId,
    pluggedInSince: null,
    active: true
  });

  await deleteDoc(doc(db, "chargeQueue", entry.id));
  return entry.cartId;
}

/** Assign next to all free bays */
export async function assignNextToFreeBays() {
  const bays = await getDocs(collection(db, "chargingBays"));
  const free = [];
  bays.forEach(d => {
    const b = d.data();
    if (!b.currentCartId && b.active !== false) free.push(d.id);
  });

  const results = [];
  for (const bayId of free) {
    try {
      const cartId = await assignNextToBay(bayId);
      results.push({ bayId, cartId });
    } catch (_) {
      // likely queue empty
    }
  }
  return results;
}

/** Mark a bay as plugged in now */
export async function markPluggedIn(bayId) {
  await updateDoc(doc(db, "chargingBays", bayId), {
    pluggedInSince: new Date().toISOString()
  });
}

/** Complete charge: update cart + clear bay, then optionally auto-assign next */
export async function markChargeComplete(bayId, opts = { autoAssignNext: false }) {
  const bayRef = doc(db, "chargingBays", bayId);
  const baySnap = await getDoc(bayRef);
  if (!baySnap.exists()) throw new Error("Bay not found");
  const bay = baySnap.data();
  const cartId = bay.currentCartId;
  if (!cartId) throw new Error("No cart in this bay");

  // Update cart: lastFullChargeAt and set soc to healthy target
  const cartRef = doc(db, "carts", cartId);
  const cSnap = await getDoc(cartRef);
  if (cSnap.exists()) {
    const cart = cSnap.data();
    const plan = getPlanForCart(cart);
    await updateDoc(cartRef, {
      lastFullChargeAt: new Date().toISOString(),
      soc: plan.targetSoC
    });
  }

  // Clear bay
  await updateDoc(bayRef, {
    currentCartId: null,
    pluggedInSince: null
  });

  if (opts.autoAssignNext) {
    try {
      await assignNextToBay(bayId);
    } catch {
      // ignore if queue empty
    }
  }
}

/** Add a charging bay */
export async function addBay(name) {
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  await setDoc(doc(db, "chargingBays", id || `bay-${Date.now()}`), {
    name: name || `Bay ${new Date().toLocaleTimeString()}`,
    active: true,
    currentCartId: null,
    pluggedInSince: null
  });
}
