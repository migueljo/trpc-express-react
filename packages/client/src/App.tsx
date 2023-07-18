import "./index.scss";
import React, { useCallback, useState } from "react";
import ReactDOM from "react-dom";
import { httpBatchLink } from "@trpc/client";
import {
  QueryClient,
  QueryClientProvider,
  useQueryClient,
} from "@tanstack/react-query";

import { trpc } from "./trpc";
import { getQueryKey } from "@trpc/react-query";

const queryClient = new QueryClient();

const AppContent = () => {
  const client = useQueryClient();
  const hello = trpc.hi.useQuery();
  const messages = trpc.getMessage.useQuery({ size: 100 });
  const addMessage = trpc.addMessage.useMutation();
  const [user, setUser] = useState("");
  const [message, setMessage] = useState("");

  console.log("Key", getQueryKey(trpc.getMessage));

  const handleAddMessage = useCallback(() => {
    addMessage.mutate(
      {
        user,
        message,
      },
      {
        onSuccess: async () => {
          await client.invalidateQueries(getQueryKey(trpc.getMessage));
        },
      }
    );
  }, []);

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl p-10">
      <input
        type="text"
        value={user}
        onChange={(e) => setUser(e.target.value)}
        className="p-5 border-2 border-gray-300 rounded-lg w-full mb-5"
        placeholder="User"
      />
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="p-5 border-2 border-gray-300 rounded-lg w-full mb-5"
        placeholder="Message"
      />
      <button type="button" onClick={handleAddMessage}>
        Add new message
      </button>
      <br />
      <p>{JSON.stringify(hello.data, null, 2)}</p>
      <p>{JSON.stringify(messages.data, null, 2)}</p>
    </div>
  );
};

const App = () => {
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: "http://localhost:8080/trpc",
        }),
      ],
    })
  );

  return (
    <trpc.Provider queryClient={queryClient} client={trpcClient}>
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </trpc.Provider>
  );
};

ReactDOM.render(<App />, document.getElementById("app"));
