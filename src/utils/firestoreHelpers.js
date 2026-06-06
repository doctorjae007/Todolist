import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc
} from "firebase/firestore";

import { db } from "../firebase";

/** Fetch every document in a collection and return as { id, ...data }[]. */
export async function fetchCollection(name) {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

/** Add a document to a collection. Returns the new DocumentReference. */
export function addDocument(name, data) {
  return addDoc(collection(db, name), data);
}

/** Update fields on a single document. */
export function updateDocument(name, docId, data) {
  return updateDoc(doc(db, name, docId), data);
}
