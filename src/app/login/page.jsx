"use client";
import { useState } from "react";
import { login } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Card, Typography, Input, Button, Space, Alert } from "antd";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(email.trim(), pw);
      router.push("/");
    } catch (err) {
      setError(err?.message || "Login failed");
      setBusy(false);
    }
  }

  async function handleAnon() {
    setBusy(true);
    setError("");
    try {
      await login(null, null); // anonymous
      router.push("/");
    } catch (err) {
      setError(err?.message || "Could not sign in anonymously");
      setBusy(false);
    }
  }

  return (
    <div className="page">
      <div className="mx-auto max-w-md">
        <Card>
          <Space direction="vertical" size="middle" style={{ width: "100%" }}>
            <div>
              <Typography.Title level={3} style={{ margin: 0 }}>Sign in</Typography.Title>
              <Typography.Text type="secondary">Use your account or continue as guest</Typography.Text>
            </div>

            {error ? <Alert type="error" message={error} /> : null}

            <form onSubmit={handleLogin} className="grid gap-3">
              <div>
                <Typography.Text>Email</Typography.Text>
                <Input
                  type="email"
                  value={email}
                  onChange={(e)=>setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <Typography.Text>Password</Typography.Text>
                <Input.Password
                  value={pw}
                  onChange={(e)=>setPw(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <Space>
                <Button type="primary" htmlType="submit" loading={busy}>Sign in</Button>
                <Button onClick={handleAnon} loading={busy}>Continue as guest</Button>
              </Space>
            </form>
          </Space>
        </Card>
      </div>
    </div>
  );
}
