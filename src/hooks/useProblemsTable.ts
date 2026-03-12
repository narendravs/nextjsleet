import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { auth, firestore } from "../firebase/firebase";
import { useAuthState } from "react-firebase-hooks/auth";

export function useGetSolvedProblems() {
  const [solvedProblems, setSolvedProblems] = useState<string[]>([]);
  const [user] = useAuthState(auth);

  useEffect(() => {
    const getAndCacheSolvedProblems = async () => {
      // This function should only be called when user exists.
      if (!user) return;

      const userRef = doc(firestore, "users", user.uid);
      try {
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const freshData = userDoc.data().solvedProblems || [];
          setSolvedProblems(freshData);
          // Cache the fresh data with a user-specific key
          localStorage.setItem(
            `solvedProblems-${user.uid}`,
            JSON.stringify(freshData),
          );
        }
      } catch (error) {
        console.error("Error fetching solved problems:", error);
      }
    };

    if (user) {
      // On user load, first try to populate from cache for an instant UI update
      const cachedData = localStorage.getItem(`solvedProblems-${user.uid}`);
      if (cachedData) {
        setSolvedProblems(JSON.parse(cachedData));
      }
      // Then, fetch fresh data in the background to update the cache and UI
      getAndCacheSolvedProblems();
    } else {
      // User is logged out, clear the state.
      setSolvedProblems([]);
    }
  }, [user]);

  return solvedProblems;
}
