import { json, redirect } from "@remix-run/node";
import { useLoaderData, Form } from "@remix-run/react";
import { appSettings, updateThreads } from "../data/settings";

// Loader: fetch current threads
export const loader = async () => {
  return json({ threads: appSettings.threads });
};

// Action: update threads
export const action = async ({ request }) => {
  const formData = await request.formData();
  const threads = formData.get("threads") || "";
  // Split by comma, trim spaces, filter empty
  const newThreads = threads.split(",").map(t => t.trim()).filter(Boolean);
  updateThreads(newThreads);
  return redirect("/threads");
};

export default function ThreadsAdmin() {
  const { threads } = useLoaderData();

  return (
    <div style={{ padding: 20, fontFamily: "Arial, sans-serif" }}>
      <h1>Manage Threads</h1>
      <p>Enter thread colors separated by commas. Example: Red, Yellow, White</p>
      <Form method="post">
        <input
          type="text"
          name="threads"
          defaultValue={threads.join(", ")}
          style={{ width: "300px", padding: 5, marginRight: 10 }}
        />
        <button type="submit" style={{ padding: "5px 10px" }}>Save</button>
      </Form>

      <h3>Current Threads:</h3>
      <ul>
        {threads.map(t => <li key={t}>{t}</li>)}
      </ul>
    </div>
  );
}
