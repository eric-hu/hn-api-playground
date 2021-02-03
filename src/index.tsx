import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import "./index.css";
import reportWebVitals from "./reportWebVitals";

declare global {
  interface Window {
    jsonResponse: unknown;
  }
}

const fetchTopStories = () => {
  return fetch(
    "https://hacker-news.firebaseio.com/v0/topstories.json?print=pretty"
  ).then((response) => response.json());
};

const Foo = () => {
  const [result, setResult] = useState<unknown>();
  useEffect(() => {
    fetchTopStories().then((jsonResponse) => {
      window.jsonResponse = jsonResponse;
      setResult(jsonResponse.toString());
    });
  });

  return <div>{result as any}</div>;
};

ReactDOM.render(
  <React.StrictMode>
    <Foo />
  </React.StrictMode>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
