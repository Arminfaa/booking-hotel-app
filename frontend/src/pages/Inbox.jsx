import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Button, Card, Col, Empty, Flex, Input, Row, Typography } from "antd";
import toast from "react-hot-toast";
import { messagesApi } from "../api";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/ui/EmptyState";
import { tw } from "../styles/tw";

export default function Inbox() {
  const { id } = useParams();
  const [conversations, setConversations] = useState([]);
  const [thread, setThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

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
    setSending(true);
    try {
      const res = await messagesApi.send(id, body);
      setMessages((prev) => [...prev, res.data.message]);
      setBody("");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSending(false);
    }
  }

  if (loading) return <Loader label="Loading inbox..." />;

  return (
    <div className={tw.page}>
      <div className={tw.container}>
        <span className={tw.eyebrow}>Messages</span>
        <Typography.Title level={1}>Inbox</Typography.Title>
        {!conversations.length ? (
          <EmptyState
            title="No conversations"
            message="Message a host from any stay page."
            actionLabel="Explore"
            actionTo="/search"
          />
        ) : (
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card
                className="min-h-[480px] shadow-[0_12px_32px_rgba(0,0,0,0.22)]"
                title="Conversations"
              >
                <Flex vertical gap={8}>
                  {conversations.map((c) => (
                    <Link
                      key={c._id}
                      to={`/messages/${c._id}`}
                      className={[
                        "block rounded-cove-sm border border-transparent px-3.5 py-3 transition-colors hover:bg-sea/8",
                        c._id === id ? "border-sea/28 bg-sea/14" : "",
                      ].join(" ")}
                    >
                      <Typography.Text strong>{c.hotel?.title}</Typography.Text>
                      <Typography.Text type="secondary" className="block text-[13px]">
                        {c.guest?.name} ↔ {c.host?.name}
                      </Typography.Text>
                    </Link>
                  ))}
                </Flex>
              </Card>
            </Col>
            <Col xs={24} md={16}>
              <Card className="min-h-[480px] shadow-[0_12px_32px_rgba(0,0,0,0.22)]">
                {!id ? (
                  <Empty description="Select a conversation" />
                ) : (
                  <>
                    <Typography.Title level={4}>{thread?.hotel?.title}</Typography.Title>
                    <div className="my-4 grid max-h-[360px] gap-3 overflow-auto pr-1">
                      {messages.map((m) => (
                        <div
                          key={m._id}
                          className="rounded-[14px] border border-line bg-paper/55 px-4 py-3.5"
                        >
                          <Typography.Text strong>{m.sender?.name}</Typography.Text>
                          <Typography.Paragraph className="!mt-1 !mb-0">
                            {m.body}
                          </Typography.Paragraph>
                        </div>
                      ))}
                    </div>
                    <form onSubmit={send} className="grid grid-cols-[1fr_auto] gap-2.5">
                      <Input
                        size="large"
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Write a message..."
                      />
                      <Button type="primary" htmlType="submit" loading={sending} size="large">
                        Send
                      </Button>
                    </form>
                  </>
                )}
              </Card>
            </Col>
          </Row>
        )}
      </div>
    </div>
  );
}
