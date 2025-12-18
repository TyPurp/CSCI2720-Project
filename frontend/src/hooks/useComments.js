/*
CSCI2720 Project:
Members:
Chow Ho Yee (1155214324)
Ho Chi Tung (1155213294)
Lam Tsz Yi (1155212543)
 */
import { useEffect, useState } from "react";
import { fetchComments } from "../api";

export default function useComments(venueId) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    let cancelled = false;
    if (process.env.REACT_APP_API_BASE_URL) {
      fetchComments(venueId).then((data) => {
        localStorage.setItem(`comments_${venueId}`, JSON.stringify(data));
        if (!cancelled) setComments(Array.isArray(data) ? data : []);
      }).catch(() => {
        const raw = localStorage.getItem(`comments_${venueId}`);
        if (!cancelled) setComments(raw ? JSON.parse(raw) : []);
      });
    } else {
      const raw = localStorage.getItem(`comments_${venueId}`);
      setComments(raw ? JSON.parse(raw) : []);
    }
    return () => { cancelled = true; };
  }, [venueId]);


  return [comments, setComments];
}