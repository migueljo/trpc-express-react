import "./index.scss";
import React from "react";
import ReactDOM from "react-dom";
import { httpBatchLink } from "@trpc/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { trpc } from "./trpc";

const queryClient = new QueryClient();

const AppContent = () => {
  const hello = trpc.hi.useQuery();
  const messages = trpc.getMessage.useQuery();

  console.log("Messages", messages.data);

  return (
    <div className="mt-10 text-3xl mx-auto max-w-6xl">
      <p>{JSON.stringify(hello.data, null, 2)}</p>
      {JSON.stringify(messages.data, null, 2)}
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
