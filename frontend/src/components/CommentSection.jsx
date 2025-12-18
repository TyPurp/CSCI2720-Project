import { useState } from "react";
import useComments from "../hooks/useComments";
import { postComment } from "../api";
import useAuth from "../hooks/useAuth";

export default function CommentsSection({ locationId }) {
  const [comments, setComments] = useComments(locationId);
  const { user } = useAuth();
  const [text, setText] = useState("");

  const apiBase = process.env.REACT_APP_API_BASE_URL;

  const submit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newComment = {
      username: user.username,
      text: text.trim(),
      createdAt: new Date().toISOString(),
    };

    if (apiBase) {
      try {
        const created = await postComment(locationId, {
          username: newComment.username,
          text: newComment.text,
        });
        if (created) {
          setComments((prev) => [created, ...prev]);
          setText("");
          return;
        }
      } catch (err) {
        console.warn("postComment failed, falling back to localStorage", err);
      }
    }

    // Fallback to localStorage
    const raw = localStorage.getItem(`comments_${locationId}`);
    const arr = raw ? JSON.parse(raw) : [];
    const toStore = [{ id: Date.now(), ...newComment }, ...arr];
    localStorage.setItem(`comments_${locationId}`, JSON.stringify(toStore));
    setComments(toStore);
    setText("");
  };

  // Quick comment presets
  const quickComments = [
    "Worth going!",
    "Great!",
    "Improvement needed!",
    "Definitely need to have a try!",
  ];

  const handleQuickComment = (comment) => {
    setText(comment);
  };

  return (
    <section style={{ marginTop: 32, fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 20 }}>
        Comments
      </h3>

      {/* Comment Form */}
      <form onSubmit={submit} style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", marginBottom: 12 }}>
          <div
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              backgroundColor: "#538692ff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 16,
              marginRight: 12,
            }}
          >
            {user?.username?.[0]?.toUpperCase() || "U"}
          </div>
          <strong style={{ fontSize: 15 }}>{user?.username || "Guest"}</strong>
        </div>

        <textarea
          placeholder="Write a comment..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          style={{
            width: "100%",
            padding: "12px 14px",
            border: "1px solid #ddd",
            borderRadius: 12,
            fontSize: 15,
            resize: "vertical",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
          }}
        />

        {/* Quick Comment Buttons */}
        <div style={{ marginTop: 12, marginBottom: 12, display: "flex", flexWrap: "wrap", gap: 10 }}>
          {quickComments.map((comment) => (
            <button
              key={comment}
              type="button"
              onClick={() => handleQuickComment(comment)}
              style={{
                padding: "8px 16px",
                backgroundColor: text === comment ? "#538692ff" : "#f0f0f0",
                color: text === comment ? "white" : "#333",
                border: "1px solid #ccc",
                borderRadius: 20,
                fontSize: 14,
                fontWeight: 500,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
              onMouseOver={(e) => {
                if (text !== comment) {
                  e.currentTarget.style.backgroundColor = "#e0e0e0";
                }
              }}
              onMouseOut={(e) => {
                if (text !== comment) {
                  e.currentTarget.style.backgroundColor = "#f0f0f0";
                }
              }}
            >
              {comment}
            </button>
          ))}
        </div>

        {/* Post Button */}
        <button
          type="submit"
          disabled={!text.trim()}
          style={{
            backgroundColor: text.trim() ? "#538692ff" : "#ccc",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: 8,
            fontSize: 15,
            fontWeight: 500,
            cursor: text.trim() ? "pointer" : "not-allowed",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => text.trim() && (e.currentTarget.style.backgroundColor = "#436f79")}
          onMouseOut={(e) => text.trim() && (e.currentTarget.style.backgroundColor = "#538692ff")}
        >
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div>
        {comments.length > 0 ? (
          comments.map((c) => (
            <div
              key={c.id || c.createdAt}
              style={{
                display: "flex",
                gap: 12,
                padding: "16px 0",
                borderBottom: "1px solid #eee",
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  backgroundColor: "#538692ff",
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold",
                  fontSize: 15,
                  flexShrink: 0,
                }}
              >
                {c.username?.[0]?.toUpperCase() || "U"}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 15 }}>
                  {c.username}
                </div>
                <div style={{ fontSize: 13, color: "#888", marginBottom: 6 }}>
                  {new Date(c.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
                <div style={{ fontSize: 15, lineHeight: 1.5, color: "#333" }}>
                  {c.text}
                </div>
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#777", fontStyle: "italic", fontSize: 15 }}>
            No comments yet — be the first to leave one!
          </p>
        )}
      </div>
    </section>
  );
}