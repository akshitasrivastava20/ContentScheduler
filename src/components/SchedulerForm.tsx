"use client";
import { useState } from "react";

export default function SchedulerForm() {
  const [content, setContent] = useState("");
  const [time, setTime] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content,
        scheduledTime: new Date(time),
      }),
    });
    const data = await res.json();
    alert(data.success ? "Post scheduled!" : "Error scheduling post");
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 max-w-md mx-auto mt-10 p-4 border rounded-lg shadow"
    >
      <h2 className="text-xl font-semibold text-center">Schedule a Post</h2>

      <textarea
        placeholder="Write your post..."
        className="p-2 border rounded-md"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        required
      />

      <input
        type="datetime-local"
        className="p-2 border rounded-md"
        value={time}
        onChange={(e) => setTime(e.target.value)}
        required
      />

      <button
        type="submit"
        className="bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
      >
        Schedule Post
      </button>
    </form>
  );
}
