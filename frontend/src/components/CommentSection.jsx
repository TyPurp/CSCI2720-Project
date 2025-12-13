import { useState } from "react";
import useComments from "../hooks/useComments";
import { postComment } from "../api";
import styles from "./styles";
import useAuth from "../hooks/useAuth";


export default function CommentsSection({ locationId }) {
  const [comments, setComments] = useComments(locationId);

  const { user } = useAuth();
  const [text, setText] = useState('');



  const apiBase = process.env.REACT_APP_API_BASE_URL;


  const submit = async (e) => {
    e.preventDefault();
    const newComment = { username: user.username, text: text.trim(), createdAt: new Date().toISOString() };

    if (apiBase) {
      try {
        const created = await postComment(locationId, { username: newComment.username, text: newComment.text });
        // prefer backend response
        if (created) {
          setComments((prev) => [created, ...prev]);
          setText('');
          return;
        }
      } catch (err) {
        console.warn('postComment failed, falling back to localStorage', err);
      }
    }

    // fallback to localStorage
    const raw = localStorage.getItem(`comments_${locationId}`);
    const arr = raw ? JSON.parse(raw) : [];
    const toStore = [{ id: Date.now(), ...newComment }, ...arr];
    localStorage.setItem(`comments_${locationId}`, JSON.stringify(toStore));
    setComments(toStore);
    setText('');
  };

  return (
    <section style={{ marginTop: 16 }}>
      <h3>Comments</h3>
      <form onSubmit={submit} style={{ marginBottom: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <p><strong>{user?.username}</strong></p>
        </div>
        <div style={{ marginBottom: 8 }}>
          <textarea placeholder="Write a comment..." value={text} onChange={(e) => setText(e.target.value)} rows={3} style={{ padding: 6, width: '100%', maxWidth: 600 }} />
        </div>
        <button type="submit" style={styles.button}>Post Comment</button>
      </form>

      <div>
        {comments.length ? comments.map((c) => (
          <div key={c.id || c.createdAt} style={{ padding: 8, borderBottom: '1px solid #ddd' }}>
            <div style={{ fontWeight: 'bold' }}>{c.username}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{new Date(c.createdAt).toLocaleString()}</div>
            <div style={{ marginTop: 6 }}>{c.text}</div>
          </div>
        )) : <p>No comments yet — be the first!</p>}
      </div>
    </section>
  );
}