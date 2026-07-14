import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { messagesApi } from "../api";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import "./Inbox.css";

export default function Inbox() {
  const { id } = useParams();
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    messagesApi
      .conversations()
      .then((res) => setConversations(res.data.conversations))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!id) {
      setThread(null);
      setMessages([]);
      return;
    }
    messagesApi
      .thread(id)
      .then((res) => {
        setThread(res.data.conversation);
        setMessages(res.data.messages);
      })
      .catch((err) => toast.error(err.message));
  }, [id]);

  async function send(e) {
    e.preventDefault();
    if (!id || !body.trim()) return;
    try {
      const res = await messagesApi.send(id, body);
      setMessages((prev) => [...prev, res.data.message]);
      setBody("");
    } catch (err) {
      toast.error(err.message);
    }
  }

  if (loading) return <Loader label="Loading inbox..." />;

  return (
    <div className="section">
      <div className="container inbox">
        <p className="section__eyebrow">Messages</p>
        <h1 className="section__title">Inbox</h1>
        {!conversations.length ? (
          <EmptyState
            title="No conversations"
            message="Message a host from any stay page."
            actionLabel="Explore"
            actionTo="/search"
          />
        ) : (
          <div className="inbox__layout">
            <aside className="inbox__list">
              {conversations.map((c) => (
                <Link
                  key={c._id}
                  to={`/messages/${c._id}`}
                  className={c._id === id ? "active" : ""}
                >
                  <strong>{c.hotel?.title}</strong>
                  <span>
                    {c.guest?.name} ↔ {c.host?.name}
                  </span>
                </Link>
              ))}
            </aside>
            <section className="inbox__thread">
              {!id ? (
                <p className="muted">Select a conversation</p>
              ) : (
                <>
                  <h2>{thread?.hotel?.title}</h2>
                  <div className="inbox__messages">
                    {messages.map((m) => (
                      <article key={m._id}>
                        <strong>{m.sender?.name}</strong>
                        <p>{m.body}</p>
                      </article>
                    ))}
                  </div>
                  <form onSubmit={send} className="inbox__compose">
                    <input
                      value={body}
                      onChange={(e) => setBody(e.target.value)}
                      placeholder="Write a message..."
                    />
                    <button className="btn btn--primary" type="submit">
                      Send
                    </button>
                  </form>
                </>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
